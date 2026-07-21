use crate::monitoring::Metrics;
use actix_web::{post, web, HttpResponse};
use base64::Engine;
use craftping::sync::ping;
use hickory_resolver::config::ResolverConfig;
use hickory_resolver::name_server::TokioConnectionProvider;
use hickory_resolver::TokioAsyncResolver;
use serde::{Deserialize, Serialize};
use std::time::Instant;
use tokio::net::TcpStream;
use tokio::task;
use tokio::time::{timeout, Duration};

#[derive(Clone, Serialize, Deserialize, Eq, PartialEq)]
struct ServerStatus {
    status: u16,
    online: bool,
    host: String,
    port: u16,
    version: String,
    protocol: i32,
    players: PlayersInfo,
    motd: String,
    favicon: Option<String>,
    round_trip_latency: u128,
}

#[derive(Clone, Serialize, Deserialize, Eq, PartialEq)]
struct PlayersInfo {
    online: usize,
    max: usize,
    sample: Vec<PlayerSample>,
}

#[derive(Clone, Serialize, Deserialize, Eq, PartialEq)]
struct PlayerSample {
    name: String,
    uuid: String,
}

#[derive(Deserialize)]
struct PingRequest {
    host: String,
    port: u16,
}

async fn resolve_minecraft_srv(host: &str, port: u16) -> (String, u16) {
    use hickory_resolver::config::{ResolverConfig, ResolverOpts};

    let resolver = TokioAsyncResolver::new(
        ResolverConfig::default(),
        ResolverOpts::default(),
        TokioConnectionProvider::default(),
    );

    let srv_name = format!("_minecraft._tcp.{}", host);
    match resolver.srv_lookup(&srv_name).await {
        Ok(records) => {
            if let Some(srv) = records.iter().next() {
                let target = srv.target().to_string();
                let target = target.trim_end_matches('.');
                let real_port = srv.port();

                (target.to_string(), real_port)
            } else {
                (host.to_string(), port)
            }
        }
        Err(_) => (host.to_string(), port),
    }
}

#[post("/get_status")]
pub async fn get_status(_data: web::Data<Metrics>, body: web::Json<PingRequest>) -> HttpResponse {
    let host = body.host.clone();
    let port = body.port;

    let start_time = Instant::now();

    let (connect_host, connect_port) = resolve_minecraft_srv(&host, port).await;

    let connect_future = TcpStream::connect((connect_host.as_str(), connect_port));

    match timeout(Duration::from_secs(5), connect_future).await {
        Ok(Ok(stream)) => {
            let mut std_stream = match stream.into_std() {
                Ok(s) => {
                    if let Err(e) = s.set_nonblocking(false) {
                        eprintln!("{:?}", e);
                        return HttpResponse::InternalServerError().body("内部错误");
                    }
                    s
                }
                Err(e) => {
                    eprintln!("{:?}", e);
                    return HttpResponse::InternalServerError().body("内部错误");
                }
            };

            let handshake_host = host.clone();

            let ping_result = timeout(
                Duration::from_secs(5),
                task::spawn_blocking(move || ping(&mut std_stream, &handshake_host, connect_port)),
            )
            .await;

            match ping_result {
                Ok(Ok(Ok(pong))) => {
                    let latency = start_time.elapsed().as_millis();

                    let sample_players = match pong.sample {
                        Some(players) => players
                            .into_iter()
                            .map(|p| PlayerSample {
                                name: p.name,
                                uuid: p.id,
                            })
                            .collect(),
                        None => vec![],
                    };

                    let status_result = ServerStatus {
                        status: 200,
                        online: true,
                        host: host.to_string(),
                        port,
                        version: pong.version,
                        protocol: pong.protocol,
                        players: PlayersInfo {
                            online: pong.online_players,
                            max: pong.max_players,
                            sample: sample_players,
                        },
                        motd: extract_motd_text(&Some(
                            serde_json::to_value(&pong.description).unwrap(),
                        )),
                        favicon: pong
                            .favicon
                            .map(|bytes| base64::engine::general_purpose::STANDARD.encode(&bytes)),
                        round_trip_latency: latency,
                    };

                    HttpResponse::Ok().json(status_result)
                }
                Ok(Ok(Err(e))) => HttpResponse::BadGateway().body(format!("握手失败: {:?}", e)),
                Ok(Err(_)) => HttpResponse::InternalServerError().body("内部错误"),
                Err(_) => HttpResponse::GatewayTimeout().body("握手超时"),
            }
        }
        Ok(Err(e)) => {
            let msg = if e.raw_os_error() == Some(11001) {
                format!("无法解析主机名 '{}'，请检查地址是否正确", connect_host)
            } else {
                format!("连接失败: {}", e)
            };

            HttpResponse::BadGateway().body(msg)
        }
        Err(_) => {
            eprintln!("TCP 连接超时");
            HttpResponse::GatewayTimeout().body("连接超时")
        }
    }
}

fn extract_motd_text(value: &Option<serde_json::Value>) -> String {
    match value {
        Some(v) => {
            if let Some(s) = v.as_str() {
                return s.to_string();
            }
            let mut text = String::new();
            if let Some(t) = v.get("text").and_then(|v| v.as_str()) {
                text.push_str(t);
            }
            if let Some(extra) = v.get("extra").and_then(|v| v.as_array()) {
                for item in extra {
                    text.push_str(&extract_motd_text(&Some(item.clone())));
                }
            }
            if let Some(with) = v.get("with").and_then(|v| v.as_array()) {
                for item in with {
                    text.push_str(&extract_motd_text(&Some(item.clone())));
                }
            }
            if text.is_empty() { v.to_string() } else { text }
        }
        None => "".to_string(),
    }
}

use actix_cors::Cors;
use actix_files::Files;
use actix_web::dev::Service;
use actix_web::{middleware, web, App, HttpResponse, HttpServer};
use std::io::Write;
use std::time::Instant;

use crate::config::AppConfig;
use crate::monitoring::{get_metrics, health_check, Metrics};

mod config;
mod craftping;
mod deploy;
mod monitoring;

async fn not_found_handler() -> HttpResponse {
    match std::fs::read("./static/404.html") {
        Ok(body) => HttpResponse::NotFound()
            .content_type("text/html; charset=utf-8")
            .body(body),
        Err(_) => HttpResponse::NotFound()
            .content_type("text/plain; charset=utf-8")
            .body("404 Not Found"),
    }
}

async fn favicon_redirect() -> HttpResponse {
    HttpResponse::Found()
        .append_header(("Location", "https://assets.mcyzw.top/favicon.ico"))
        .append_header(("Cache-Control", "public, max-age=86400"))
        .finish()
}

#[actix_web::main]
async fn main() -> anyhow::Result<()> {
    let config = AppConfig::load()?;
    let config_data = web::Data::new(config.clone());

    std::fs::create_dir_all("logs")?;

    let metrics = Metrics::new();

    let metrics_for_writer = metrics.clone();
    tokio::spawn(async move {
        let mut interval = tokio::time::interval(std::time::Duration::from_secs(10));
        loop {
            interval.tick().await;
            let stats = metrics_for_writer.get_stats().await;
            let line = format!(
                "[{}] 运行秒数:{} 总请求:{} 活跃连接:{} 错误数:{} 平均响应:{}ms 请求速率:{:.2}/s\n",
                chrono::Utc::now().format("%Y-%m-%d %H:%M:%S"),
                stats["uptime_seconds"],
                stats["total_requests"],
                stats["active_connections"],
                stats["error_count"],
                stats["avg_response_time_ms"],
                stats["request_rate_per_second"].as_f64().unwrap_or(0.0),
            );
            if let Ok(mut file) = std::fs::OpenOptions::new()
                .create(true)
                .append(true)
                .open("logs/stats.log")
            {
                let _ = file.write_all(line.as_bytes());
            }
        }
    });

    HttpServer::new(move || {
        let cors = Cors::default()
            .allow_any_origin()
            .allow_any_method()
            .allow_any_header()
            .max_age(3600);

        let api_scope = web::scope("/api")
            .route("/health", web::get().to(health_check))
            .route("/metrics", web::get().to(get_metrics))
            .service(
                web::resource("/deploy")
                    .app_data(web::PayloadConfig::new(100 * 1024 * 1024))
                    .route(web::post().to(deploy::deploy)),
            );

        let api_scope = api_scope.service(web::scope("/craftping").service(craftping::get_status));

        App::new()
            .app_data(web::Data::new(metrics.clone()))
            .app_data(config_data.clone())
            .wrap(middleware::Logger::default())
            .wrap(middleware::Compress::default())
            .wrap_fn(|req, srv| {
                let start = Instant::now();
                let metrics = req.app_data::<web::Data<Metrics>>().unwrap().clone();
                let method = req.method().to_string();
                let path = req.path().to_string();
                let query = req.query_string().to_string();

                metrics.increment_request();
                metrics.increment_connection();

                let fut = srv.call(req);

                async move {
                    let res = fut.await;
                    let duration = start.elapsed();

                    metrics.record_duration(duration);
                    metrics.decrement_connection();

                    let status = match &res {
                        Ok(r) => r.status().as_u16(),
                        Err(_) => 0,
                    };

                    if let Ok(response) = &res
                        && response.status().is_server_error()
                    {
                        metrics.increment_error();
                    }

                    let query_part = if query.is_empty() {
                        String::new()
                    } else {
                        format!("?{}", query)
                    };
                    let line = format!(
                        "[{}] {} {}{} -> {} ({:?})\n",
                        chrono::Utc::now().format("%Y-%m-%d %H:%M:%S"),
                        method,
                        path,
                        query_part,
                        status,
                        duration,
                    );
                    tokio::spawn(async move {
                        if let Ok(mut file) = std::fs::OpenOptions::new()
                            .create(true)
                            .append(true)
                            .open("logs/requests.log")
                        {
                            let _ = file.write_all(line.as_bytes());
                        }
                    });

                    res
                }
            })
            .service(api_scope)
            .service(web::resource("/favicon.ico").route(web::get().to(favicon_redirect)))
            .service(
                Files::new("/", "./static")
                    .index_file("index.html")
                    .default_handler(web::to(not_found_handler)),
            )
            .wrap(cors)
    })
    .workers(config.server.workers.unwrap_or(num_cpus::get()))
    .bind(("0.0.0.0", config.server.port))?
    .run()
    .await?;

    Ok(())
}

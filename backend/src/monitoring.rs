use actix_web::{HttpResponse, Responder, web};
use serde_json::json;
use std::sync::Arc;
use std::sync::atomic::{AtomicU64, AtomicUsize};
use std::time::{Duration, SystemTime};

#[derive(Clone)]
pub struct Metrics {
    pub total_requests: Arc<AtomicU64>,
    pub active_connections: Arc<AtomicUsize>,
    pub request_durations: Arc<tokio::sync::Mutex<Vec<Duration>>>,
    pub error_count: Arc<AtomicU64>,
    pub started_at: SystemTime,
}

impl Metrics {
    pub fn new() -> Self {
        Self {
            total_requests: Arc::new(AtomicU64::new(0)),
            active_connections: Arc::new(AtomicUsize::new(0)),
            request_durations: Arc::new(tokio::sync::Mutex::new(Vec::new())),
            error_count: Arc::new(AtomicU64::new(0)),
            started_at: SystemTime::now(),
        }
    }

    pub fn increment_request(&self) {
        self.total_requests
            .fetch_add(1, std::sync::atomic::Ordering::Relaxed);
    }

    pub fn increment_connection(&self) {
        self.active_connections
            .fetch_add(1, std::sync::atomic::Ordering::Relaxed);
    }

    pub fn decrement_connection(&self) {
        self.active_connections
            .fetch_sub(1, std::sync::atomic::Ordering::Relaxed);
    }

    pub fn increment_error(&self) {
        self.error_count
            .fetch_add(1, std::sync::atomic::Ordering::Relaxed);
    }

    pub fn record_duration(&self, duration: Duration) {
        let durations = self.request_durations.clone();
        tokio::spawn(async move {
            let mut lock = durations.lock().await;
            lock.push(duration);

            if lock.len() > 1000 {
                lock.remove(0);
            }
        });
    }

    pub async fn get_stats(&self) -> serde_json::Value {
        let uptime = self.started_at.elapsed().unwrap_or_default();
        let requests = self
            .total_requests
            .load(std::sync::atomic::Ordering::Relaxed);
        let connections = self
            .active_connections
            .load(std::sync::atomic::Ordering::Relaxed);
        let errors = self.error_count.load(std::sync::atomic::Ordering::Relaxed);

        let durations = self.request_durations.lock().await;
        let avg_duration = if !durations.is_empty() {
            let sum: Duration = durations.iter().sum();
            sum.as_millis() as f64 / durations.len() as f64
        } else {
            0.0
        };

        json!({
            "uptime_seconds": uptime.as_secs(),
            "total_requests": requests,
            "active_connections": connections,
            "error_count": errors,
            "avg_response_time_ms": avg_duration,
            "request_rate_per_second": requests as f64 / uptime.as_secs_f64()
        })
    }
}

pub async fn get_metrics(data: web::Data<Metrics>) -> impl Responder {
    let stats = data.get_stats().await;
    HttpResponse::Ok().json(stats)
}

pub async fn health_check() -> impl Responder {
    HttpResponse::Ok().json(json!({
        "status": "ok",
        "timestamp": chrono::Utc::now().to_rfc3339()
    }))
}

use config::{Config, ConfigError, File};
use serde::Deserialize;

#[derive(Debug, Deserialize, Clone)]
pub struct AppConfig {
    pub server: ServerConfig,
    pub deploy: DeployConfig,
}

#[derive(Debug, Deserialize, Clone)]
pub struct ServerConfig {
    pub port: u16,
    pub workers: Option<usize>,
}

#[derive(Debug, Deserialize, Clone)]
pub struct DeployConfig {
    pub key: String,
    pub static_dir: Option<String>,
    pub bak_dir: Option<String>,
}

impl AppConfig {
    pub fn load() -> Result<Self, ConfigError> {
        let s = Config::builder()
            .add_source(File::with_name("config"))
            .add_source(config::Environment::with_prefix("APP"))
            .build()?;

        s.try_deserialize()
    }
}

use actix_web::{web, HttpRequest, HttpResponse, Responder};
use anyhow::Result;
use std::io::{Cursor, Read};
use std::path::{Path, PathBuf};
use subtle::ConstantTimeEq;

pub async fn deploy(
    req: HttpRequest,
    body: web::Bytes,
    cfg: web::Data<crate::config::AppConfig>,
) -> impl Responder {
    // 1. 校验 token
    let provided = match req
        .headers()
        .get("X-Deploy-Token")
        .and_then(|h| h.to_str().ok())
    {
        Some(t) => t,
        None => {
            return HttpResponse::Unauthorized()
                .json(serde_json::json!({"ok":false,"error":"missing token"}));
        }
    };
    if !bool::from(provided.as_bytes().ct_eq(cfg.deploy.key.as_bytes())) {
        return HttpResponse::Unauthorized()
            .json(serde_json::json!({"ok":false,"error":"invalid token"}));
    }

    let static_dir = PathBuf::from(
        cfg.deploy
            .static_dir
            .clone()
            .unwrap_or_else(|| "./static".into()),
    );
    let bak_dir = PathBuf::from(cfg.deploy.bak_dir.clone().unwrap_or_else(|| "./bak".into()));

    match do_deploy(&body, &static_dir, &bak_dir) {
        Ok(_) => HttpResponse::Ok().json(serde_json::json!({"ok":true})),
        Err(e) => HttpResponse::InternalServerError()
            .json(serde_json::json!({"ok":false,"error":e.to_string()})),
    }
}

fn do_deploy(body: &[u8], static_dir: &Path, bak_dir: &Path) -> Result<()> {
    // 2. 清空 bak
    if bak_dir.exists() {
        std::fs::remove_dir_all(bak_dir)?;
    }
    std::fs::create_dir_all(bak_dir)?;

    // 3. 备份 static -> bak
    if static_dir.exists() {
        copy_dir_recursive(static_dir, bak_dir)?;
    }

    // 4. 确保 static 存在
    std::fs::create_dir_all(static_dir)?;

    // 5. 解压 zip -> static（带路径穿越防护）
    let mut archive = zip::ZipArchive::new(Cursor::new(body.to_vec()))?;
    for i in 0..archive.len() {
        let mut file = archive.by_index(i)?;
        let name = match file.enclosed_name() {
            Some(n) => n.to_path_buf(),
            None => continue, // 含 ../ 的危险条目，跳过
        };
        let out_path = static_dir.join(&name);
        if !out_path.starts_with(static_dir) {
            continue; // 双重保险
        }
        if file.is_dir() {
            std::fs::create_dir_all(&out_path)?;
        } else {
            if let Some(parent) = out_path.parent() {
                std::fs::create_dir_all(parent)?;
            }
            let mut buf = Vec::new();
            file.read_to_end(&mut buf)?;
            std::fs::write(&out_path, &buf)?;
        }
    }
    Ok(())
}

fn copy_dir_recursive(src: &Path, dst: &Path) -> Result<()> {
    for entry in std::fs::read_dir(src)? {
        let entry = entry?;
        let path = entry.path();
        let target = dst.join(entry.file_name());
        if path.is_dir() {
            std::fs::create_dir_all(&target)?;
            copy_dir_recursive(&path, &target)?;
        } else {
            if let Some(parent) = target.parent() {
                std::fs::create_dir_all(parent)?;
            }
            std::fs::copy(&path, &target)?;
        }
    }
    Ok(())
}

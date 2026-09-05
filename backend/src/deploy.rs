use actix_web::{web, HttpRequest, HttpResponse, Responder};
use anyhow::{anyhow, Result};
use std::fs::{self, File};
use std::io::Cursor;
use std::path::{Path, PathBuf};
use std::sync::{Mutex, OnceLock};
use subtle::ConstantTimeEq;
use std::time::{SystemTime, UNIX_EPOCH};

static DEPLOY_LOCK: OnceLock<Mutex<()>> = OnceLock::new();

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

    let result = web::block(move || do_deploy(&body, &static_dir, &bak_dir)).await;
    match result {
        Ok(Ok(())) => HttpResponse::Ok().json(serde_json::json!({"ok":true})),
        Ok(Err(e)) => HttpResponse::InternalServerError()
            .json(serde_json::json!({"ok":false,"error":e.to_string()})),
        Err(e) => HttpResponse::InternalServerError()
            .json(serde_json::json!({"ok":false,"error":e.to_string()})),
    }
}

fn do_deploy(body: &[u8], static_dir: &Path, bak_dir: &Path) -> Result<()> {
    let _guard = DEPLOY_LOCK
        .get_or_init(|| Mutex::new(()))
        .lock()
        .map_err(|_| anyhow!("deployment lock is poisoned"))?;

    // Build the complete release away from the directory currently being served.
    let staging_dir = create_staging_dir(static_dir)?;
    let result = (|| {
        extract_archive(body, &staging_dir)?;
        if !staging_dir.join("index.html").is_file() {
            return Err(anyhow!("deployment archive is missing root index.html"));
        }

        if bak_dir.exists() {
            fs::remove_dir_all(bak_dir)?;
        }
        fs::create_dir_all(bak_dir)?;
        if static_dir.exists() {
            copy_dir_recursive(static_dir, bak_dir)?;
        }

        publish_tree(&staging_dir, static_dir)
    })();

    // If archive preparation fails, the live tree remains untouched. Cleanup
    // errors should not hide the original deployment error.
    let _ = fs::remove_dir_all(&staging_dir);
    result
}

fn create_staging_dir(static_dir: &Path) -> Result<PathBuf> {
    let parent = static_dir
        .parent()
        .filter(|path| !path.as_os_str().is_empty())
        .unwrap_or_else(|| Path::new("."));
    fs::create_dir_all(parent)?;

    let name = static_dir
        .file_name()
        .ok_or_else(|| anyhow!("static directory has no file name"))?
        .to_string_lossy();
    let timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_nanos())
        .unwrap_or_default();

    for attempt in 0..100 {
        let candidate = parent.join(format!(
            ".{name}.staging-{}-{timestamp}-{attempt}",
            std::process::id()
        ));
        match fs::create_dir(&candidate) {
            Ok(()) => return Ok(candidate),
            Err(error) if error.kind() == std::io::ErrorKind::AlreadyExists => continue,
            Err(error) => return Err(error.into()),
        }
    }

    Err(anyhow!("could not create a unique staging directory"))
}

fn extract_archive(body: &[u8], staging_dir: &Path) -> Result<()> {
    let mut archive = zip::ZipArchive::new(Cursor::new(body))?;
    for i in 0..archive.len() {
        let mut file = archive.by_index(i)?;
        let name = match file.enclosed_name() {
            Some(name) => name.to_path_buf(),
            None => continue,
        };
        let out_path = staging_dir.join(&name);
        if !out_path.starts_with(staging_dir) {
            continue;
        }

        if file.is_dir() {
            fs::create_dir_all(&out_path)?;
            continue;
        }

        if let Some(parent) = out_path.parent() {
            fs::create_dir_all(parent)?;
        }
        let mut output = File::create(&out_path)?;
        std::io::copy(&mut file, &mut output)?;
    }
    Ok(())
}

fn publish_tree(staging_dir: &Path, static_dir: &Path) -> Result<()> {
    fs::create_dir_all(static_dir)?;

    let mut files = Vec::new();
    collect_files(staging_dir, staging_dir, &mut files)?;
    files.sort();

    // Publish every resource before switching the entry point. Existing clients
    // can therefore continue using the old index while the new tree is copied.
    for relative in files.iter().filter(|path| path.as_path() != Path::new("index.html")) {
        atomic_copy(&staging_dir.join(relative), &static_dir.join(relative))?;
    }
    atomic_copy(
        &staging_dir.join("index.html"),
        &static_dir.join("index.html"),
    )?;
    Ok(())
}

fn collect_files(root: &Path, current: &Path, files: &mut Vec<PathBuf>) -> Result<()> {
    for entry in fs::read_dir(current)? {
        let entry = entry?;
        let path = entry.path();
        if path.is_dir() {
            collect_files(root, &path, files)?;
        } else {
            files.push(path.strip_prefix(root)?.to_path_buf());
        }
    }
    Ok(())
}

fn atomic_copy(src: &Path, dst: &Path) -> Result<()> {
    let parent = dst
        .parent()
        .ok_or_else(|| anyhow!("destination has no parent directory"))?;
    fs::create_dir_all(parent)?;

    let name = dst
        .file_name()
        .ok_or_else(|| anyhow!("destination has no file name"))?
        .to_string_lossy();
    let timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_nanos())
        .unwrap_or_default();
    let temporary = parent.join(format!(".{name}.deploy-{}-{timestamp}", std::process::id()));

    fs::copy(src, &temporary)?;
    match fs::rename(&temporary, dst) {
        Ok(()) => Ok(()),
        // Windows does not replace an existing file with rename. Keep a small
        // copy of the previous file while doing the fallback replacement so a
        // failed rename can restore it.
        Err(error) if error.kind() == std::io::ErrorKind::AlreadyExists => {
            let backup = parent.join(format!(
                ".{name}.deploy-old-{}-{timestamp}",
                std::process::id()
            ));
            let _ = fs::remove_file(&backup);
            if let Err(copy_error) = fs::copy(dst, &backup) {
                let _ = fs::remove_file(&temporary);
                return Err(copy_error.into());
            }
            if let Err(remove_error) = fs::remove_file(dst) {
                let _ = fs::remove_file(&temporary);
                let _ = fs::remove_file(&backup);
                return Err(remove_error.into());
            }

            match fs::rename(&temporary, dst) {
                Ok(()) => {
                    let _ = fs::remove_file(&backup);
                    Ok(())
                }
                Err(rename_error) => {
                    let _ = fs::remove_file(dst);
                    let restore_result = fs::rename(&backup, dst);
                    let _ = fs::remove_file(&temporary);
                    match restore_result {
                        Ok(()) => Err(rename_error.into()),
                        Err(restore_error) => Err(anyhow!(
                            "failed to publish file: {rename_error}; failed to restore previous file: {restore_error}"
                        )),
                    }
                }
            }
        }
        Err(error) => {
            let _ = fs::remove_file(&temporary);
            Err(error.into())
        }
    }
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

use axum::{
    extract::{Path, State, Json},
    response::{IntoResponse, Response},
    http::StatusCode,
};
use std::sync::Arc;
use serde::{Serialize, Deserialize};
use tracing::{info, error};

use crate::state::AppState;

#[derive(Serialize, Deserialize)]
pub struct CreateFileRequest {
    pub path: String,
    pub content: String,
}

#[derive(Serialize, Deserialize)]
pub struct UpdateFileRequest {
    pub content: String,
}

#[derive(Serialize, Deserialize)]
pub struct CreateDirectoryRequest {
    pub path: String,
}

#[derive(Serialize, Deserialize)]
pub struct FileResponse {
    pub id: String,
    pub name: String,
    pub content: String,
    pub language: Option<String>,
}

#[derive(Serialize, Deserialize)]
pub struct ErrorResponse {
    pub error: String,
}

// File handlers
pub async fn create_file_handler(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<CreateFileRequest>,
) -> impl IntoResponse {
    let mut vfs = state.vfs.write().await;
    
    match vfs.create_file(&std::path::Path::new(&payload.path), payload.content) {
        Ok(file_id) => {
            info!("Created file: {} with ID: {}", payload.path, file_id);
            (StatusCode::CREATED, Json(serde_json::json!({ "id": file_id })))
        }
        Err(e) => {
            error!("Failed to create file: {}", e);
            (StatusCode::BAD_REQUEST, Json(serde_json::json!({ "error": e.to_string() })))
        }
    }
}

pub async fn read_file_handler(
    State(state): State<Arc<AppState>>,
    Path(file_id): Path<String>,
) -> Response {
    let vfs = state.vfs.read().await;
    
    match vfs.read_file(&file_id) {
        Ok(file) => {
            let response = FileResponse {
                id: file.id.clone(),
                name: file.name.clone(),
                content: file.content.clone(),
                language: file.language.clone(),
            };
            (StatusCode::OK, Json(response)).into_response()
        }
        Err(e) => {
            error!("Failed to read file: {}", e);
            (StatusCode::NOT_FOUND, Json(ErrorResponse { error: e.to_string() })).into_response()
        }
    }
}

pub async fn update_file_handler(
    State(state): State<Arc<AppState>>,
    Path(file_id): Path<String>,
    Json(payload): Json<UpdateFileRequest>,
) -> impl IntoResponse {
    let mut vfs = state.vfs.write().await;
    
    match vfs.write_file(&file_id, payload.content) {
        Ok(_) => {
            info!("Updated file: {}", file_id);
            StatusCode::OK
        }
        Err(e) => {
            error!("Failed to update file: {}", e);
            StatusCode::BAD_REQUEST
        }
    }
}

pub async fn delete_file_handler(
    State(state): State<Arc<AppState>>,
    Path(file_id): Path<String>,
) -> impl IntoResponse {
    let mut vfs = state.vfs.write().await;
    
    match vfs.delete_file(&file_id) {
        Ok(_) => {
            info!("Deleted file: {}", file_id);
            StatusCode::NO_CONTENT
        }
        Err(e) => {
            error!("Failed to delete file: {}", e);
            StatusCode::NOT_FOUND
        }
    }
}

// Directory handlers
pub async fn create_directory_handler(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<CreateDirectoryRequest>,
) -> impl IntoResponse {
    let mut vfs = state.vfs.write().await;
    
    match vfs.create_directory(&std::path::Path::new(&payload.path)) {
        Ok(dir_id) => {
            info!("Created directory: {} with ID: {}", payload.path, dir_id);
            (StatusCode::CREATED, Json(serde_json::json!({ "id": dir_id })))
        }
        Err(e) => {
            error!("Failed to create directory: {}", e);
            (StatusCode::BAD_REQUEST, Json(serde_json::json!({ "error": e.to_string() })))
        }
    }
}

pub async fn list_directory_handler(
    State(state): State<Arc<AppState>>,
    Path(path): Path<String>,
) -> Response {
    let vfs = state.vfs.read().await;
    let path = if path.is_empty() { "/" } else { &path };
    
    match vfs.list_directory(&std::path::Path::new(path)) {
        Ok(nodes) => {
            info!("Listed directory: {}", path);
            (StatusCode::OK, Json(nodes)).into_response()
        }
        Err(e) => {
            error!("Failed to list directory: {}", e);
            (StatusCode::NOT_FOUND, Json(ErrorResponse { error: e.to_string() })).into_response()
        }
    }
}

// Project handlers
pub async fn get_project_handler(
    State(state): State<Arc<AppState>>,
) -> impl IntoResponse {
    let _vfs = state.vfs.read().await;
    // For now, return the entire file tree
    (StatusCode::OK, Json(serde_json::json!({ "root": "/" })))
}

pub async fn save_project_handler(
    State(_state): State<Arc<AppState>>,
) -> impl IntoResponse {
    // TODO: Implement project saving logic
    StatusCode::OK
}

// Settings handlers
pub async fn get_settings_handler(
    State(state): State<Arc<AppState>>,
) -> impl IntoResponse {
    let config = state.config.read().await;
    (StatusCode::OK, Json(config.clone()))
}

pub async fn update_settings_handler(
    State(_state): State<Arc<AppState>>,
    Json(_payload): Json<serde_json::Value>,
) -> impl IntoResponse {
    // TODO: Implement settings update logic with validation
    StatusCode::OK
}
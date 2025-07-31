use axum::extract::ws::{WebSocket, Message};
use futures::{sink::SinkExt, stream::StreamExt};
use std::sync::Arc;
use serde::{Serialize, Deserialize};
use serde_json::Value;
use tracing::{info, error, debug};

use crate::state::AppState;

#[derive(Debug, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum McpRequest {
    #[serde(rename = "file.create")]
    FileCreate {
        path: String,
        content: String,
    },
    #[serde(rename = "file.read")]
    FileRead {
        id: String,
    },
    #[serde(rename = "file.update")]
    FileUpdate {
        id: String,
        content: String,
    },
    #[serde(rename = "file.delete")]
    FileDelete {
        id: String,
    },
    #[serde(rename = "directory.create")]
    DirectoryCreate {
        path: String,
    },
    #[serde(rename = "directory.list")]
    DirectoryList {
        path: String,
    },
    #[serde(rename = "animation.type")]
    AnimationType {
        file_id: String,
        content: String,
        speed: Option<f32>,
    },
    #[serde(rename = "animation.cursor")]
    AnimationCursor {
        from: Position,
        to: Position,
        duration: u32,
    },
    #[serde(rename = "settings.get")]
    SettingsGet,
    #[serde(rename = "settings.update")]
    SettingsUpdate {
        settings: Value,
    },
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Position {
    pub line: u32,
    pub column: u32,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum McpResponse {
    #[serde(rename = "success")]
    Success {
        data: Value,
    },
    #[serde(rename = "error")]
    Error {
        message: String,
    },
    #[serde(rename = "event")]
    Event {
        event: String,
        data: Value,
    },
}

pub async fn handle_websocket(socket: WebSocket, state: Arc<AppState>) {
    let session_id = state.create_session();
    info!("New MCP WebSocket connection established: {}", session_id);
    
    let (mut sender, mut receiver) = socket.split();
    
    // Send welcome message
    let welcome = McpResponse::Event {
        event: "connected".to_string(),
        data: serde_json::json!({
            "session_id": session_id,
            "version": "1.0.0"
        }),
    };
    
    if let Err(e) = sender.send(Message::Text(
        serde_json::to_string(&welcome).unwrap()
    )).await {
        error!("Failed to send welcome message: {}", e);
        return;
    }
    
    while let Some(msg) = receiver.next().await {
        match msg {
            Ok(Message::Text(text)) => {
                state.update_session_activity(&session_id);
                
                match serde_json::from_str::<McpRequest>(&text) {
                    Ok(request) => {
                        debug!("Received MCP request: {:?}", request);
                        let response = handle_mcp_request(request, &state).await;
                        
                        if let Err(e) = sender.send(Message::Text(
                            serde_json::to_string(&response).unwrap()
                        )).await {
                            error!("Failed to send response: {}", e);
                            break;
                        }
                    }
                    Err(e) => {
                        error!("Failed to parse MCP request: {}", e);
                        let error_response = McpResponse::Error {
                            message: format!("Invalid request format: {}", e),
                        };
                        
                        if let Err(e) = sender.send(Message::Text(
                            serde_json::to_string(&error_response).unwrap()
                        )).await {
                            error!("Failed to send error response: {}", e);
                            break;
                        }
                    }
                }
            }
            Ok(Message::Close(_)) => {
                info!("WebSocket connection closed by client: {}", session_id);
                break;
            }
            Err(e) => {
                error!("WebSocket error: {}", e);
                break;
            }
            _ => {}
        }
    }
    
    state.sessions.remove(&session_id);
    info!("MCP WebSocket connection terminated: {}", session_id);
}

async fn handle_mcp_request(request: McpRequest, state: &Arc<AppState>) -> McpResponse {
    match request {
        McpRequest::FileCreate { path, content } => {
            let mut vfs = state.vfs.write().await;
            match vfs.create_file(&std::path::Path::new(&path), content) {
                Ok(file_id) => McpResponse::Success {
                    data: serde_json::json!({ "id": file_id }),
                },
                Err(e) => McpResponse::Error {
                    message: e.to_string(),
                },
            }
        }
        McpRequest::FileRead { id } => {
            let vfs = state.vfs.read().await;
            match vfs.read_file(&id) {
                Ok(file) => McpResponse::Success {
                    data: serde_json::to_value(file).unwrap(),
                },
                Err(e) => McpResponse::Error {
                    message: e.to_string(),
                },
            }
        }
        McpRequest::FileUpdate { id, content } => {
            let mut vfs = state.vfs.write().await;
            match vfs.write_file(&id, content) {
                Ok(_) => McpResponse::Success {
                    data: serde_json::json!({ "updated": true }),
                },
                Err(e) => McpResponse::Error {
                    message: e.to_string(),
                },
            }
        }
        McpRequest::FileDelete { id } => {
            let mut vfs = state.vfs.write().await;
            match vfs.delete_file(&id) {
                Ok(_) => McpResponse::Success {
                    data: serde_json::json!({ "deleted": true }),
                },
                Err(e) => McpResponse::Error {
                    message: e.to_string(),
                },
            }
        }
        McpRequest::DirectoryCreate { path } => {
            let mut vfs = state.vfs.write().await;
            match vfs.create_directory(&std::path::Path::new(&path)) {
                Ok(dir_id) => McpResponse::Success {
                    data: serde_json::json!({ "id": dir_id }),
                },
                Err(e) => McpResponse::Error {
                    message: e.to_string(),
                },
            }
        }
        McpRequest::DirectoryList { path } => {
            let vfs = state.vfs.read().await;
            match vfs.list_directory(&std::path::Path::new(&path)) {
                Ok(nodes) => McpResponse::Success {
                    data: serde_json::to_value(nodes).unwrap(),
                },
                Err(e) => McpResponse::Error {
                    message: e.to_string(),
                },
            }
        }
        McpRequest::AnimationType { file_id: _, content, speed } => {
            // TODO: Implement typing animation logic
            McpResponse::Success {
                data: serde_json::json!({
                    "animation_id": uuid::Uuid::new_v4().to_string(),
                    "duration": calculate_typing_duration(&content, speed.unwrap_or(80.0))
                }),
            }
        }
        McpRequest::AnimationCursor { from: _, to: _, duration: _ } => {
            // TODO: Implement cursor animation logic
            McpResponse::Success {
                data: serde_json::json!({
                    "animation_id": uuid::Uuid::new_v4().to_string(),
                    "started": true
                }),
            }
        }
        McpRequest::SettingsGet => {
            let config = state.config.read().await;
            McpResponse::Success {
                data: serde_json::to_value(&*config).unwrap(),
            }
        }
        McpRequest::SettingsUpdate { settings: _ } => {
            // TODO: Implement settings update with validation
            McpResponse::Success {
                data: serde_json::json!({ "updated": true }),
            }
        }
    }
}

fn calculate_typing_duration(content: &str, chars_per_second: f32) -> u32 {
    let char_count = content.chars().count() as f32;
    ((char_count / chars_per_second) * 1000.0) as u32
}
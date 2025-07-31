use axum::{
    Router,
    routing::{get, post},
    extract::{State, WebSocketUpgrade},
    response::Response,
};
use tower_http::cors::{CorsLayer, Any};
use std::net::SocketAddr;
use std::sync::Arc;
use tracing::info;

mod handlers;
mod routes;
mod websocket;

use crate::state::AppState;
use handlers::*;
use websocket::handle_websocket;

pub async fn start_server(app_state: AppState) -> anyhow::Result<()> {
    let app_state = Arc::new(app_state);
    
    let app = Router::new()
        // Health check
        .route("/health", get(health_check))
        
        // WebSocket endpoint for MCP
        .route("/mcp", get(mcp_websocket))
        
        // File operations
        .route("/api/files", post(create_file_handler))
        .route("/api/files/:id", get(read_file_handler))
        .route("/api/files/:id", post(update_file_handler))
        .route("/api/files/:id", axum::routing::delete(delete_file_handler))
        
        // Directory operations
        .route("/api/directories", post(create_directory_handler))
        .route("/api/directories/*path", get(list_directory_handler))
        
        // Project operations
        .route("/api/project", get(get_project_handler))
        .route("/api/project", post(save_project_handler))
        
        // Settings
        .route("/api/settings", get(get_settings_handler))
        .route("/api/settings", post(update_settings_handler))
        
        // Add state
        .with_state(app_state.clone())
        
        // Add CORS support
        .layer(
            CorsLayer::new()
                .allow_origin(Any)
                .allow_methods(Any)
                .allow_headers(Any),
        );
    
    let addr = SocketAddr::from(([127, 0, 0, 1], 3030));
    info!("API server listening on {}", addr);
    
    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;
    
    Ok(())
}

async fn health_check() -> &'static str {
    "OK"
}

async fn mcp_websocket(
    ws: WebSocketUpgrade,
    State(state): State<Arc<AppState>>,
) -> Response {
    ws.on_upgrade(move |socket| handle_websocket(socket, state))
}
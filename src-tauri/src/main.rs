#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::Manager;
use tracing::{info, error};
use tracing_subscriber;

mod api;
mod commands;
mod state;
mod utils;

use state::{AppState, VirtualFileSystem};

fn main() {
    // Initialize logging
    tracing_subscriber::fmt()
        .with_max_level(tracing::Level::DEBUG)
        .init();

    info!("Starting ABIDE - Automated Basic IDE");

    tauri::Builder::default()
        .setup(|app| {
            info!("Initializing ABIDE application");
            
            // Initialize virtual file system
            let vfs = VirtualFileSystem::new();
            let vfs_clone = vfs.clone();
            
            // Initialize app state for API server
            let app_state = AppState::new(vfs_clone);
            
            // Manage VFS state for Tauri commands
            app.manage(std::sync::Arc::new(std::sync::RwLock::new(vfs)));
            
            // Start the API server
            let _app_handle = app.handle();
            tauri::async_runtime::spawn(async move {
                if let Err(e) = api::start_server(app_state).await {
                    error!("Failed to start API server: {}", e);
                }
            });
            
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::file_operations::read_file,
            commands::file_operations::write_file,
            commands::file_operations::create_file,
            commands::file_operations::delete_file,
            commands::file_operations::list_directory,
            commands::project_management::create_project,
            commands::project_management::open_project,
            commands::project_management::save_project,
            commands::settings::get_settings,
            commands::settings::update_settings,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
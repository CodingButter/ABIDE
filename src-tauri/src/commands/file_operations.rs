use tauri::State;
use serde::{Serialize, Deserialize};
use std::sync::Arc;
use tokio::sync::RwLock;

use crate::state::VirtualFileSystem;

#[derive(Serialize, Deserialize)]
pub struct FileInfo {
    pub id: String,
    pub name: String,
    pub content: String,
    pub language: Option<String>,
}

#[tauri::command]
pub async fn read_file(
    file_id: String,
    vfs: State<'_, Arc<RwLock<VirtualFileSystem>>>,
) -> Result<FileInfo, String> {
    let vfs = vfs.read().await;
    
    match vfs.read_file(&file_id) {
        Ok(file) => Ok(FileInfo {
            id: file.id.clone(),
            name: file.name.clone(),
            content: file.content.clone(),
            language: file.language.clone(),
        }),
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
pub async fn write_file(
    file_id: String,
    content: String,
    vfs: State<'_, Arc<RwLock<VirtualFileSystem>>>,
) -> Result<(), String> {
    let mut vfs = vfs.write().await;
    
    vfs.write_file(&file_id, content)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn create_file(
    path: String,
    content: String,
    vfs: State<'_, Arc<RwLock<VirtualFileSystem>>>,
) -> Result<String, String> {
    let mut vfs = vfs.write().await;
    
    vfs.create_file(&std::path::Path::new(&path), content)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn delete_file(
    file_id: String,
    vfs: State<'_, Arc<RwLock<VirtualFileSystem>>>,
) -> Result<(), String> {
    let mut vfs = vfs.write().await;
    
    vfs.delete_file(&file_id)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn list_directory(
    path: String,
    vfs: State<'_, Arc<RwLock<VirtualFileSystem>>>,
) -> Result<Vec<crate::state::FileNode>, String> {
    let vfs = vfs.read().await;
    
    vfs.list_directory(&std::path::Path::new(&path))
        .map_err(|e| e.to_string())
}
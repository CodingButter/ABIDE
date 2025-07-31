use tauri::State;
use serde::{Serialize, Deserialize};
use std::sync::Arc;
use tokio::sync::RwLock;

use crate::state::VirtualFileSystem;

#[derive(Serialize, Deserialize)]
pub struct ProjectInfo {
    pub name: String,
    pub path: String,
    pub file_count: usize,
}

#[tauri::command]
pub async fn create_project(
    name: String,
    vfs: State<'_, Arc<RwLock<VirtualFileSystem>>>,
) -> Result<ProjectInfo, String> {
    let mut vfs = vfs.write().await;
    
    // Create project root directory
    let project_path = format!("/{}", name);
    vfs.create_directory(&std::path::Path::new(&project_path))
        .map_err(|e| e.to_string())?;
    
    // Create standard project structure
    let dirs = vec![
        format!("{}/src", project_path),
        format!("{}/tests", project_path),
        format!("{}/docs", project_path),
    ];
    
    for dir in dirs {
        vfs.create_directory(&std::path::Path::new(&dir))
            .map_err(|e| e.to_string())?;
    }
    
    // Create default files
    let readme_content = format!("# {}\n\nWelcome to your new ABIDE project!", name);
    vfs.create_file(
        &std::path::Path::new(&format!("{}/README.md", project_path)),
        readme_content,
    ).map_err(|e| e.to_string())?;
    
    let main_content = "// Your code starts here\n\nfunction main() {\n    console.log('Hello, ABIDE!');\n}\n\nmain();";
    vfs.create_file(
        &std::path::Path::new(&format!("{}/src/main.js", project_path)),
        main_content.to_string(),
    ).map_err(|e| e.to_string())?;
    
    Ok(ProjectInfo {
        name,
        path: project_path,
        file_count: 2,
    })
}

#[tauri::command]
pub async fn open_project(
    path: String,
    vfs: State<'_, Arc<RwLock<VirtualFileSystem>>>,
) -> Result<ProjectInfo, String> {
    let vfs = vfs.read().await;
    
    // List directory to verify it exists
    let files = vfs.list_directory(&std::path::Path::new(&path))
        .map_err(|e| e.to_string())?;
    
    let name = std::path::Path::new(&path)
        .file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("Unknown")
        .to_string();
    
    Ok(ProjectInfo {
        name,
        path,
        file_count: count_files(&files),
    })
}

#[tauri::command]
pub async fn save_project(
    _vfs: State<'_, Arc<RwLock<VirtualFileSystem>>>,
) -> Result<(), String> {
    // In a virtual file system, files are automatically saved
    // This command exists for compatibility with traditional IDEs
    Ok(())
}

fn count_files(nodes: &[crate::state::FileNode]) -> usize {
    nodes.iter().map(|node| {
        if node.is_directory {
            count_files(&node.children)
        } else {
            1
        }
    }).sum()
}
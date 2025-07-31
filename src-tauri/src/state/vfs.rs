use std::collections::HashMap;
use std::path::{Path, PathBuf};
use anyhow::{Result, anyhow};
use serde::{Serialize, Deserialize};
use uuid::Uuid;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct VirtualFile {
    pub id: String,
    pub name: String,
    pub content: String,
    pub language: Option<String>,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub modified_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct FileNode {
    pub id: String,
    pub name: String,
    pub path: PathBuf,
    pub is_directory: bool,
    pub children: Vec<FileNode>,
    pub file_id: Option<String>, // Reference to VirtualFile if not a directory
}

#[derive(Clone, Debug)]
pub struct VirtualFileSystem {
    files: HashMap<String, VirtualFile>,
    root: FileNode,
}

impl VirtualFileSystem {
    pub fn new() -> Self {
        let root = FileNode {
            id: Uuid::new_v4().to_string(),
            name: "/".to_string(),
            path: PathBuf::from("/"),
            is_directory: true,
            children: vec![],
            file_id: None,
        };
        
        Self {
            files: HashMap::new(),
            root,
        }
    }
    
    pub fn create_file(&mut self, path: &Path, content: String) -> Result<String> {
        let file_name = path.file_name()
            .ok_or_else(|| anyhow!("Invalid file path"))?
            .to_string_lossy()
            .to_string();
        
        let file_id = Uuid::new_v4().to_string();
        let now = chrono::Utc::now();
        
        let file = VirtualFile {
            id: file_id.clone(),
            name: file_name.clone(),
            content,
            language: detect_language(&file_name),
            created_at: now,
            modified_at: now,
        };
        
        self.files.insert(file_id.clone(), file);
        
        // Add to directory structure
        self.add_to_tree(path, file_id.clone(), false)?;
        
        Ok(file_id)
    }
    
    pub fn read_file(&self, file_id: &str) -> Result<&VirtualFile> {
        self.files.get(file_id)
            .ok_or_else(|| anyhow!("File not found"))
    }
    
    pub fn write_file(&mut self, file_id: &str, content: String) -> Result<()> {
        let file = self.files.get_mut(file_id)
            .ok_or_else(|| anyhow!("File not found"))?;
        
        file.content = content;
        file.modified_at = chrono::Utc::now();
        
        Ok(())
    }
    
    pub fn delete_file(&mut self, file_id: &str) -> Result<()> {
        self.files.remove(file_id)
            .ok_or_else(|| anyhow!("File not found"))?;
        
        // Remove from tree
        self.remove_from_tree(file_id)?;
        
        Ok(())
    }
    
    pub fn create_directory(&mut self, path: &Path) -> Result<String> {
        let _dir_name = path.file_name()
            .ok_or_else(|| anyhow!("Invalid directory path"))?
            .to_string_lossy()
            .to_string();
        
        let dir_id = Uuid::new_v4().to_string();
        
        self.add_to_tree(path, dir_id.clone(), true)?;
        
        Ok(dir_id)
    }
    
    pub fn list_directory(&self, path: &Path) -> Result<Vec<FileNode>> {
        let node = self.find_node(path)?;
        
        if !node.is_directory {
            return Err(anyhow!("Path is not a directory"));
        }
        
        Ok(node.children.clone())
    }
    
    fn add_to_tree(&mut self, path: &Path, id: String, is_directory: bool) -> Result<()> {
        let parent_path = path.parent()
            .ok_or_else(|| anyhow!("Invalid path"))?;
        
        let node_name = path.file_name()
            .ok_or_else(|| anyhow!("Invalid path"))?
            .to_string_lossy()
            .to_string();
        
        let new_node = FileNode {
            id: Uuid::new_v4().to_string(),
            name: node_name,
            path: path.to_path_buf(),
            is_directory,
            children: vec![],
            file_id: if is_directory { None } else { Some(id) },
        };
        
        // Find parent and add child
        let parent = self.find_node_mut(parent_path)?;
        parent.children.push(new_node);
        
        Ok(())
    }
    
    fn remove_from_tree(&mut self, file_id: &str) -> Result<()> {
        // Implement tree traversal to find and remove node
        Self::remove_node_recursive(&mut self.root, file_id)
    }
    
    fn remove_node_recursive(node: &mut FileNode, file_id: &str) -> Result<()> {
        node.children.retain(|child| {
            if let Some(ref fid) = child.file_id {
                fid != file_id
            } else {
                true
            }
        });
        
        for child in &mut node.children {
            Self::remove_node_recursive(child, file_id)?;
        }
        
        Ok(())
    }
    
    fn find_node(&self, path: &Path) -> Result<&FileNode> {
        let components: Vec<_> = path.components().collect();
        let mut current = &self.root;
        
        for component in components.iter().skip(1) {
            let name = component.as_os_str().to_string_lossy();
            current = current.children.iter()
                .find(|child| child.name == name)
                .ok_or_else(|| anyhow!("Path not found"))?;
        }
        
        Ok(current)
    }
    
    fn find_node_mut(&mut self, path: &Path) -> Result<&mut FileNode> {
        let components: Vec<_> = path.components().collect();
        let mut current = &mut self.root;
        
        for component in components.iter().skip(1) {
            let name = component.as_os_str().to_string_lossy().to_string();
            current = current.children.iter_mut()
                .find(|child| child.name == name)
                .ok_or_else(|| anyhow!("Path not found"))?;
        }
        
        Ok(current)
    }
}

fn detect_language(filename: &str) -> Option<String> {
    let extension = Path::new(filename)
        .extension()
        .and_then(|ext| ext.to_str())?;
    
    match extension {
        "js" | "jsx" => Some("javascript".to_string()),
        "ts" | "tsx" => Some("typescript".to_string()),
        "rs" => Some("rust".to_string()),
        "py" => Some("python".to_string()),
        "json" => Some("json".to_string()),
        "html" => Some("html".to_string()),
        "css" => Some("css".to_string()),
        "md" => Some("markdown".to_string()),
        _ => None,
    }
}
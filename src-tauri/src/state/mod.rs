use dashmap::DashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use uuid::Uuid;

mod vfs;
mod config;

pub use vfs::{VirtualFileSystem, FileNode};
pub use config::AppConfig;

#[derive(Clone)]
pub struct AppState {
    pub vfs: Arc<RwLock<VirtualFileSystem>>,
    pub config: Arc<RwLock<AppConfig>>,
    pub sessions: Arc<DashMap<String, SessionState>>,
}

#[derive(Clone, Debug)]
pub struct SessionState {
    pub id: String,
    pub connected_at: chrono::DateTime<chrono::Utc>,
    pub last_activity: chrono::DateTime<chrono::Utc>,
}

#[allow(dead_code)]
impl SessionState {
    pub fn id(&self) -> &str {
        &self.id
    }
    
    pub fn connected_at(&self) -> &chrono::DateTime<chrono::Utc> {
        &self.connected_at
    }
}

impl AppState {
    pub fn new(vfs: VirtualFileSystem) -> Self {
        Self {
            vfs: Arc::new(RwLock::new(vfs)),
            config: Arc::new(RwLock::new(AppConfig::default())),
            sessions: Arc::new(DashMap::new()),
        }
    }
    
    pub fn create_session(&self) -> String {
        let session_id = Uuid::new_v4().to_string();
        let session = SessionState {
            id: session_id.clone(),
            connected_at: chrono::Utc::now(),
            last_activity: chrono::Utc::now(),
        };
        
        self.sessions.insert(session_id.clone(), session);
        session_id
    }
    
    pub fn update_session_activity(&self, session_id: &str) {
        if let Some(mut session) = self.sessions.get_mut(session_id) {
            session.last_activity = chrono::Utc::now();
        }
    }
}
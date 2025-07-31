use serde::{Serialize, Deserialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct AppConfig {
    pub theme: Theme,
    pub editor: EditorConfig,
    pub animation: AnimationConfig,
    pub api: ApiConfig,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Theme {
    pub mode: String, // "light" or "dark"
    pub primary_color: String,
    pub secondary_color: String,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct EditorConfig {
    pub font_size: u32,
    pub font_family: String,
    pub tab_size: u32,
    pub word_wrap: bool,
    pub auto_save: bool,
    pub auto_save_delay: u32, // milliseconds
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct AnimationConfig {
    pub typing_speed: f32, // characters per second
    pub typing_variation: f32, // randomness factor (0.0-1.0)
    pub cursor_blink_rate: u32, // milliseconds
    pub smooth_scrolling: bool,
    pub enable_animations: bool,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ApiConfig {
    pub port: u16,
    pub host: String,
    pub max_connections: usize,
    pub timeout: u32, // seconds
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            theme: Theme {
                mode: "dark".to_string(),
                primary_color: "#007ACC".to_string(),
                secondary_color: "#1E1E1E".to_string(),
            },
            editor: EditorConfig {
                font_size: 14,
                font_family: "Cascadia Code, Consolas, monospace".to_string(),
                tab_size: 4,
                word_wrap: false,
                auto_save: true,
                auto_save_delay: 3000,
            },
            animation: AnimationConfig {
                typing_speed: 80.0,
                typing_variation: 0.2,
                cursor_blink_rate: 530,
                smooth_scrolling: true,
                enable_animations: true,
            },
            api: ApiConfig {
                port: 3030,
                host: "127.0.0.1".to_string(),
                max_connections: 100,
                timeout: 30,
            },
        }
    }
}
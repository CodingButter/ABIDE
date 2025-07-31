use tauri::State;
use serde_json::Value;
use std::sync::Arc;
use tokio::sync::RwLock;

use crate::state::AppConfig;

#[tauri::command]
pub async fn get_settings(
    config: State<'_, Arc<RwLock<AppConfig>>>,
) -> Result<AppConfig, String> {
    let config = config.read().await;
    Ok(config.clone())
}

#[tauri::command]
pub async fn update_settings(
    settings: Value,
    config: State<'_, Arc<RwLock<AppConfig>>>,
) -> Result<(), String> {
    let mut config = config.write().await;
    
    // Update theme settings
    if let Some(theme) = settings.get("theme") {
        if let Some(mode) = theme.get("mode").and_then(|v| v.as_str()) {
            config.theme.mode = mode.to_string();
        }
        if let Some(primary) = theme.get("primary_color").and_then(|v| v.as_str()) {
            config.theme.primary_color = primary.to_string();
        }
        if let Some(secondary) = theme.get("secondary_color").and_then(|v| v.as_str()) {
            config.theme.secondary_color = secondary.to_string();
        }
    }
    
    // Update editor settings
    if let Some(editor) = settings.get("editor") {
        if let Some(font_size) = editor.get("font_size").and_then(|v| v.as_u64()) {
            config.editor.font_size = font_size as u32;
        }
        if let Some(font_family) = editor.get("font_family").and_then(|v| v.as_str()) {
            config.editor.font_family = font_family.to_string();
        }
        if let Some(tab_size) = editor.get("tab_size").and_then(|v| v.as_u64()) {
            config.editor.tab_size = tab_size as u32;
        }
        if let Some(word_wrap) = editor.get("word_wrap").and_then(|v| v.as_bool()) {
            config.editor.word_wrap = word_wrap;
        }
        if let Some(auto_save) = editor.get("auto_save").and_then(|v| v.as_bool()) {
            config.editor.auto_save = auto_save;
        }
        if let Some(auto_save_delay) = editor.get("auto_save_delay").and_then(|v| v.as_u64()) {
            config.editor.auto_save_delay = auto_save_delay as u32;
        }
    }
    
    // Update animation settings
    if let Some(animation) = settings.get("animation") {
        if let Some(typing_speed) = animation.get("typing_speed").and_then(|v| v.as_f64()) {
            config.animation.typing_speed = typing_speed as f32;
        }
        if let Some(typing_variation) = animation.get("typing_variation").and_then(|v| v.as_f64()) {
            config.animation.typing_variation = typing_variation as f32;
        }
        if let Some(cursor_blink_rate) = animation.get("cursor_blink_rate").and_then(|v| v.as_u64()) {
            config.animation.cursor_blink_rate = cursor_blink_rate as u32;
        }
        if let Some(smooth_scrolling) = animation.get("smooth_scrolling").and_then(|v| v.as_bool()) {
            config.animation.smooth_scrolling = smooth_scrolling;
        }
        if let Some(enable_animations) = animation.get("enable_animations").and_then(|v| v.as_bool()) {
            config.animation.enable_animations = enable_animations;
        }
    }
    
    Ok(())
}
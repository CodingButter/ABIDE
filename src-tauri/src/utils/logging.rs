use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt, filter::EnvFilter};

#[allow(dead_code)]
pub fn init_logging() {
    tracing_subscriber::registry()
        .with(
            EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "abide=debug,tower_http=debug,axum=debug".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();
}
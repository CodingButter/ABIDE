#!/bin/bash

# Source cargo environment if it exists
if [ -f "$HOME/.cargo/env" ]; then
    source "$HOME/.cargo/env"
fi

# Disable GPU acceleration in WSL2 to avoid libEGL warning
# This uses software rendering which is fine for development
export LIBGL_ALWAYS_SOFTWARE=1
export WEBKIT_DISABLE_COMPOSITING_MODE=1

# Run tauri dev
npm run tauri:dev
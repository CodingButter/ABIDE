#!/bin/bash
# Script to create ICNS file on macOS
# Run this on a macOS system

if [[ "$OSTYPE" == "darwin"* ]]; then
    iconutil -c icns ABIDE.iconset -o icon.icns
    echo "icon.icns created successfully!"
else
    echo "This script must be run on macOS to create ICNS files"
    echo "The iconset directory has been prepared and can be converted on macOS"
fi
#!/bin/bash

echo "This script will fix the libEGL GPU permission warning in WSL2"
echo "You need to run this with sudo and then restart your WSL2 session"
echo ""
echo "Run the following commands:"
echo ""
echo "1. Add yourself to the render group:"
echo "   sudo usermod -a -G render $USER"
echo ""
echo "2. After running the command, you need to either:"
echo "   a) Restart WSL2 completely (from PowerShell: wsl --shutdown)"
echo "   b) Or log out and back in"
echo ""
echo "Alternative temporary fix (until next reboot):"
echo "   sudo chmod 666 /dev/dri/renderD128"
echo ""
echo "For a permanent fix without needing sudo, add this to your .bashrc or .zshrc:"
echo "   export LIBGL_ALWAYS_SOFTWARE=1"
echo ""
echo "Note: The software rendering option (LIBGL_ALWAYS_SOFTWARE=1) will disable"
echo "GPU acceleration but will eliminate the warning."
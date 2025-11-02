#!/bin/bash
# SuperCode VS Code Extension - Install Script
# Installs the extension into VS Code

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
EXT_NAME="vscode-supercode"
VERSION="0.0.1"

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║ SuperCode! VS Code Extension - Installation Wizard          ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Function to detect VS Code installation
find_vscode() {
  # Try common locations
  if command -v code &> /dev/null; then
    echo "code"
    return 0
  fi
  
  # Try common installation paths
  local paths=(
    "/usr/bin/code"
    "/usr/local/bin/code"
    "$HOME/.local/bin/code"
    "$HOME/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code"
    "/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code"
    "C:/Program Files/Microsoft VS Code/bin/code"
    "C:/Program Files (x86)/Microsoft VS Code/bin/code"
  )
  
  for path in "${paths[@]}"; do
    if [ -x "$path" ]; then
      echo "$path"
      return 0
    fi
  done
  
  return 1
}

# Function to install from VSIX
install_from_vsix() {
  local vsix_file="$1"
  local code_cmd="$2"
  
  if [ ! -f "$vsix_file" ]; then
    echo "❌ VSIX file not found: $vsix_file"
    echo ""
    echo "📦 Building package first..."
    bash "$SCRIPT_DIR/build.sh" || exit 1
  fi
  
  echo ""
  echo "📥 Installing extension..."
  "$code_cmd" --install-extension "$vsix_file"
  
  if [ $? -eq 0 ]; then
    echo "✅ Installation successful!"
    return 0
  else
    echo "❌ Installation failed"
    return 1
  fi
}

# Function to install from folder (development mode)
install_dev() {
  local code_cmd="$1"
  
  echo "📂 Installing in development mode..."
  echo "   (Creates symlink to extension folder)"
  echo ""
  
  # Create symlink to VS Code extensions folder
  local ext_dir="$HOME/.vscode/extensions/${EXT_NAME}-${VERSION}"
  
  if [ -d "$ext_dir" ]; then
    echo "⚠️  Extension already installed at: $ext_dir"
    read -p "Overwrite? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      echo "Cancelled."
      return 1
    fi
    rm -rf "$ext_dir"
  fi
  
  mkdir -p "$HOME/.vscode/extensions"
  ln -s "$SCRIPT_DIR" "$ext_dir"
  
  echo "✅ Development installation complete!"
  echo "   Extension folder: $SCRIPT_DIR"
  echo "   Installed at: $ext_dir"
  echo ""
  echo "💡 Reload VS Code (Ctrl+R) to activate"
  return 0
}

# Main installation logic
main() {
  echo "🔍 Detecting VS Code installation..."
  echo ""
  
  CODE_CMD=$(find_vscode)
  
  if [ -z "$CODE_CMD" ]; then
    echo "❌ VS Code not found"
    echo ""
    echo "Please install VS Code from: https://code.visualstudio.com"
    echo "Or ensure 'code' command is in your PATH"
    exit 1
  fi
  
  echo "✓ Found VS Code"
  echo ""
  echo "📦 Installation Options:"
  echo ""
  echo "  1) Install from .vsix (Recommended - production)"
  echo "  2) Install in development mode (For development)"
  echo "  3) Exit"
  echo ""
  read -p "Choose option (1-3): " choice
  
  case $choice in
    1)
      VSIX_FILE="$SCRIPT_DIR/dist/${EXT_NAME}-${VERSION}.vsix"
      install_from_vsix "$VSIX_FILE" "$CODE_CMD"
      ;;
    2)
      install_dev "$CODE_CMD"
      ;;
    3)
      echo "Cancelled."
      exit 0
      ;;
    *)
      echo "Invalid choice"
      exit 1
      ;;
  esac
  
  echo ""
  echo "📖 Next Steps:"
  echo "   1. Open VS Code or reload (Ctrl+R)"
  echo "   2. Create a file: example.sc"
  echo "   3. Type SuperCode! and see highlighting"
  echo "   4. Press Ctrl+Space for completions"
  echo "   5. Press Shift+Alt+F to format code"
  echo ""
  echo "✨ Happy coding!"
  echo ""
}

main

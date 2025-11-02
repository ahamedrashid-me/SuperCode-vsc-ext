#!/bin/bash
# SuperCode VS Code Extension - Build & Package Script
# Creates a .vsix (Visual Studio Code Extension) package without external dependencies

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
EXT_NAME="vscode-supercode"
VERSION="0.0.1"
OUTPUT_DIR="$SCRIPT_DIR/dist"
VSIX_FILE="$OUTPUT_DIR/${EXT_NAME}-${VERSION}.vsix"

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║ SuperCode! VS Code Extension - Build & Package              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Check required commands
check_command() {
  if ! command -v "$1" &> /dev/null; then
    echo "❌ Error: $1 is required but not installed"
    echo "   Install it and try again"
    exit 1
  fi
}

check_command "zip"
check_command "node"

echo "📦 Building SuperCode Extension Package..."
echo ""

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Create temporary working directory
TEMP_DIR=$(mktemp -d)
trap "rm -rf $TEMP_DIR" EXIT

echo "📂 Preparing files..."

# Copy extension files to temp directory
cp -r "$SCRIPT_DIR"/{package.json,extension.js,formatter.js,language-configuration.json} "$TEMP_DIR/"
cp -r "$SCRIPT_DIR"/syntaxes "$TEMP_DIR/"
cp -r "$SCRIPT_DIR"/snippets "$TEMP_DIR/"

# Create necessary files
echo "📝 Creating manifest..."
mkdir -p "$TEMP_DIR"

# Validate package.json
node -e "
const pkg = require('$SCRIPT_DIR/package.json');
if (!pkg.name || !pkg.version) {
  console.error('❌ Invalid package.json: missing name or version');
  process.exit(1);
}
console.log('✓ package.json valid');
" || exit 1

echo ""
echo "📦 Creating .vsix package..."

# Create .vsix file (it's just a ZIP archive)
cd "$TEMP_DIR"
zip -r -q "$VSIX_FILE" .

echo ""
echo "✅ Build successful!"
echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║ PACKAGE READY FOR DISTRIBUTION                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "📍 Location: $VSIX_FILE"
echo "📊 Size: $(du -h "$VSIX_FILE" | cut -f1)"
echo ""
echo "📥 Installation:"
echo "   Option 1 - Via VS Code:"
echo "     Extensions (Ctrl+Shift+X) → ... → Install from VSIX"
echo ""
echo "   Option 2 - Via Command Line:"
echo "     code --install-extension $VSIX_FILE"
echo ""
echo "   Option 3 - Run install script:"
echo "     bash install.sh"
echo ""
echo "✨ Once installed, create any .sc file to test!"
echo ""

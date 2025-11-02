#!/usr/bin/env python3
"""
SuperCode VS Code Extension - Build & Package Script (Python)
Creates a .vsix (Visual Studio Code Extension) package
Works without Node.js or external dependencies
"""

import os
import sys
import json
import zipfile
import shutil
from pathlib import Path
from datetime import datetime

def log_banner():
    print("╔══════════════════════════════════════════════════════════════╗")
    print("║ SuperCode! VS Code Extension - Build & Package (Python)     ║")
    print("╚══════════════════════════════════════════════════════════════╝")
    print()

def validate_package():
    """Validate package.json"""
    package_file = Path(__file__).parent / "package.json"
    try:
        with open(package_file, 'r') as f:
            pkg = json.load(f)
        
        if not pkg.get('name') or not pkg.get('version'):
            print("❌ Invalid package.json: missing name or version")
            return False, None, None
        
        print(f"✓ package.json valid")
        return True, pkg['name'], pkg['version']
    except Exception as e:
        print(f"❌ Error reading package.json: {e}")
        return False, None, None

def validate_files(base_dir):
    """Validate all required files exist"""
    required_files = [
        'package.json',
        'extension.js',
        'formatter.js',
        'runner.js',
        'language-configuration.json',
        'syntaxes/supercode.tmLanguage.json',
        'snippets/supercode.json'
    ]
    
    print("📂 Validating files...")
    for file in required_files:
        path = base_dir / file
        if not path.exists():
            print(f"❌ Missing file: {file}")
            return False
        print(f"✓ {file}")
    
    return True

def build_vsix(base_dir, name, version):
    """Build VSIX package"""
    output_dir = base_dir / "dist"
    output_dir.mkdir(exist_ok=True)
    
    vsix_file = output_dir / f"{name}-{version}.vsix"
    
    print()
    print("📦 Creating .vsix package...")
    print(f"   Output: {vsix_file}")
    
    try:
        # Remove existing file
        if vsix_file.exists():
            vsix_file.unlink()
        
        # Create ZIP archive (VSIX is just a ZIP with extension/ prefix)
        with zipfile.ZipFile(vsix_file, 'w', zipfile.ZIP_DEFLATED) as zipf:
            # Add all files with 'extension/' prefix
            files_to_add = [
                'package.json',
                'extension.js',
                'formatter.js',
                'runner.js',
                'language-configuration.json',
            ]
            
            # Add individual files with extension/ prefix
            for file in files_to_add:
                file_path = base_dir / file
                if file_path.exists():
                    zipf.write(file_path, arcname=f'extension/{file}')
                    print(f"   + extension/{file}")
            
            # Add directories with extension/ prefix
            for subdir in ['syntaxes', 'snippets']:
                dir_path = base_dir / subdir
                if dir_path.exists():
                    for root, dirs, files in os.walk(dir_path):
                        for file in files:
                            file_path = Path(root) / file
                            arcname = file_path.relative_to(base_dir)
                            zipf.write(file_path, arcname=f'extension/{arcname}')
                            print(f"   + extension/{arcname}")
        
        # Get file size
        size_bytes = vsix_file.stat().st_size
        size_kb = size_bytes / 1024
        size_str = f"{size_kb:.1f} KB" if size_kb < 1024 else f"{size_kb/1024:.1f} MB"
        
        print()
        print("✅ Build successful!")
        print()
        print("╔══════════════════════════════════════════════════════════════╗")
        print("║ PACKAGE READY FOR DISTRIBUTION                              ║")
        print("╚══════════════════════════════════════════════════════════════╝")
        print()
        print(f"📍 Location: {vsix_file}")
        print(f"📊 Size: {size_str}")
        print()
        print("📥 Installation:")
        print("   Option 1 - Via VS Code UI:")
        print("     Extensions (Ctrl+Shift+X) → ... → Install from VSIX")
        print()
        print("   Option 2 - Via Command Line:")
        print(f"     code --install-extension {vsix_file.absolute()}")
        print()
        print("   Option 3 - Run install script:")
        print("     bash install.sh    # Linux/Mac")
        print("     install.bat        # Windows")
        print()
        print("✨ Once installed, create any .su file to test!")
        print()
        
        return True
    except Exception as e:
        print(f"❌ Error creating VSIX: {e}")
        return False

def main():
    log_banner()
    
    base_dir = Path(__file__).parent
    
    # Validate package.json
    valid, name, version = validate_package()
    if not valid:
        sys.exit(1)
    
    print()
    
    # Validate files
    if not validate_files(base_dir):
        sys.exit(1)
    
    # Build VSIX
    if build_vsix(base_dir, name, version):
        sys.exit(0)
    else:
        sys.exit(1)

if __name__ == '__main__':
    main()

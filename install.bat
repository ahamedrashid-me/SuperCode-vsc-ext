@echo off
REM SuperCode VS Code Extension - Installation Script (Windows)
REM Installs the extension into VS Code on Windows

setlocal enabledelayedexpansion

set EXT_NAME=vscode-supercode
set VERSION=0.0.1

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║ SuperCode! VS Code Extension - Installation Wizard (Windows) ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

REM Check if code command exists
where code >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ VS Code not found in PATH
    echo.
    echo Please install VS Code from: https://code.visualstudio.com
    echo Or add VS Code to your PATH
    pause
    exit /b 1
)

echo ✓ Found VS Code in PATH
echo.

set SCRIPT_DIR=%~dp0
set VSIX_FILE=%SCRIPT_DIR%dist\%EXT_NAME%-%VERSION%.vsix

echo 📦 Installation Options:
echo.
echo   1) Install from .vsix (Recommended - production)
echo   2) Install in development mode (For development)
echo   3) Exit
echo.

set /p choice="Choose option (1-3): "

if "%choice%"=="1" (
    call :install_vsix
) else if "%choice%"=="2" (
    call :install_dev
) else if "%choice%"=="3" (
    echo Cancelled.
    exit /b 0
) else (
    echo Invalid choice
    exit /b 1
)

exit /b 0

:install_vsix
if not exist "%VSIX_FILE%" (
    echo ❌ VSIX file not found: %VSIX_FILE%
    echo.
    echo 📦 Building package first...
    cd /d "%SCRIPT_DIR%"
    
    REM Check if build.sh exists, otherwise create a minimal build
    if exist "build.sh" (
        REM Building on Windows with WSL or similar
        echo Note: Run 'bash build.sh' from WSL to create VSIX
    )
    
    echo ⚠️  Manual .vsix creation required
    echo Run this command in terminal:
    echo   npm install -g vsce
    echo   vsce package
    echo.
    pause
    exit /b 1
)

echo.
echo 📥 Installing extension...
code --install-extension "%VSIX_FILE%"

if %ERRORLEVEL% EQU 0 (
    echo ✅ Installation successful!
) else (
    echo ❌ Installation failed
    pause
    exit /b 1
)
exit /b 0

:install_dev
echo 📂 Installing in development mode...
echo    (Creates link to extension folder)
echo.

set EXT_PATH=%USERPROFILE%\.vscode\extensions\%EXT_NAME%-%VERSION%

if exist "%EXT_PATH%" (
    echo ⚠️  Extension already installed at: %EXT_PATH%
    set /p overwrite="Overwrite? (y/n): "
    if /i not "!overwrite!"=="y" (
        echo Cancelled.
        exit /b 1
    )
    rmdir /s /q "%EXT_PATH%"
)

mkdir "%USERPROFILE%\.vscode\extensions" 2>nul
mklink /d "%EXT_PATH%" "%SCRIPT_DIR:~0,-1%"

if %ERRORLEVEL% EQU 0 (
    echo ✅ Development installation complete!
    echo    Extension folder: %SCRIPT_DIR%
    echo    Installed at: %EXT_PATH%
    echo.
    echo 💡 Reload VS Code (Ctrl+R) to activate
) else (
    echo ❌ Installation failed
    pause
    exit /b 1
)
exit /b 0

:end
echo.
echo 📖 Next Steps:
echo    1. Open VS Code or reload (Ctrl+R)
echo    2. Create a file: example.sc
echo    3. Type SuperCode! and see highlighting
echo    4. Press Ctrl+Space for completions
echo    5. Press Shift+Alt+F to format code
echo.
echo ✨ Happy coding!
echo.
pause

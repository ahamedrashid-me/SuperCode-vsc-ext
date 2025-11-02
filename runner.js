/**
 * SuperCode! Runner
 * Compiles and runs SuperCode! programs from VS Code
 */

const vscode = require('vscode');
const { spawn, spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

class SuperCodeRunner {
  constructor(outputChannel) {
    this.outputChannel = outputChannel;
    this.compiler = 'scc';  // SuperCode Compiler binary name
    this.processes = new Map();
  }

  /**
   * Run a SuperCode! file
   */
  async run(filePath) {
    try {
      const fileName = path.basename(filePath);
      const fileDir = path.dirname(filePath);
      const baseName = path.parse(fileName).name;
      
      this.outputChannel.clear();
      this.outputChannel.show(true);
      this.outputChannel.appendLine('═══════════════════════════════════════════════════════');
      this.outputChannel.appendLine(`📁 Running: ${fileName}`);
      this.outputChannel.appendLine('═══════════════════════════════════════════════════════');
      this.outputChannel.appendLine('');

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        this.outputChannel.appendLine('❌ File not found: ' + filePath);
        return;
      }

      // Try to find the SuperCode compiler
      const compilerPath = await this.findCompiler();
      if (!compilerPath) {
        this.outputChannel.appendLine('⚠️  SuperCode Compiler (scc) not found');
        this.outputChannel.appendLine('');
        this.outputChannel.appendLine('Install it with:');
        this.outputChannel.appendLine('  Linux/Mac: make install');
        this.outputChannel.appendLine('  Or place scc binary in PATH');
        this.outputChannel.appendLine('');
        this.outputChannel.appendLine('For now, showing code preview:');
        this.outputChannel.appendLine('');
        this.showPreview(filePath);
        return;
      }

      // Show compilation status
      this.outputChannel.appendLine('🔨 Compiling...');
      
      // Compile the file
      const outputBinary = path.join(os.tmpdir(), baseName);
      const compileResult = spawnSync(compilerPath, [filePath, '-o', outputBinary], {
        encoding: 'utf-8',
        maxBuffer: 10 * 1024 * 1024,
        timeout: 30000,
        cwd: fileDir
      });

      if (compileResult.error) {
        this.outputChannel.appendLine('❌ Compilation failed: ' + compileResult.error.message);
        return;
      }

      if (compileResult.status !== 0) {
        this.outputChannel.appendLine('❌ Compilation failed with exit code ' + compileResult.status);
        if (compileResult.stderr) {
          this.outputChannel.appendLine('');
          this.outputChannel.appendLine(compileResult.stderr);
        }
        if (compileResult.stdout) {
          this.outputChannel.appendLine('');
          this.outputChannel.appendLine(compileResult.stdout);
        }
        return;
      }

      this.outputChannel.appendLine('✓ Compiled successfully');
      this.outputChannel.appendLine('');
      this.outputChannel.appendLine('▶ Running...');
      this.outputChannel.appendLine('');

      // Run the compiled binary
      await this.runBinary(outputBinary, baseName);

    } catch (error) {
      this.outputChannel.appendLine('❌ Error: ' + error.message);
    }
  }

  /**
   * Run a compiled binary
   */
  runBinary(binaryPath, name) {
    return new Promise((resolve) => {
      try {
        const process = spawn(binaryPath, [], {
          timeout: 60000  // 60 second timeout
        });

        let output = '';
        let errorOutput = '';

        process.stdout.on('data', (data) => {
          const text = data.toString();
          output += text;
          this.outputChannel.append(text);
        });

        process.stderr.on('data', (data) => {
          const text = data.toString();
          errorOutput += text;
          this.outputChannel.append(text);
        });

        process.on('close', (code) => {
          this.outputChannel.appendLine('');
          this.outputChannel.appendLine('═══════════════════════════════════════════════════════');
          this.outputChannel.appendLine(`✓ Program exited with code ${code}`);
          this.outputChannel.appendLine('═══════════════════════════════════════════════════════');
          
          // Clean up temp file
          try {
            if (fs.existsSync(binaryPath)) {
              fs.unlinkSync(binaryPath);
            }
          } catch (e) {
            // Ignore cleanup errors
          }

          resolve();
        });

        process.on('error', (error) => {
          this.outputChannel.appendLine('❌ Runtime error: ' + error.message);
          resolve();
        });

      } catch (error) {
        this.outputChannel.appendLine('❌ Failed to run: ' + error.message);
        resolve();
      }
    });
  }

  /**
   * Show a preview of the code
   */
  showPreview(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');
      
      this.outputChannel.appendLine('--- Code Preview ---');
      this.outputChannel.appendLine('');
      lines.slice(0, 20).forEach((line, i) => {
        this.outputChannel.appendLine(`${i + 1}: ${line}`);
      });
      
      if (lines.length > 20) {
        this.outputChannel.appendLine(`... (${lines.length - 20} more lines)`);
      }
      
      this.outputChannel.appendLine('');
      this.outputChannel.appendLine('💡 To run this code, install the SuperCode compiler');
    } catch (error) {
      this.outputChannel.appendLine('❌ Could not read file: ' + error.message);
    }
  }

  /**
   * Find the SuperCode compiler in PATH or common locations
   */
  async findCompiler() {
    // Check if scc is in PATH
    const result = spawnSync(process.platform === 'win32' ? 'where' : 'which', ['scc'], {
      encoding: 'utf-8'
    });

    if (result.status === 0 && result.stdout.trim()) {
      return result.stdout.trim().split('\n')[0];
    }

    // Check common installation paths
    const paths = [
      '/usr/local/bin/scc',
      '/usr/bin/scc',
      path.join(os.homedir(), '.local/bin/scc'),
      'C:\\Program Files\\SuperCode\\scc.exe',
      'C:\\Program Files (x86)\\SuperCode\\scc.exe'
    ];

    for (const p of paths) {
      if (fs.existsSync(p)) {
        return p;
      }
    }

    return null;
  }

  /**
   * Stop a running process
   */
  stop() {
    this.processes.forEach((process) => {
      try {
        process.kill();
      } catch (e) {
        // Ignore kill errors
      }
    });
    this.processes.clear();
  }
}

module.exports = SuperCodeRunner;

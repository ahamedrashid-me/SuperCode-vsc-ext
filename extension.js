const vscode = require('vscode');
const { formatDocument, formatRange } = require('./formatter');
const SuperCodeRunner = require('./runner');

/**
 * Activate extension: register formatter, completion, hover, and run commands
 */
function activate(context) {
  // Keywords, types, and built-ins
  const keywords = [
    'fnc', 'if', 'else', 'while', 'loop', 'break', 'continue', 'get',
    'grp', 'arr', 'map', 'const', 'let'
  ];

  const types = [
    'int', 'byte', 'char', 'deci', 'string', 'void'
  ];

  const builtins = [
    'print', 'show',
    '@open', '@close', '@read', '@write', '@strlen',
    '@malloc', '@free', '@addr', '@peek', '@poke'
  ];

  const operators = [
    '+', '-', '*', '/', '%', '&', '|', '^', '~', '<<', '>>',
    '==', '!=', '<=', '>=', '<', '>', '&&', '||', '!'
  ];

  // Create output channel for running programs
  const outputChannel = vscode.window.createOutputChannel('SuperCode! Runner');
  
  // Create runner instance
  const runner = new SuperCodeRunner(outputChannel);

  // Register formatter
  const formatter = vscode.languages.registerDocumentFormattingEditProvider('supercode', {
    provideDocumentFormattingEdits(document) {
      return formatDocument(document);
    }
  });

  const rangeFormatter = vscode.languages.registerDocumentRangeFormattingEditProvider('supercode', {
    provideDocumentRangeFormattingEdits(document, range) {
      return formatRange(document, range);
    }
  });

  context.subscriptions.push(formatter, rangeFormatter);

  // Register completion provider
  const completionProvider = vscode.languages.registerCompletionItemProvider(
    'supercode',
    {
      provideCompletionItems(document, position) {
        const completionItems = [];

        // Keywords
        keywords.forEach(k => {
          const it = new vscode.CompletionItem(k, vscode.CompletionItemKind.Keyword);
          it.detail = 'SuperCode keyword';
          it.sortText = '1_' + k;
          completionItems.push(it);
        });

        // Types
        types.forEach(t => {
          const it = new vscode.CompletionItem(t, vscode.CompletionItemKind.TypeParameter);
          it.detail = 'SuperCode type';
          it.sortText = '2_' + t;
          completionItems.push(it);
        });

        // Built-in functions
        builtins.forEach(b => {
          const it = new vscode.CompletionItem(b, vscode.CompletionItemKind.Function);
          it.detail = 'Built-in function';
          it.sortText = '3_' + b;
          completionItems.push(it);
        });

        // Common snippets
        const fnSnippet = new vscode.CompletionItem('fnc', vscode.CompletionItemKind.Snippet);
        fnSnippet.insertText = new vscode.SnippetString('fnc ${1:name}[${2:params}]::${3:int} {\n\t${0}\n}');
        fnSnippet.detail = 'Function declaration';
        fnSnippet.sortText = '0_fnc_snippet';
        completionItems.push(fnSnippet);

        const ifSnippet = new vscode.CompletionItem('if', vscode.CompletionItemKind.Snippet);
        ifSnippet.insertText = new vscode.SnippetString('if [${1:condition}] {\n\t${0}\n}');
        ifSnippet.detail = 'If block';
        ifSnippet.sortText = '0_if_snippet';
        completionItems.push(ifSnippet);

        const loopSnippet = new vscode.CompletionItem('loop', vscode.CompletionItemKind.Snippet);
        loopSnippet.insertText = new vscode.SnippetString('loop [int ${1:i} = ${2:0}; ${1:i} < ${3:10}; ${1:i} = ${1:i} + 1] {\n\t${0}\n}');
        loopSnippet.detail = 'For loop';
        loopSnippet.sortText = '0_loop_snippet';
        completionItems.push(loopSnippet);

        const whileSnippet = new vscode.CompletionItem('while', vscode.CompletionItemKind.Snippet);
        whileSnippet.insertText = new vscode.SnippetString('while [${1:condition}] {\n\t${0}\n}');
        whileSnippet.detail = 'While loop';
        whileSnippet.sortText = '0_while_snippet';
        completionItems.push(whileSnippet);

        const grpSnippet = new vscode.CompletionItem('grp', vscode.CompletionItemKind.Snippet);
        grpSnippet.insertText = new vscode.SnippetString('grp ${1:Name} {\n\t${2:int x},\n\t${3:int y}\n}');
        grpSnippet.detail = 'Group (struct) definition';
        grpSnippet.sortText = '0_grp_snippet';
        completionItems.push(grpSnippet);

        const arrSnippet = new vscode.CompletionItem('arr', vscode.CompletionItemKind.Snippet);
        arrSnippet.insertText = new vscode.SnippetString('arr{${1:int}, ${2:10}} ${3:name} = {${0}};');
        arrSnippet.detail = 'Array declaration';
        arrSnippet.sortText = '0_arr_snippet';
        completionItems.push(arrSnippet);

        return completionItems;
      }
    },
    ':', '[', '{'  // Trigger on these characters
  );

  context.subscriptions.push(completionProvider);

  // Register hover provider
  const hoverProvider = vscode.languages.registerHoverProvider('supercode', {
    provideHover(document, position) {
      const range = document.getWordRangeAtPosition(position);
      if (!range) return null;

      const word = document.getText(range);

      if (keywords.includes(word)) {
        return new vscode.Hover(`**${word}** — SuperCode keyword\n\nControl flow and declarations.`);
      }

      if (types.includes(word)) {
        const typeInfo = {
          'int': 'Signed 64-bit integer (-2^63 to 2^63-1)',
          'byte': 'Unsigned 8-bit integer (0-255, wraps on overflow)',
          'char': 'Single character (8-bit ASCII)',
          'deci': 'Decimal/floating-point number',
          'string': 'Dynamic text (up to 1MB)',
          'void': 'No return value'
        };
        return new vscode.Hover(`**${word}** — ${typeInfo[word] || 'SuperCode type'}`);
      }

      if (builtins.includes(word)) {
        const builtinInfo = {
          'print': 'Print value to stdout',
          'show': 'Print value to stdout (alias)',
          '@open': 'Open file: @open[filename, mode]',
          '@close': 'Close file: @close[fd]',
          '@read': 'Read from file: @read[fd, buffer]',
          '@write': 'Write to file: @write[fd, data]',
          '@strlen': 'Get string length: @strlen[str]'
        };
        return new vscode.Hover(`**${word}** — ${builtinInfo[word] || 'Built-in function'}`);
      }

      return null;
    }
  });

  context.subscriptions.push(hoverProvider);

  // Register run command
  const runCommand = vscode.commands.registerCommand('supercode.run', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('No active editor');
      return;
    }

    const document = editor.document;
    if (document.languageId !== 'supercode') {
      vscode.window.showErrorMessage('This is not a SuperCode! file');
      return;
    }

    // Save the file first
    if (document.isDirty) {
      await document.save();
    }

    // Run the file
    await runner.run(document.fileName);
  });

  // Register stop command
  const stopCommand = vscode.commands.registerCommand('supercode.stop', () => {
    runner.stop();
    outputChannel.appendLine('⏹ Stopped');
  });

  // Register run by file URI (for context menu)
  const runFileCommand = vscode.commands.registerCommand('supercode.runFile', async (fileUri) => {
    if (!fileUri || !fileUri.fsPath) {
      vscode.window.showErrorMessage('No file selected');
      return;
    }

    // Save any open editors first
    await vscode.workspace.saveAll();

    // Run the file
    await runner.run(fileUri.fsPath);
  });

  context.subscriptions.push(runCommand, stopCommand, runFileCommand, outputChannel);
}

function deactivate() {}

module.exports = { activate, deactivate };
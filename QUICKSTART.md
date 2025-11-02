# Quick Start Guide - SuperCode VS Code Extension

## Setup (30 seconds)

1. **Open the extension folder in VS Code:**
   ```bash
   cd /home/void/Desktop/scc/vscode-supercode
   code .
   ```

2. **Press F5** to launch the Extension Development Host
   - A new VS Code window will open with the extension loaded

3. **Create a test file:**
   - In the host window, create a file named `test.sc`
   - The language should auto-detect as "SuperCode"
   - Or click the language selector (bottom-right) and choose "SuperCode"

## Try It Out

### Syntax Highlighting
Copy this into `test.sc` and observe the colors:

```supercode
fnc main[]::int {
    print["Hello, SuperCode!"];
    loop [int i = 0; i < 5; i = i + 1] {
        print[i];
    }
    get[0];
}
```

Expected highlighting:
- `fnc`, `int`, `loop` → Blue (keywords/types)
- `"..."` → Green (strings)
- `i = 0` → Normal (variables/operators)
- `[ ]` `{ }` → Normal (brackets)

### Auto-Formatting
1. Paste messy code into your file:
   ```supercode
   fnc     add[a,b]::int{int x=a+b;get[x];}
   ```

2. Press **Shift+Alt+F** (or Cmd+Shift+P → "Format Document")
3. Watch it transform to:
   ```supercode
   fnc add[a, b]::int {
       int x = a + b;
       get[x];
   }
   ```

### Code Completions
1. Start typing `fnc` and press **Ctrl+Space**
   - See "fnc" with a snippet hint
   - Press Enter to insert the function skeleton

2. Try other snippets:
   - `loop` → For loop template
   - `if` → If statement template
   - `print` → Print statement
   - `grp` → Group definition

3. Hover over keywords to see documentation

### Try the Example
1. Open `/home/void/Desktop/scc/vscode-supercode/examples/hello.sc`
2. All features should work on this complete program
3. Press Shift+Alt+F to format the entire file

## Key Features Breakdown

| Feature | How to Use |
|---------|-----------|
| **Syntax Highlighting** | Open any `.sc` file — automatic |
| **Code Formatting** | Shift+Alt+F or right-click → Format |
| **Completions** | Ctrl+Space while typing |
| **Snippets** | Type keyword → Ctrl+Space → Enter |
| **Hover Info** | Hover over any keyword/builtin |
| **Error Squiggles** | Currently not supported (future feature) |

## File Structure

```
vscode-supercode/
├── package.json                    ← Extension metadata
├── extension.js                    ← Formatter, completions, hover (MAIN)
├── formatter.js                    ← Formatting logic
├── language-configuration.json     ← Brackets, comments config
├── syntaxes/
│   └── supercode.tmLanguage.json  ← Highlighting rules (MAIN)
├── snippets/
│   └── supercode.json             ← 30+ code snippets (MAIN)
├── examples/
│   └── hello.sc                   ← Full demo program
└── README.md                       ← Full documentation
```

## Troubleshooting

### Extension doesn't load
- Press Ctrl+Shift+P and search "Developer: Reload Window"
- Check the "Problems" tab for errors

### Highlighting not working
- Ensure file has `.sc` or `.supercode` extension
- Check language selector (bottom-right) shows "SuperCode"
- Restart the Extension Development Host (Ctrl+R)

### Formatting produces weird results
- This is expected for edge cases
- Let me know what looks wrong and I can improve it

### Completions don't appear
- Press Ctrl+Space explicitly (not automatic)
- Or type first few letters then Ctrl+Space

## Next Steps

### To Modify the Extension
1. Edit any file
2. Press **Ctrl+R** in the extension window to reload
3. Changes appear immediately

### To Package for Distribution
```bash
npm install -g vsce
cd vscode-supercode
vsce package
```

Creates `vscode-supercode-0.0.1.vsix` that can be installed in any VS Code.

### To Add More Features
- **More snippets**: Edit `snippets/supercode.json`
- **Better highlighting**: Edit `syntaxes/supercode.tmLanguage.json`
- **Better formatting**: Edit `formatter.js`
- **More completions**: Edit `extension.js`
- **Diagnostics/validation**: Extend `extension.js` with diagnostic providers

## Support for Full SuperCode Syntax

This extension now supports:

✅ All primitive types (int, byte, char, deci, string)
✅ All keywords (fnc, if, else, while, loop, break, continue, get, grp, arr, map)
✅ All operators (arithmetic, comparison, logical, bitwise)
✅ All built-in functions (@open, @close, @read, @write, @strlen, etc.)
✅ Comments (// and /* */)
✅ Arrays, groups, and maps syntax
✅ Function declarations with parameters and return types
✅ Proper indentation and spacing
✅ 30+ code snippets for rapid coding

## Performance

- Zero external dependencies
- Lightweight grammar (~250 lines JSON)
- Instant activation on first `.sc` file
- Formatting is O(n) with document size
- No network calls or background processes

---

**Questions?** Check the full README.md or the examples folder!

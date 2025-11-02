/**
 * SuperCode Formatter
 * Provides document formatting with proper indentation and spacing
 */

const vscode = require('vscode');

/**
 * Format SuperCode document with proper indentation and spacing rules
 */
function formatDocument(document) {
  const edits = [];
  const lines = document.getText().split('\n');
  let indentLevel = 0;
  const indentString = '    '; // 4 spaces per indent level
  const formattedLines = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    const trimmedLine = line.trim();

    // Skip empty lines
    if (!trimmedLine) {
      formattedLines.push('');
      continue;
    }

    // Decrease indent for closing braces at the start
    if (trimmedLine.startsWith('}')) {
      indentLevel = Math.max(0, indentLevel - 1);
    }

    // Build formatted line
    let formattedLine = indentString.repeat(indentLevel) + trimmedLine;

    // Normalize spacing around operators and brackets
    formattedLine = normalizeSpacing(formattedLine);

    formattedLines.push(formattedLine);

    // Increase indent for opening braces at the end
    if (trimmedLine.endsWith('{')) {
      indentLevel++;
    }
  }

  // Generate edits to replace entire document
  const fullRange = new vscode.Range(
    document.lineAt(0).range.start,
    document.lineAt(document.lineCount - 1).range.end
  );

  const newText = formattedLines.join('\n');
  edits.push(new vscode.TextEdit(fullRange, newText));

  return edits;
}

/**
 * Normalize spacing around operators and punctuation
 */
function normalizeSpacing(line) {
  // Don't touch strings
  if (isInString(line, 0)) return line;

  // Normalize spaces around = (but not inside function calls)
  line = line.replace(/\s*=\s*/g, ' = ');

  // Normalize spaces around comparison operators
  line = line.replace(/\s*(==|!=|<=|>=|<|>)\s*/g, ' $1 ');

  // Normalize spaces around logical operators
  line = line.replace(/\s*(&&|\|\|)\s*/g, ' $1 ');

  // Normalize spaces around comma (space after, not before)
  line = line.replace(/\s*,\s*/g, ', ');

  // Fix spacing for function calls and control flow
  // 'if [', 'while [', 'loop [', etc.
  line = line.replace(/\b(if|while|loop|else)\s*\[/g, '$1 [');
  line = line.replace(/\b(fnc)\s+/g, '$1 ');
  line = line.replace(/\b(grp)\s+/g, '$1 ');
  line = line.replace(/\b(print|show)\s*\[/g, '$1[');

  // Remove extra spaces
  line = line.replace(/\s+/g, ' ');

  return line;
}

/**
 * Check if a position is inside a string literal (simple heuristic)
 */
function isInString(line, position) {
  let inString = false;
  let escapeNext = false;

  for (let i = 0; i < position && i < line.length; i++) {
    if (escapeNext) {
      escapeNext = false;
      continue;
    }

    if (line[i] === '\\') {
      escapeNext = true;
      continue;
    }

    if (line[i] === '"') {
      inString = !inString;
    }
  }

  return inString;
}

/**
 * Format a specific range instead of full document
 */
function formatRange(document, range) {
  const text = document.getText(range);
  const lines = text.split('\n');
  let indentLevel = countIndentAtStart(document, range.start.line);
  const indentString = '    ';
  const formattedLines = [];

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      formattedLines.push('');
      continue;
    }

    if (trimmed.startsWith('}')) {
      indentLevel = Math.max(0, indentLevel - 1);
    }

    let formatted = indentString.repeat(indentLevel) + trimmed;
    formatted = normalizeSpacing(formatted);

    formattedLines.push(formatted);

    if (trimmed.endsWith('{')) {
      indentLevel++;
    }
  }

  return [new vscode.TextEdit(range, formattedLines.join('\n'))];
}

/**
 * Count indentation level at a given line
 */
function countIndentAtStart(document, lineNum) {
  let level = 0;
  for (let i = 0; i < lineNum && i < document.lineCount; i++) {
    const line = document.lineAt(i).text.trim();
    if (line.endsWith('{')) level++;
    if (line.startsWith('}')) level--;
  }
  return Math.max(0, level);
}

module.exports = {
  formatDocument,
  formatRange
};

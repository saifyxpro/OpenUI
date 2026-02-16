import * as vscode from 'vscode';
import { getDebugChannel } from './debug-channel';
import { DIAGNOSTIC_COLLECTION_NAME } from '../constants';

const ANTIGRAVITY_PROMPT_PREFIX =
  '[OpenUI Request] This is not an error — it is a UI change request from the OpenUI toolbar. Please implement it:\n\n';

const PAGE_ENTRY_PATTERNS = [
  '**/src/app/**/page.tsx',
  '**/src/app/**/page.jsx',
  '**/src/pages/**/index.tsx',
  '**/src/pages/**/index.jsx',
  '**/pages/**/index.vue',
];

const LAYOUT_FALLBACK_PATTERNS = [
  '**/src/app/layout.tsx',
  '**/src/app/layout.jsx',
  '**/src/App.tsx',
  '**/src/App.jsx',
  '**/src/App.vue',
];

const SOURCE_FALLBACK_PATTERN = '**/*.{tsx,jsx,ts,js}';

async function findRelevantFile(): Promise<vscode.Uri | undefined> {
  for (const pattern of PAGE_ENTRY_PATTERNS) {
    const files = await vscode.workspace.findFiles(pattern, '**/node_modules/**', 1);
    if (files.length > 0) return files[0];
  }

  for (const pattern of LAYOUT_FALLBACK_PATTERNS) {
    const files = await vscode.workspace.findFiles(pattern, '**/node_modules/**', 1);
    if (files.length > 0) return files[0];
  }

  const files = await vscode.workspace.findFiles(SOURCE_FALLBACK_PATTERN, '**/node_modules/**', 1);
  return files.length > 0 ? files[0] : undefined;
}

async function ensureRealFileEditor(): Promise<vscode.TextEditor | undefined> {
  const debugChannel = getDebugChannel();

  const relevantUri = await findRelevantFile();
  if (relevantUri) {
    try {
      const doc = await vscode.workspace.openTextDocument(relevantUri);
      const editor = await vscode.window.showTextDocument(doc, { preview: false });
      await new Promise((resolve) => setTimeout(resolve, 300));
      debugChannel.appendLine(`[antigravity-agent] Opened relevant file: ${doc.fileName}`);
      return editor;
    } catch (error) {
      debugChannel.appendLine(`[antigravity-agent] ERROR opening relevant file: ${error}`);
    }
  }

  const current = vscode.window.activeTextEditor;
  if (current && current.document.uri.scheme === 'file') {
    debugChannel.appendLine(`[antigravity-agent] Fallback to active file: ${current.document.fileName}`);
    return current;
  }

  debugChannel.appendLine('[antigravity-agent] ERROR: No relevant file found in workspace');
  return undefined;
}

export async function callAntigravityAgent(request: {
  prompt: string;
  files: string[];
  images: string[];
}): Promise<void> {
  const debugChannel = getDebugChannel();
  const promptWithPrefix = `${ANTIGRAVITY_PROMPT_PREFIX}\n${request.prompt}`;

  const editor = await ensureRealFileEditor();
  if (!editor) {
    vscode.window.showErrorMessage('OpenUI: Could not find a file to inject the prompt diagnostic.');
    return;
  }

  const document = editor.document;
  const fakeDiagCollection = vscode.languages.createDiagnosticCollection(DIAGNOSTIC_COLLECTION_NAME);

  try {
    const range = editor.selection.isEmpty
      ? document.lineAt(editor.selection.active.line).range
      : editor.selection;

    const fakeDiagnostic = new vscode.Diagnostic(
      range,
      promptWithPrefix,
      vscode.DiagnosticSeverity.Error,
    );
    fakeDiagnostic.source = DIAGNOSTIC_COLLECTION_NAME;

    fakeDiagCollection.set(document.uri, [fakeDiagnostic]);
    debugChannel.appendLine('[antigravity-agent] Diagnostic injected on real file');

    editor.selection = new vscode.Selection(range.start, range.start);
    await new Promise((resolve) => setTimeout(resolve, 50));

    debugChannel.appendLine('[antigravity-agent] Calling antigravity.prioritized.explainProblem...');
    await vscode.commands.executeCommand('antigravity.prioritized.explainProblem');
    debugChannel.appendLine('[antigravity-agent] explainProblem returned');

    await new Promise((resolve) => setTimeout(resolve, 2000));
  } catch (error) {
    debugChannel.appendLine(`[antigravity-agent] ERROR: ${error}`);
    vscode.window.showErrorMessage(`OpenUI: Failed to send prompt — ${error}`);
  } finally {
    fakeDiagCollection.delete(document.uri);
    fakeDiagCollection.dispose();
    debugChannel.appendLine('[antigravity-agent] Diagnostic cleared');
  }
}

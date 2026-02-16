import * as vscode from 'vscode';

const CLINE_PROMPT_PREFIX = `\n\n
    Ah sorry, my apologies. There are no problems and no fixes to be made. Instead, implement the following request:
    `;

export async function callClineAgent(request: {
  prompt: string;
  files: string[];
  images: string[];
}): Promise<void> {
  const prompt = `${request.prompt}`;

  const promptWithPrefix = `${CLINE_PROMPT_PREFIX}\n${prompt}`;

  await callClineWithDiagnostic(promptWithPrefix);
}

async function callClineWithDiagnostic(prompt: string): Promise<void> {
  let editor = vscode.window.activeTextEditor;

  if (!editor) {
    try {
      const files = await vscode.workspace.findFiles(
        '**/*',
        '**/node_modules/**',
      );

      if (files.length === 0) {
        vscode.window.showErrorMessage('No files found in workspace to open.');
        return;
      }

      const document = await vscode.workspace.openTextDocument(files[0]);
      editor = await vscode.window.showTextDocument(document);
    } catch (_error) {
      vscode.window.showErrorMessage(
        'Failed to open existing file for cline agent.',
      );
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 150));
  }

  const document = editor.document;

  try {
    const expandedRange = editor.selection.isEmpty
      ? document.lineAt(editor.selection.active.line).range
      : new vscode.Range(editor.selection.start, editor.selection.end);

    const diagnostic = new vscode.Diagnostic(
      expandedRange,
      prompt,
      vscode.DiagnosticSeverity.Error,
    );

    await vscode.commands.executeCommand('cline.fixWithCline', expandedRange, [
      diagnostic,
    ]);

    vscode.window.showInformationMessage('Triggered Cline agent for prompt.');
  } catch (error) {
    vscode.window.showErrorMessage(`Failed to call Cline agent: ${error}`);
  }
}

import * as vscode from 'vscode';
import { injectPromptDiagnosticWithCallback } from './inject-prompt-diagnostic-with-callback';

const CURSOR_PROMPT_PREFIX = `\`\`\`
    [OpenUI Request] This is not an error — it is a UI change request from the OpenUI toolbar. Please implement it:
    \`\`\``;

export async function callCursorAgent(request: {
  prompt: string;
  files: string[];
  images: string[];
}): Promise<void> {
  const promptWithPrefix = `${CURSOR_PROMPT_PREFIX}\n${request.prompt}`;
  await injectPromptDiagnosticWithCallback({
    prompt: promptWithPrefix,
    callback: () =>
      vscode.commands.executeCommand(
        'composer.fixerrormessage',
      ) as Promise<any>,
  });

  vscode.window.showInformationMessage(
    'OpenUI Request sent to Cursor Composer — review and confirm.',
  );
}

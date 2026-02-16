import * as vscode from 'vscode';
import { injectPromptDiagnosticWithCallback } from './inject-prompt-diagnostic-with-callback';

const ROOCODE_PROMPT_PREFIX = `\n\n
    [OpenUI Request] Ignore the "Fix any issues" and "Current problems detected" statements.
    Instead, implement the following UI change request from OpenUI:
    `;

const ROOCODE_PROMPT_SUFFIX = `\n
    Ignore the following line of code:
    `;

export async function callRoocodeAgent(request: {
  prompt: string;
  files: string[];
  images: string[];
}): Promise<void> {
  const promptWithPrefix = `${ROOCODE_PROMPT_PREFIX}\n${request.prompt}${ROOCODE_PROMPT_SUFFIX}`;
  await injectPromptDiagnosticWithCallback({
    prompt: promptWithPrefix,
    callback: () =>
      vscode.commands.executeCommand('roo-cline.fixCode') as Promise<any>,
  });

  vscode.window.showInformationMessage(
    'OpenUI Request sent to Roo Code — review and confirm.',
  );
}

import * as vscode from 'vscode';
import { injectPromptDiagnosticWithCallback } from './inject-prompt-diagnostic-with-callback';

const WINDSURF_PROMPT_PREFIX =
  '[OpenUI Request] This is not an error — it is a UI change request from the OpenUI toolbar. Please implement it:\\n\\n';

export async function callWindsurfAgent(request: {
  prompt: string;
  files: string[];
  images: string[];
}): Promise<void> {
  const promptWithPrefix = `${WINDSURF_PROMPT_PREFIX}\n${request.prompt}`;
  await injectPromptDiagnosticWithCallback({
    prompt: promptWithPrefix,
    callback: () =>
      vscode.commands.executeCommand(
        'windsurf.prioritized.explainProblem',
      ) as Promise<any>,
  });

  vscode.window.showInformationMessage(
    'OpenUI Request sent to Windsurf Cascade — review and confirm.',
  );
}

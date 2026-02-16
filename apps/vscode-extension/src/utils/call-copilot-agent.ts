import * as vscode from 'vscode';

export async function callCopilotAgent(request: {
  prompt: string;
  files: string[];
  images: string[];
}): Promise<void> {
  await vscode.commands.executeCommand('workbench.action.chat.openagent');
  await vscode.commands.executeCommand('workbench.action.chat.submit', {
    inputValue: request.prompt,
  });

  vscode.window.showInformationMessage(
    'OpenUI Request sent to GitHub Copilot chat.',
  );
}

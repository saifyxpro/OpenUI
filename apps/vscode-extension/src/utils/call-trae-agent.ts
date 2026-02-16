import * as vscode from 'vscode';

export async function callTraeAgent(request: {
  prompt: string;
  files: string[];
  images: string[];
}): Promise<void> {
  await vscode.commands.executeCommand('workbench.action.chat.icube.open', {
    query: request.prompt,
    newChat: true,
    keepOpen: true,
  });

  vscode.window.showInformationMessage(
    'OpenUI Request added to Trae chat — review and confirm.',
  );
}

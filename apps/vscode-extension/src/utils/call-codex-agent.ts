import * as vscode from 'vscode';

export async function callCodexAgent(request: {
  prompt: string;
  files: string[];
  images: string[];
}): Promise<void> {
  try {
    await vscode.commands.executeCommand('chatgpt.addToThread', request.prompt);
    vscode.window.showInformationMessage(
      'OpenUI: Prompt added to Codex thread — review and send.',
    );
  } catch {
    await vscode.commands.executeCommand('chatgpt.openSidebar');
    await new Promise((resolve) => setTimeout(resolve, 500));
    await vscode.commands.executeCommand('chatgpt.addToThread', request.prompt);
    vscode.window.showInformationMessage(
      'OpenUI: Prompt added to Codex thread — review and send.',
    );
  }
}

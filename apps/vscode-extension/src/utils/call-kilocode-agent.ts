import * as vscode from 'vscode';

export async function callKilocodeAgent(request: {
  prompt: string;
  files: string[];
  images: string[];
}): Promise<void> {
  await vscode.commands.executeCommand('kilo-code.newTask', {
    prompt: request.prompt,
  });

  vscode.window.showInformationMessage(
    'OpenUI Request sent to Kilo Code — review and confirm.',
  );
}

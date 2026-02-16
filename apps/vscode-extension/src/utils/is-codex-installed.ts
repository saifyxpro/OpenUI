import * as vscode from 'vscode';

export function isCodexInstalled(): boolean {
  const extensionId = 'openai.chatgpt';
  const extension = vscode.extensions.getExtension(extensionId);
  return !!extension;
}

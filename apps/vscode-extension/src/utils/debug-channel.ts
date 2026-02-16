import * as vscode from 'vscode';

let channel: vscode.OutputChannel | null = null;

export function getDebugChannel(): vscode.OutputChannel {
  if (!channel) {
    channel = vscode.window.createOutputChannel('OpenUI Debug');
  }
  return channel;
}

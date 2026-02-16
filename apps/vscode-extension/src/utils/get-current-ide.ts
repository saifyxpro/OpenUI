import * as vscode from 'vscode';

export type IDE = 'VSCODE' | 'WINDSURF' | 'CURSOR' | 'TRAE' | 'ANTIGRAVITY' | 'UNKNOWN';

export function getCurrentIDE(): IDE {
  const appName = vscode.env.appName.toLowerCase();
  if (appName.includes('antigravity')) {
    return 'ANTIGRAVITY';
  } else if (appName.includes('windsurf')) {
    return 'WINDSURF';
  } else if (appName.includes('cursor')) {
    return 'CURSOR';
  } else if (appName.includes('visual studio code') || appName === 'code') {
    return 'VSCODE';
  } else if (appName.includes('trae')) {
    return 'TRAE';
  }

  return 'UNKNOWN';
}


import * as vscode from 'vscode';
import type { StorageService } from 'src/services/storage-service';
import { AnalyticsService } from 'src/services/analytics-service';
import { EventName } from 'src/services/analytics-service';

export function createGettingStartedPanel(
  context: vscode.ExtensionContext,
  storage: StorageService,
): vscode.WebviewPanel {
  const panel = vscode.window.createWebviewPanel(
    'openuiGettingStarted',
    'Getting Started with OpenUI',
    vscode.ViewColumn.One,
    {
      enableScripts: true,
      retainContextWhenHidden: true,
    },
  );
  panel.webview.html = getWebviewContent();

  void storage.set('openui.hasSeenGettingStarted', true);

  panel.webview.onDidReceiveMessage(
    async (message) => {
      switch (message.command) {
        case 'openTerminal': {
          const terminal = vscode.window.createTerminal({
            cwd: vscode.workspace.workspaceFolders?.[0]?.uri.fsPath,
          });
          terminal.show();
          terminal.sendText('npx openui@latest -b', false);
          break;
        }
        case 'dismissPanel':
          AnalyticsService.getInstance().trackEvent(
            EventName.DISMISSED_GETTING_STARTED_PANEL,
          );
          panel.dispose();
          break;
      }
    },
    undefined,
    context.subscriptions,
  );

  return panel;
}

function getWebviewContent(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Getting Started with OpenUI</title>
    <style>
        body {
            font-family: var(--vscode-font-family), system-ui, -apple-system, sans-serif;
            color: var(--vscode-foreground);
            background: var(--vscode-editor-background);
            padding: 2.5rem 2rem;
            max-width: 620px;
            margin: 0 auto;
            line-height: 1.6;
        }
        .logo {
            display: flex;
            align-items: center;
            gap: 0.6rem;
            margin-bottom: 0.5rem;
        }
        .logo svg {
            width: 28px;
            height: 28px;
        }
        .logo span {
            font-size: 1.4rem;
            font-weight: 700;
            letter-spacing: -0.02em;
        }
        .subtitle {
            color: var(--vscode-descriptionForeground);
            margin-bottom: 2rem;
            font-size: 0.92rem;
        }
        .step {
            display: flex;
            gap: 0.85rem;
            padding: 0.85rem;
            margin-bottom: 0.5rem;
            border-radius: 8px;
            border: 1px solid transparent;
            transition: border-color 0.15s ease, background 0.15s ease;
        }
        .step:hover {
            border-color: var(--vscode-editorWidget-border);
            background: var(--vscode-editorWidget-background);
        }
        .step-number {
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            width: 26px;
            height: 26px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 0.8rem;
            flex-shrink: 0;
            margin-top: 1px;
        }
        .step-content h3 {
            margin: 0 0 0.2rem;
            font-size: 0.95rem;
            font-weight: 600;
        }
        .step-content p {
            margin: 0;
            color: var(--vscode-descriptionForeground);
            font-size: 0.85rem;
        }
        code {
            background: var(--vscode-textCodeBlock-background);
            padding: 0.12rem 0.35rem;
            border-radius: 3px;
            font-family: var(--vscode-editor-font-family), monospace;
            font-size: 0.82rem;
        }
        .actions {
            display: flex;
            gap: 0.5rem;
            margin-top: 1.5rem;
        }
        .btn {
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
            padding: 0.5rem 1rem;
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.85rem;
            font-weight: 500;
            transition: background 0.12s ease;
        }
        .btn:hover { background: var(--vscode-button-hoverBackground); }
        .tag {
            display: inline-block;
            background: var(--vscode-badge-background);
            color: var(--vscode-badge-foreground);
            padding: 0.08rem 0.45rem;
            border-radius: 10px;
            font-size: 0.72rem;
            font-weight: 600;
        }
        .divider {
            border: none;
            border-top: 1px solid var(--vscode-editorWidget-border);
            margin: 1.5rem 0;
        }
    </style>
</head>
<body>
    <div class="logo">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="24" rx="6" fill="var(--vscode-button-background)"/>
            <path d="M7 8.5h10M7 12h7M7 15.5h10" stroke="var(--vscode-button-foreground)" stroke-width="1.8" stroke-linecap="round"/>
        </svg>
        <span>OpenUI</span>
    </div>
    <p class="subtitle">Select UI elements, describe changes, forward to your IDE's AI agent.</p>

    <div class="step">
        <div class="step-number">1</div>
        <div class="step-content">
            <h3>Start your dev app</h3>
            <p>Run your app in development mode as usual (e.g. <code>npm run dev</code>)</p>
        </div>
    </div>

    <div class="step">
        <div class="step-number">2</div>
        <div class="step-content">
            <h3>Launch OpenUI</h3>
            <p>Open a terminal in your project root and run <code>npx openui@latest</code></p>
        </div>
    </div>

    <div class="step">
        <div class="step-number">3</div>
        <div class="step-content">
            <h3>Select elements & describe changes</h3>
            <p>Click any UI element in the browser toolbar overlay, then type what you want to change</p>
        </div>
    </div>

    <div class="step">
        <div class="step-number">4</div>
        <div class="step-content">
            <h3>Forwarded to your IDE</h3>
            <p>Your prompt is tagged <span class="tag">@openui</span> and sent to your IDE's AI chat (Antigravity, Copilot, Cursor). Just press Enter to apply.</p>
        </div>
    </div>

    <hr class="divider">

    <div class="actions">
        <button class="btn" onclick="vscode.postMessage({command: 'openTerminal'})">
            Get Started — Open Terminal
        </button>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
    </script>
</body>
</html>`;
}

export async function shouldShowGettingStarted(
  storage: StorageService,
): Promise<boolean> {
  return !(await storage.get('openui.hasSeenGettingStarted', false));
}

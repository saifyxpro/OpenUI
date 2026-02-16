import * as vscode from 'vscode';
import { AnalyticsService, EventName } from 'src/services/analytics-service';
import { removeOldToolbarPrompt } from 'src/auto-prompts/remove-old-toolbar';
import type { StorageService } from 'src/services/storage-service';

export function createTimeToUpgradePanel(
  context: vscode.ExtensionContext,
  storage: StorageService,
  _onRemoveOldToolbar: () => Promise<void>,
): vscode.WebviewPanel {
  const panel = vscode.window.createWebviewPanel(
    'openuiTimeToUpgrade',
    'Time to Upgrade — OpenUI',
    vscode.ViewColumn.One,
    {
      enableScripts: true,
      retainContextWhenHidden: true,
    },
  );
  panel.webview.html = getWebviewContent();

  void storage.set('openui.hasSeenTimeToUpgrade', true);

  panel.webview.onDidReceiveMessage(
    async (message) => {
      switch (message.command) {
        case 'copyUninstallCommand':
          vscode.env.clipboard.writeText(removeOldToolbarPrompt);
          break;
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
            EventName.DISMISSED_TIME_TO_UPGRADE_PANEL,
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
    <title>Time to Upgrade — OpenUI</title>
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
            margin-bottom: 1.5rem;
            font-size: 0.92rem;
        }
        .card {
            background: var(--vscode-editorWidget-background);
            border: 1px solid var(--vscode-editorWidget-border);
            border-radius: 8px;
            padding: 1rem;
            margin-bottom: 0.75rem;
            transition: border-color 0.15s ease;
        }
        .card:hover {
            border-color: var(--vscode-focusBorder);
        }
        .card h3 {
            margin: 0 0 0.35rem;
            font-size: 0.95rem;
            font-weight: 600;
        }
        .card p {
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
        .warning {
            background: var(--vscode-inputValidation-warningBackground);
            border: 1px solid var(--vscode-inputValidation-warningBorder);
            border-radius: 8px;
            padding: 0.75rem 1rem;
            margin-bottom: 1.25rem;
            font-size: 0.85rem;
            line-height: 1.5;
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
            margin-top: 0.5rem;
            transition: background 0.12s ease;
        }
        .btn:hover { background: var(--vscode-button-hoverBackground); }
        .btn-secondary {
            background: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
        }
        .btn-secondary:hover { background: var(--vscode-button-secondaryHoverBackground); }
        .actions {
            display: flex;
            gap: 0.5rem;
            margin-top: 1.25rem;
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
    <p class="subtitle">OpenUI has moved to a CLI-based workflow — no more toolbar npm packages needed.</p>

    <div class="warning">
        The old <code>@openui-xio/toolbar-*</code> packages are deprecated. Remove them and use <code>npx openui@latest</code> instead.
    </div>

    <div class="card">
        <h3>Step 1: Remove old packages</h3>
        <p>Copy the uninstall prompt to your clipboard and paste it into your AI chat.</p>
        <button class="btn btn-secondary" onclick="vscode.postMessage({command: 'copyUninstallCommand'})">
            Copy Uninstall Prompt
        </button>
    </div>

    <div class="card">
        <h3>Step 2: Start OpenUI CLI</h3>
        <p>Run <code>npx openui@latest</code> in your project root. It proxies your dev app and injects the toolbar overlay.</p>
        <button class="btn" onclick="vscode.postMessage({command: 'openTerminal'})">
            Open Terminal & Run OpenUI
        </button>
    </div>

    <div class="card">
        <h3>Step 3: Done!</h3>
        <p>Select elements in the overlay, describe your changes, and they'll be forwarded to your IDE's AI chat tagged with <strong>@openui</strong>.</p>
    </div>

    <div class="actions">
        <button class="btn btn-secondary" onclick="vscode.postMessage({command: 'dismissPanel'})">
            Dismiss
        </button>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
    </script>
</body>
</html>`;
}

export async function shouldShowTimeToUpgrade(
  storage: StorageService,
): Promise<boolean> {
  return !(await storage.get('openui.hasSeenTimeToUpgrade', false));
}

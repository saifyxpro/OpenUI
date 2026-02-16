# OpenUI — VS Code Extension

IDE Bridge extension that connects the OpenUI browser toolbar to your IDE's AI agent.

[![VS Code Marketplace](https://img.shields.io/visual-studio-marketplace/v/openui.openui-vscode-extension?label=VS%20Code%20Marketplace)](https://marketplace.visualstudio.com/items?itemName=openui.openui-vscode-extension) ![License](https://img.shields.io/npm/l/openui)

## What it does

When you run the OpenUI CLI, the toolbar appears in your browser. This extension receives prompts from that toolbar and forwards them to your IDE's built-in AI chat (Cursor, Copilot, Windsurf, etc.).

**You click an element → describe a change → it appears in your IDE's AI chat, ready to send.**

## Install

1. Search **"OpenUI"** in the VS Code Extensions panel
2. Or install from the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=openui.openui-vscode-extension)

## Usage

1. Start your dev server (`npm run dev`)
2. Start the OpenUI CLI (`npx openui@latest`)
3. The extension auto-detects the toolbar and connects
4. Select elements in the browser, type your prompt, and it forwards to your IDE agent

## Supported Agents

| Agent | Supported |
|---|---|
| Antigravity | ✅ |
| Cursor | ✅ |
| GitHub Copilot | ✅ |
| Windsurf | ✅ |
| Cline | ✅ |
| Roo Code | ✅ |
| Kilo Code | ✅ |
| Trae | ✅ |

## License

AGPLv3 — see [LICENSE](../../LICENSE) for details.

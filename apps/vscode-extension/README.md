# OpenUI — VS Code Extension

IDE Bridge extension that connects the OpenUI browser toolbar to your IDE's AI agent.

<p>
  <a href="https://open-vsx.org/extension/saifyxpro/openui-vscode-extension"><img src="https://img.shields.io/open-vsx/v/saifyxpro/openui-vscode-extension?label=Open%20VSX&color=0969da" alt="Open VSX" /></a>
  <img src="https://img.shields.io/npm/l/openui-cli?color=0969da" alt="License" />
</p>

## What it does

When you run the OpenUI CLI, the toolbar appears in your browser. This extension receives prompts from that toolbar and forwards them to your IDE's built-in AI chat (Cursor, Copilot, Windsurf, etc.).

**You click an element → describe a change → it appears in your IDE's AI chat, ready to send.**

## Install

### Open VSX Registry (Cursor, Windsurf, and other AI IDEs)

1. Open the Extensions panel in your IDE
2. Search for **"OpenUI"** by `saifyxpro`
3. Or install directly from [Open VSX](https://open-vsx.org/extension/saifyxpro/openui-vscode-extension)

> **Note:** Most AI IDEs (Cursor, Windsurf, Trae) use the Open VSX Registry by default instead of the VS Code Marketplace.

## Usage

1. Start your dev server (`npm run dev`)
2. Start the OpenUI CLI (`npx openui-cli@latest`)
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
| Codex | ✅ |

## License

AGPLv3 — see [LICENSE](../../LICENSE) for details.

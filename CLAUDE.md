# General Information

This is a monorepo for OpenUI — a browser-to-IDE bridge that lets you select UI elements, describe changes, and forward prompts to your IDE's AI agent.

## Coding Guidelines

- Always write compact code
- Don't do premature optimization
- Only implement what you're being told to do
- Don't impact existing functionality unless explicitly told to do so
- Focus on your final goal instead of optimizing other parts of the app
- NEVER use `any`. NEVER use `unknown` unless absolutely necessary.

## Workflow in monorepo

- Don't run tests or dev scripts from the root. Call scripts from individual project directories.
- Always use pnpm as package manager and for script execution
- Make commits when arriving at solid intermediary steps

## Projects

### CLI
- **Package name**: `openui`
- **Path**: `apps/cli`
- **Purpose**: Proxy server that hosts the toolbar and the user's dev app on a single port. Discovers plugins, loads skills, and bridges to the IDE extension.

### VS Code Extension
- **Package name**: `openui-vscode-extension`
- **Path**: `apps/vscode-extension`
- **Purpose**: Receives prompts from the browser toolbar via WebSocket and forwards them to the IDE's AI agent (Cursor, Copilot, Windsurf, Cline, Roo Code, Kilo Code, Trae, Antigravity).

### Toolbar (Bridged)
- **Package name**: `@openui-dev/toolbar-bridged`
- **Path**: `toolbar/bridged`
- **Purpose**: The toolbar web app served by the CLI proxy, rendered on top of the user's dev app.

### Plugin SDK
- **Package name**: `@openui-dev/plugin-sdk`
- **Path**: `toolbar/plugin-sdk`
- **Purpose**: SDK for building OpenUI plugins that extend toolbar functionality.

### Agent Interface
- **Package name**: `@openui-dev/agent-interface`
- **Path**: `packages/agent-interface-external`
- **Purpose**: Agent communication protocol — defines the interface between toolbar and IDE agents.

### Karton
- **Package name**: `@openui-dev/karton`
- **Path**: `packages/karton`
- **Purpose**: WebSocket RPC framework for real-time state sync between CLI and toolbar.

### Plugins
- **React**: `plugins/react`
- **Vue**: `plugins/vue`
- **Angular**: `plugins/angular`
- **Template**: `plugins/template` (used by `create-openui-plugin`)

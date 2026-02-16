# Contributing to OpenUI

Welcome! This guide covers the project structure, local development, and contribution workflow.

---

## Project Structure

OpenUI is a **monorepo** using [pnpm workspaces](https://pnpm.io/workspaces) and [turborepo](https://turbo.build/).

### Apps (`apps/`)

| Directory | Description |
|---|---|
| `cli/` | The OpenUI CLI — proxy server, toolbar host, plugin loader, IDE bridge |
| `vscode-extension/` | VS Code extension that receives prompts from the toolbar and forwards to your IDE's AI agent |

### Packages (`packages/`)

| Package | Description |
|---|---|
| `agent-interface-external/` | Agent communication protocol for connecting the toolbar to IDE agents |
| `create-openui-plugin/` | `npx create-openui-plugin` scaffolding CLI |
| `karton/` | WebSocket RPC framework for real-time state sync |
| `karton-contract-bridged/` | Karton contract types for bridge mode |
| `openui-ui/` | Internal UI component library for the toolbar (Tailwind + Base UI) |
| `ui/` | Shared UI components (Radix-based) |
| `typescript-config/` | Shared TypeScript configuration |

### Plugins (`plugins/`)

| Plugin | Description |
|---|---|
| `react/` | React framework plugin |
| `vue/` | Vue framework plugin |
| `angular/` | Angular framework plugin |
| `template/` | Plugin template for `create-openui-plugin` |

### Toolbar (`toolbar/`)

| Directory | Description |
|---|---|
| `bridged/` | The toolbar web app served by the CLI proxy |
| `plugin-sdk/` | SDK for building OpenUI plugins |

### Examples (`examples/`)

Reference integrations for Next.js, Vue, Angular, Svelte, SolidJS, and Nuxt.

---

## How It Works

```
Browser                    CLI                     IDE
┌──────────┐    WebSocket   ┌──────────┐   Extension  ┌──────────┐
│ Toolbar  │ ──────────────>│  Proxy   │ ──────────── │ AI Agent │
│ (select  │                │  Server  │              │ (Cursor, │
│ elements)│                │          │              │  Copilot)│
└──────────┘                └──────────┘              └──────────┘
```

1. The **toolbar** (served by the CLI) lets users select DOM elements and type prompts
2. The **CLI proxy** wraps the user's dev app and injects the toolbar
3. The **VS Code extension** receives prompts via WebSocket and forwards to the IDE's AI chat

---

## Local Development

### Setup

```bash
pnpm install
pnpm build
```

### Running the CLI

```bash
cd apps/cli
pnpm dev
```

### Running the VS Code Extension

Open the `apps/vscode-extension/` folder in VS Code, then press `F5` to launch the Extension Development Host.

### Useful Commands

| Command | Description |
|---|---|
| `pnpm build` | Build all packages |
| `pnpm dev` | Start all dev servers |
| `pnpm lint` | Run linters and type checks |
| `pnpm test` | Run tests across packages |

---

## Changesets and Versioning

We use [Changesets](https://github.com/changesets/changesets) to manage versions and changelogs:

```bash
pnpm changeset
```

This will prompt you to select packages, choose a semver increment, and write a description. PRs without a changeset will fail CI if they modify published packages. For docs-only changes:

```bash
pnpm changeset --empty
```

---

## Contribution Guidelines

- Follow code style enforced by Biome and Lefthook
- Write clear, descriptive commit messages (Conventional Commits)
- Open a GitHub issue or draft PR before large changes
- Add tests for new functionality
- Prefer small, focused pull requests
- Include a changeset for any change affecting published packages

---

## Need Help?

- [Open an issue](https://github.com/saifyxpro/openui/issues) for bugs
- [Start a discussion](https://github.com/saifyxpro/openui/discussions) for feature ideas

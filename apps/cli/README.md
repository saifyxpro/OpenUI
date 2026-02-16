# OpenUI CLI

The command-line interface for OpenUI — select UI elements in your browser, describe changes, and forward prompts to your IDE's AI agent.

## Quick Start

```bash
npx openui@latest
```

Or with pnpm:

```bash
pnpm dlx openui@latest
```

## What it does

1. Starts a proxy server that overlays the OpenUI toolbar onto your running dev app
2. Discovers framework plugins (React, Vue, Angular) automatically
3. Connects to the OpenUI VS Code extension to forward prompts to your IDE

## Options

```
Usage: openui [options] [-- command]

Options:
  -p, --port <port>        Proxy port (default: 3100)
  -a, --app-port <port>    Your dev app port (default: prompt)
  -w, --workspace <path>   Workspace path (default: cwd)
  -s, --silent             Suppress banner output
  -v, --verbose            Enable debug logging
  -h, --help               Show help
```

## Command Wrapping

Run your dev server and OpenUI together:

```bash
npx openui@latest -- npm run dev
```

## Agent Support

| Agent | Supported |
|---|---|
| Cursor | ✅ |
| GitHub Copilot | ✅ |
| Windsurf | ✅ |
| Cline | ✅ |
| Roo Code | ✅ |
| Kilo Code | ✅ |
| Trae | ✅ |
| Antigravity | ✅ |

## License

AGPLv3 — see [LICENSE](../../LICENSE) for details.

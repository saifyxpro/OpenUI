<p align="center">
  <img src="public/icon.png" alt="OpenUI" width="120" height="120" />
</p>

<h1 align="center">OpenUI</h1>

<p align="center">
  <strong>Select UI elements, describe changes, forward to your IDE</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/openui-cli"><img src="https://img.shields.io/npm/v/openui-cli?style=for-the-badge&logo=npm&logoColor=white&label=NPM&color=0969da" alt="npm version" /></a>
  <a href="https://github.com/saifyxpro/openui/stargazers"><img src="https://img.shields.io/github/stars/saifyxpro/openui?style=for-the-badge&logo=github&logoColor=white&color=0969da" alt="GitHub stars" /></a>
  <a href="https://github.com/saifyxpro/openui/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/openui?style=for-the-badge&color=0969da" alt="License" /></a>
  <a href="https://open-vsx.org/extension/saifyxpro/openui-vscode-extension"><img src="https://img.shields.io/open-vsx/v/saifyxpro/openui-vscode-extension?style=for-the-badge&logo=open-vsx&logoColor=white&label=Open%20VSX&color=0969da" alt="Open VSX" /></a>
</p>

<br />

<p align="center">
  <img src="./public/demo.gif" alt="OpenUI demo" width="720" />
</p>

---

## About

**OpenUI** is a browser-to-IDE bridge for visual UI changes.

1. Click on any element in your running web app
2. Describe what you want to change
3. OpenUI forwards the prompt — with full element context — to your IDE's AI agent

> No more copy-pasting selectors or folder paths into chat. OpenUI captures real-time browser context and sends it straight to the agent.

## Features

- **Zero install** — run with `npx`, no dependencies to add
- **Framework agnostic** — works with React, Vue, Angular, Svelte, Next.js, Nuxt, and more
- **Plugin system** — extend functionality with custom plugins
- **Multi-agent support** — Cursor, Copilot, Codex, Windsurf, Cline, Roo Code, Kilo Code, Trae, and Antigravity
- **Open source** — AGPLv3

## Getting Started

### 1. Start your dev server

```bash
npm run dev
```

### 2. Run OpenUI (in a second terminal)

```bash
npx openui-cli@latest
```

Or with pnpm:

```bash
pnpm dlx openui-cli@latest
```

OpenUI will ask which port your app runs on, then open the toolbar overlay in your browser.

### 3. Install the VS Code extension

Install the **OpenUI** extension from the [Open VSX Registry](https://open-vsx.org/extension/saifyxpro/openui-vscode-extension) — it connects the toolbar to your IDE's AI agent. Works with Cursor, Windsurf, and other AI IDEs.

## Agent Support

All prompts are tagged with `@openui` and forwarded to your IDE's AI chat. You review the prompt and press Enter to send.

### IDE Built-in Agents

These agents are native to their respective IDEs and require no additional extensions.

| Agent | Command | Mechanism |
| --- | --- | --- |
| <img src="public/logos/antigravity.png" alt="Antigravity" width="20" align="center"> **Antigravity** | `antigravity.prioritized.explainProblem` | Diagnostic injection |
| <img src="public/logos/cursor.png" alt="Cursor" width="20" align="center"> **Cursor** | `composer.fixerrormessage` | Diagnostic injection |
| <img src="public/logos/windsurf.png" alt="Windsurf" width="20" align="center"> **Windsurf** | `windsurf.prioritized.explainProblem` | Diagnostic injection |
| <img src="public/logos/trae.png" alt="Trae" width="20" align="center"> **Trae** | `workbench.action.chat.icube.open` | Chat open with query |

### Extension Agents (VS Code only)

These extensions are auto-detected and supported in VS Code. When an extension agent is detected, it takes priority over the IDE's built-in chat.

| Extension | Command | Detection |
| --- | --- | --- |
| <img src="public/logos/codex.png" alt="Codex" width="20" align="center"> **Codex** | `chatgpt.addToThread` | `isCodexInstalled()` |
| <img src="public/logos/github_copilot.png" alt="GitHub Copilot" width="20" align="center"> **GitHub Copilot** | `workbench.action.chat.submit` | `isCopilotChatInstalled()` |
| <img src="public/logos/cline.png" alt="Cline" width="20" align="center"> **Cline** | `cline.reviewComment.addToChat` | `isClineInstalled()` |
| <img src="public/logos/roo_code.png" alt="Roo Code" width="20" align="center"> **Roo Code** | `roo-cline.fixCode` | `isRoocodeInstalled()` |
| <img src="public/logos/kilocode.png" alt="Kilo Code" width="20" align="center"> **Kilo Code** | `kilo-code.newTask` | `isKilocodeInstalled()` |

> **Tip:** You can select your preferred agent from the toolbar. Both built-in and extension agents are always available.

### Prompt Format

Every prompt sent to the IDE follows this structure:

```xml
@openui
<request>
<instruction>
You are a senior frontend engineer. The user is using the OpenUI toolbar
to request a UI change on their running web application.

### Task
The user selected a specific element on the page and described what they want changed.

### How to locate the element
1. Use the `xpath` to identify which element the user selected.
2. Use the `class` and `tag` to find the corresponding component in the source code.
3. Check the `text_content` to confirm you found the right element.
4. The `parent` context shows the container — use it to narrow down the file.

### Output format
- Respond only with the code changes needed.
- Edit the correct source file — do not create new files unless necessary.
- Preserve existing styling patterns (Tailwind, CSS modules, etc.).
</instruction>
<user_message>Make the button bigger and add a hover effect</user_message>
<page>
  <url>http://localhost:3000/dashboard</url>
  <title>Dashboard</title>
</page>
<selected_elements>
  <element_0>
    <tag>BUTTON</tag>
    <class>btn-primary px-4 py-2</class>
    <xpath>/html/body/main/div[2]/button</xpath>
    <text_content>Submit</text_content>
    <parent>
      <tag>DIV</tag>
      <class>flex items-center gap-4</class>
      <xpath>/html/body/main/div[2]</xpath>
    </parent>
  </element_0>
</selected_elements>
</request>
```

## License

OpenUI is offered under the [AGPLv3 license](https://www.gnu.org/licenses/agpl-3.0.html).

## Contributing

Check out our [CONTRIBUTING.md](https://github.com/saifyxpro/openui/blob/main/CONTRIBUTING.md) guide. For bugs and ideas, see [open issues](https://github.com/saifyxpro/openui/issues).

## Support

- [Open an issue](https://github.com/saifyxpro/openui/issues) for bugs and dev support

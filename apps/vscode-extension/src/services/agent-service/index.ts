import { AnalyticsService, EventName } from 'src/services/analytics-service';
import { dispatchAgentCall } from 'src/utils/dispatch-agent-call';
import {
  AgentStateType,
  createAgentServer,
  type UserMessage,
  type AgentServer,
  type UserMessageContentItem,
  type SelectedElement,
} from '@openui-dev/agent-interface/agent';
import * as vscode from 'vscode';
import { isClineInstalled } from 'src/utils/is-cline-installed';
import { isRoocodeInstalled } from 'src/utils/is-roocode-installed';
import { isKilocodeInstalled } from 'src/utils/is-kilocode-installed';
import { isCodexInstalled } from 'src/utils/is-codex-installed';
import { isCopilotChatInstalled } from 'src/utils/is-copilot-chat-installed';
import { getCurrentIDE } from 'src/utils/get-current-ide';

// Timeout constants for agent state transitions
const AGENT_COMPLETION_DELAY_MS = 300;
const AGENT_IDLE_DELAY_MS = 200;

export class AgentService {
  private static instance: AgentService;
  private analyticsService: AnalyticsService = AnalyticsService.getInstance();
  private server: AgentServer | null = null;

  private constructor() {
    // Private constructor to enforce singleton pattern
  }

  public shutdown() {
    this.server?.server.close();
    this.server?.wss.close();
    this.server = null;
  }

  public static getInstance(): AgentService {
    if (!AgentService.instance) {
      AgentService.instance = new AgentService();
    }
    return AgentService.instance;
  }

  public async initialize() {
    const { getDebugChannel } = await import('src/utils/debug-channel');
    const debugChannel = getDebugChannel();
    debugChannel.show(false);
    debugChannel.appendLine(`[OpenUI] initialize() called`);
    debugChannel.appendLine(`[OpenUI] appName: ${vscode.env.appName}`);
    debugChannel.appendLine(`[OpenUI] workspace: ${vscode.workspace.name}`);

    try {
      debugChannel.appendLine(`[OpenUI] Calling createAgentServer()...`);
      this.server = await createAgentServer();
      debugChannel.appendLine(`[OpenUI] Server created successfully!`);
      debugChannel.appendLine(`[OpenUI] Server port: ${this.server.port}`);
    } catch (error) {
      debugChannel.appendLine(`[OpenUI] ERROR creating server: ${error}`);
      debugChannel.appendLine(`[OpenUI] Error stack: ${error instanceof Error ? error.stack : 'N/A'}`);
      throw error;
    }

    this.server.interface.availability.set(true);

    debugChannel.appendLine(`[OpenUI] Agent is now available and listening`);

    debugChannel.appendLine('');
    debugChannel.appendLine('─'.repeat(50));
    const ide = getCurrentIDE();
    const workspaceName = vscode.workspace.name ?? 'No open workspace';

    debugChannel.appendLine('─'.repeat(50));
    debugChannel.appendLine(`[OpenUI] IDE: ${ide}`);

    if (ide === 'ANTIGRAVITY') {
      this.server.setAgentName(vscode.env.appName);
      this.server.setAgentDescription(workspaceName);
      debugChannel.appendLine('[OpenUI] Antigravity IDE — using built-in chat only');
      debugChannel.appendLine('─'.repeat(50));
    } else {
      debugChannel.appendLine('[OpenUI] Extension Detection (startup):');

      const extensionChecks = [
        { name: 'Cline', id: 'saoudrizwan.claude-dev', check: isClineInstalled },
        { name: 'Roo Code', id: 'rooveterinaryinc.roo-cline', check: isRoocodeInstalled },
        { name: 'Kilo Code', id: 'kilocode.kilo-code', check: isKilocodeInstalled },
        { name: 'Codex', id: 'openai.chatgpt', check: isCodexInstalled },
        { name: 'Copilot Chat', id: 'github.copilot-chat', check: isCopilotChatInstalled },
      ];

      let firstDetected: string | null = null;
      const detectedNames: string[] = [];
      for (const ext of extensionChecks) {
        const installed = ext.check();
        const extension = vscode.extensions.getExtension(ext.id);
        debugChannel.appendLine(
          `  ${installed ? '✓' : '✗'} ${ext.name} (${ext.id}) — ${installed ? `FOUND (active: ${extension?.isActive})` : 'NOT INSTALLED'}`,
        );
        if (installed) {
          detectedNames.push(ext.name);
          if (!firstDetected) {
            firstDetected = ext.name;
          }
        }
      }

      const relatedExtensions = vscode.extensions.all.filter(
        (ext) =>
          ext.id.includes('chatgpt') ||
          ext.id.includes('codex') ||
          ext.id.includes('openai.') ||
          ext.id.includes('claude-dev') ||
          ext.id.includes('roo-cline'),
      );
      if (relatedExtensions.length > 0) {
        debugChannel.appendLine('[OpenUI] Related extensions in registry:');
        for (const ext of relatedExtensions) {
          debugChannel.appendLine(`  → ${ext.id} (active: ${ext.isActive})`);
        }
      }

      if (firstDetected) {
        this.server.setAgentName(vscode.env.appName);
        this.server.setAgentDescription(
          `${workspaceName} | detected: ${detectedNames.join(', ')}`,
        );
        debugChannel.appendLine(`[OpenUI] Priority agent: ${firstDetected} (will be used when prompt is sent)`);
        debugChannel.appendLine(`[OpenUI] All detected: ${detectedNames.join(', ')}`);
      } else {
        this.server.setAgentName(vscode.env.appName);
        this.server.setAgentDescription(workspaceName);
        debugChannel.appendLine(`[OpenUI] No extension agents found — will use ${ide} built-in chat`);
      }
      debugChannel.appendLine('─'.repeat(50));
    }

    let timeoutHandler: NodeJS.Timeout | null = null;
    this.server.interface.messaging.addUserMessageListener((message) => {
      this.server?.interface.state.set(AgentStateType.WORKING);

      this.triggerAgentPrompt(message)
        .then(() => {
          if (timeoutHandler) {
            clearTimeout(timeoutHandler);
          }
          this.server?.interface.state.set(AgentStateType.IDLE);
        })
        .catch((error) => {
          vscode.window.showErrorMessage(`OpenUI: Failed to dispatch prompt — ${error}`);
          this.server?.interface.state.set(AgentStateType.IDLE);
        });
    });
  }

  private scheduleStateTransitions(): NodeJS.Timeout {
    return setTimeout(() => {
      this.server?.interface.state.set(
        AgentStateType.COMPLETED,
        'Prompt was added to the agents chatbox',
      );
      this.scheduleIdleTransition();
    }, AGENT_COMPLETION_DELAY_MS);
  }

  private scheduleIdleTransition(): void {
    setTimeout(() => {
      this.server?.interface.state.set(AgentStateType.IDLE);
    }, AGENT_IDLE_DELAY_MS);
  }

  private async triggerAgentPrompt(userMessage: UserMessage) {
    this.analyticsService.trackEvent(EventName.AGENT_PROMPT_TRIGGERED);

    const TARGET_AGENT_PATTERN = /^\[\[OPENUI_TARGET_AGENT:(.+)\]\]$/;
    let targetAgent: string | undefined;

    const filteredItems = userMessage.contentItems.filter((item) => {
      if (item.type === 'text') {
        const match = item.text.match(TARGET_AGENT_PATTERN);
        if (match) {
          targetAgent = match[1];
          return false;
        }
      }
      return true;
    });

    const cleanedMessage = {
      ...userMessage,
      contentItems: filteredItems,
    };

    const request = {
      prompt: await createPrompt(cleanedMessage),
      files: [],
      images: [],
      targetAgent,
    };

    await dispatchAgentCall(request);
  }
}

/**
 * Generates a detailed context string for a single HTMLElement.
 */
function generateElementContext(element: SelectedElement, isParent = false): string {
  const nodeType = `<tag>${element.nodeType}</tag>`;

  const classAttr = element.attributes['class'] || element.attributes['className'];
  const idAttr = element.attributes['id'];
  const attrs: string[] = [];
  if (classAttr) attrs.push(`<class>${classAttr}</class>`);
  if (idAttr) attrs.push(`<id>${idAttr}</id>`);

  const xpath = `<xpath>${element.xpath}</xpath>`;

  if (isParent) {
    return `
  ${nodeType}
  ${attrs.join('\n  ')}
  ${xpath}
  `;
  }

  const otherAttrs = Object.entries(element.attributes)
    .filter(([key]) => key !== 'class' && key !== 'className' && key !== 'id')
    .map(([key, value]) => `<${key}>${value}</${key}>`)
    .join('\n');
  if (otherAttrs) attrs.push(otherAttrs);

  const textContent = element.textContent?.trim()
    ? `<text_content>${element.textContent.trim()}</text_content>`
    : '';

  const pluginInfo = element.pluginInfo?.length > 0
    ? `<plugin_info>\n  ${element.pluginInfo.map((p) => `<${p.pluginName}>${p.content}</${p.pluginName}>`).join('\n')}\n</plugin_info>`
    : '';

  const parent = element.parent
    ? `<parent>${generateElementContext(element.parent, true)}</parent>`
    : '';

  return `
  ${nodeType}
  ${attrs.join('\n  ')}
  ${xpath}
  ${textContent}
  ${pluginInfo}
  ${parent}
  `;
}

const PROJECT_ENTRY_PATTERNS = [
  '**/src/app/**/page.tsx',
  '**/src/app/**/page.jsx',
  '**/src/pages/**/index.tsx',
  '**/src/pages/**/index.jsx',
  '**/src/app/layout.tsx',
  '**/src/App.tsx',
  '**/src/App.jsx',
];

async function resolveProjectDir(): Promise<string> {
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? '';

  for (const pattern of PROJECT_ENTRY_PATTERNS) {
    const files = await vscode.workspace.findFiles(pattern, '**/node_modules/**', 1);
    if (files.length > 0) {
      let dir = vscode.Uri.joinPath(files[0], '..').fsPath;
      const MAX_WALK_UP = 10;
      for (let i = 0; i < MAX_WALK_UP; i++) {
        try {
          await vscode.workspace.fs.stat(vscode.Uri.file(`${dir}/package.json`));
          return dir;
        } catch {
          const parent = vscode.Uri.joinPath(vscode.Uri.file(dir), '..').fsPath;
          if (parent === dir) break;
          dir = parent;
        }
      }
    }
  }

  return workspaceRoot;
}

export async function createPrompt(msg: UserMessage): Promise<string> {
  const pluginContext = Object.entries(msg.pluginContent)
    .map(
      ([pluginName, snippets]) =>
        [
          pluginName,
          Object.entries(snippets).filter(
            ([_, snippet]) => snippet.type === 'text',
          ),
        ] as [string, [string, UserMessageContentItem][]],
    )
    .filter(([_, snippets]) => snippets.length > 0)
    .map(([pluginName, snippets]) => {
      return `
<plugin_contexts>
<${pluginName}>
${snippets.map((snippet) => `<${snippet[0]}>${(snippet[1] as { type: 'text'; text: string }).text}</${snippet[0]}>`).join('\n')}
</${pluginName}>
</plugin_contexts>
`.trim();
    })
    .join('\n');

  const userMessage = msg.contentItems
    .filter((item) => item.type === 'text')
    .map((item) => (item as { type: 'text'; text: string }).text)
    .join('\n\n');

  const hasElements = msg.metadata.selectedElements.length > 0;

  const elementsBlock = hasElements
    ? `<selected_elements>
${msg.metadata.selectedElements.map((element, index) => `<element_${index}>${generateElementContext(element)}</element_${index}>`).join('\n')}
</selected_elements>`
    : '';

  const instruction = `You are a senior frontend engineer. The user is using the OpenUI toolbar to request a UI change on their running web application.

### Task
${hasElements ? 'The user selected a specific element on the page and described what they want changed.' : 'The user described a UI change they want applied.'}

### How to locate the element
1. Use the \`xpath\` to identify which element the user selected.
2. Use the \`class\` and \`tag\` to find the corresponding component in the source code.
3. Check the \`text_content\` to confirm you found the right element.
${hasElements ? '4. The `parent` context shows the container — use it to narrow down the file.' : ''}

### Output format
- Respond only with the code changes needed.
- Edit the correct source file — do not create new files unless necessary.
- Preserve existing styling patterns (Tailwind, CSS modules, etc.).`;

  const projectDir = await resolveProjectDir();

  return `@openui
<request>
<instruction>
${instruction}
</instruction>
<user_message>${userMessage}</user_message>
<project_dir>${projectDir}</project_dir>
<page>
<url>${msg.metadata.currentUrl}</url>
<title>${msg.metadata.currentTitle}</title>
</page>
${elementsBlock}
${pluginContext}
</request>`.trim();
}

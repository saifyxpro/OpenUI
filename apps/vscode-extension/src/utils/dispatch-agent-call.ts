import { getCurrentIDE } from './get-current-ide';
import { callCursorAgent } from './call-cursor-agent';
import { isCopilotChatInstalled } from './is-copilot-chat-installed';
import { callCopilotAgent } from './call-copilot-agent';
import { callWindsurfAgent } from './call-windsurf-agent';
import { isRoocodeInstalled } from './is-roocode-installed';
import { callRoocodeAgent } from './call-roocode-agent';
import { callClineAgent } from './call-cline-agent';
import { isKilocodeInstalled } from './is-kilocode-installed';
import { callKilocodeAgent } from './call-kilocode-agent';
import { isCodexInstalled } from './is-codex-installed';
import { callCodexAgent } from './call-codex-agent';
import * as vscode from 'vscode';
import { isClineInstalled } from './is-cline-installed';
import { callTraeAgent } from './call-trae-agent';
import { callAntigravityAgent } from './call-antigravity-agent';
import { getDebugChannel } from './debug-channel';

function logDetectedExtensions() {
  const debugChannel = getDebugChannel();
  const extensionChecks = [
    { name: 'Cline', id: 'saoudrizwan.claude-dev', check: isClineInstalled },
    { name: 'Roo Code', id: 'rooveterinaryinc.roo-cline', check: isRoocodeInstalled },
    { name: 'Kilo Code', id: 'kilocode.kilo-code', check: isKilocodeInstalled },
    { name: 'Codex', id: 'openai.chatgpt', check: isCodexInstalled },
    { name: 'Copilot Chat', id: 'github.copilot-chat', check: isCopilotChatInstalled },
  ];

  debugChannel.appendLine('[dispatch] Extension detection results:');
  for (const ext of extensionChecks) {
    const installed = ext.check();
    const extension = vscode.extensions.getExtension(ext.id);
    debugChannel.appendLine(
      `  ${installed ? '✓' : '✗'} ${ext.name} (${ext.id}) — ${installed ? `FOUND (active: ${extension?.isActive})` : 'NOT INSTALLED'}`,
    );
  }

  const allExtensions = vscode.extensions.all.filter(
    (ext) =>
      ext.id.includes('chatgpt') ||
      ext.id.includes('codex') ||
      ext.id.includes('openai') ||
      ext.id.includes('claude') ||
      ext.id.includes('cline'),
  );
  if (allExtensions.length > 0) {
    debugChannel.appendLine('[dispatch] Related extensions found in registry:');
    for (const ext of allExtensions) {
      debugChannel.appendLine(`  - ${ext.id} (active: ${ext.isActive})`);
    }
  }
}

export async function dispatchAgentCall(request: {
  prompt: string;
  files: string[];
  images: string[];
  targetAgent?: string;
}) {
  const ide = getCurrentIDE();
  const debugChannel = getDebugChannel();
  debugChannel.show(true);
  debugChannel.appendLine('─'.repeat(60));
  debugChannel.appendLine(`[dispatch] IDE detected: ${ide}`);
  debugChannel.appendLine(`[dispatch] appName: ${vscode.env.appName}`);
  debugChannel.appendLine(`[dispatch] prompt length: ${request.prompt.length}`);
  debugChannel.appendLine(`[dispatch] targetAgent: ${request.targetAgent ?? 'auto'}`);

  if (ide !== 'ANTIGRAVITY') {
    logDetectedExtensions();
  }

  const agentRequest = {
    prompt: request.prompt,
    files: request.files,
    images: request.images,
  };

  const target = request.targetAgent?.toLowerCase();

  if (ide === 'ANTIGRAVITY') {
    debugChannel.appendLine('[dispatch] → Routing to Antigravity built-in chat');
    return await callAntigravityAgent(agentRequest);
  }

  if (target) {
    const AGENT_ROUTES: Record<string, { check: () => boolean; call: (req: typeof agentRequest) => Promise<void> }> = {
      cline: { check: isClineInstalled, call: callClineAgent },
      codex: { check: isCodexInstalled, call: callCodexAgent },
      'roo code': { check: isRoocodeInstalled, call: callRoocodeAgent },
      'kilo code': { check: isKilocodeInstalled, call: callKilocodeAgent },
      'copilot chat': { check: isCopilotChatInstalled, call: callCopilotAgent },
    };

    const route = Object.entries(AGENT_ROUTES).find(
      ([name]) => name === target,
    );

    if (route) {
      const [name, { check, call }] = route;
      if (check()) {
        debugChannel.appendLine(`[dispatch] → Routing to ${name} (user selected)`);
        return await call(agentRequest);
      }
      debugChannel.appendLine(`[dispatch] → ${name} selected but not installed, falling through`);
    }
  }

  switch (ide) {
    case 'TRAE':
      return await callTraeAgent(agentRequest);
    case 'CURSOR':
      return await callCursorAgent(agentRequest);
    case 'WINDSURF':
      return await callWindsurfAgent(agentRequest);
    case 'VSCODE':
      if (isClineInstalled()) return await callClineAgent(agentRequest);
      if (isRoocodeInstalled()) return await callRoocodeAgent(agentRequest);
      if (isKilocodeInstalled()) return await callKilocodeAgent(agentRequest);
      if (isCodexInstalled()) return await callCodexAgent(agentRequest);
      if (isCopilotChatInstalled()) return await callCopilotAgent(agentRequest);
      return await callCopilotAgent(agentRequest);
    case 'UNKNOWN':
      vscode.window.showErrorMessage(
        'OpenUI: Your IDE is not supported. Supported: Antigravity, Cursor, Windsurf, VS Code (with Copilot/Cline/Roo Code/Codex).',
      );
  }
}

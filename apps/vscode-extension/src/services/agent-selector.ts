import * as vscode from 'vscode';
import { StorageService } from './storage-service';
import { isClineInstalled } from '../utils/is-cline-installed';
import { isRoocodeInstalled } from '../utils/is-roocode-installed';
import { isKilocodeInstalled } from '../utils/is-kilocode-installed';
import { isCodexInstalled } from '../utils/is-codex-installed';
import { isCopilotChatInstalled } from '../utils/is-copilot-chat-installed';
import { getCurrentIDE } from '../utils/get-current-ide';

export type PreferredAgent = 'ide-chat';

interface DetectedAgent {
  name: string;
  type: 'built-in' | 'extension';
  installed: boolean;
}

export class AgentSelectorService {
  private static instance: AgentSelectorService;
  private statusbar: vscode.StatusBarItem | undefined;
  private onAgentSelectionChanged:
    | ((agentName: PreferredAgent) => void)
    | undefined;
  private storageService: StorageService = StorageService.getInstance();

  private readonly PREFERRED_AGENT_STORAGE_KEY = 'openui.preferredAgent';

  private preferredAgent: PreferredAgent | undefined;

  private constructor() {}

  public static getInstance() {
    if (!AgentSelectorService.instance) {
      AgentSelectorService.instance = new AgentSelectorService();
    }
    return AgentSelectorService.instance;
  }

  private getDetectedAgents(): DetectedAgent[] {
    const ide = getCurrentIDE();
    const agents: DetectedAgent[] = [];

    if (ide === 'ANTIGRAVITY') {
      agents.push({ name: 'Antigravity Chat', type: 'built-in', installed: true });
    } else if (ide === 'CURSOR') {
      agents.push({ name: 'Cursor Composer', type: 'built-in', installed: true });
    } else if (ide === 'WINDSURF') {
      agents.push({ name: 'Windsurf Chat', type: 'built-in', installed: true });
    } else if (ide === 'TRAE') {
      agents.push({ name: 'Trae Chat', type: 'built-in', installed: true });
    } else if (ide === 'VSCODE') {
      agents.push({ name: 'VS Code Chat', type: 'built-in', installed: true });
    }

    if (ide !== 'ANTIGRAVITY') {
      agents.push({ name: 'Cline', type: 'extension', installed: isClineInstalled() });
      agents.push({ name: 'Roo Code', type: 'extension', installed: isRoocodeInstalled() });
      agents.push({ name: 'Kilo Code', type: 'extension', installed: isKilocodeInstalled() });
      agents.push({ name: 'Codex', type: 'extension', installed: isCodexInstalled() });
      agents.push({ name: 'GitHub Copilot', type: 'extension', installed: isCopilotChatInstalled() });
    }

    return agents;
  }

  public async initialize() {
    this.statusbar = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100,
    );

    const agents = this.getDetectedAgents();
    const installedExtensions = agents.filter((a) => a.type === 'extension' && a.installed);
    const builtIn = agents.find((a) => a.type === 'built-in');

    const tooltipLines = ['OpenUI — AI Agent Router', ''];

    if (builtIn) {
      tooltipLines.push(`IDE Built-in: ${builtIn.name} ✓`);
    }

    if (installedExtensions.length > 0) {
      tooltipLines.push(`Extensions: ${installedExtensions.map((a) => a.name).join(', ')}`);
    } else {
      tooltipLines.push('Extensions: None detected');
    }

    this.statusbar.tooltip = tooltipLines.join('\n');
    this.statusbar.command = 'openui.setAgent';
    this.updateStatusbarText('OpenUI');
    this.statusbar.show();

    this.preferredAgent = 'ide-chat';
  }

  public updateStatusbarText(text: string) {
    if (!this.statusbar) {
      return;
    }

    this.statusbar.text = `$(openui-icon) ${text}`;
  }

  public async showAgentPicker() {
    const agents = this.getDetectedAgents();
    const agentPicker = vscode.window.createQuickPick();
    const items: vscode.QuickPickItem[] = [];

    const builtIn = agents.find((a) => a.type === 'built-in');
    if (builtIn) {
      items.push({
        label: `$(chat-editor-label-icon) ${builtIn.name}`,
        description: 'IDE built-in chat',
        detail: '✓ Active',
      });
    }

    const installedExtensions = agents.filter((a) => a.type === 'extension' && a.installed);
    if (installedExtensions.length > 0) {
      items.push({
        label: 'Extension Agents',
        kind: vscode.QuickPickItemKind.Separator,
      });
      for (const ext of installedExtensions) {
        items.push({
          label: `$(extensions) ${ext.name}`,
          description: 'Extension agent — detected',
          detail: '✓ Installed',
        });
      }
    }

    const notInstalled = agents.filter((a) => a.type === 'extension' && !a.installed);
    if (notInstalled.length > 0) {
      items.push({
        label: 'Not Installed',
        kind: vscode.QuickPickItemKind.Separator,
      });
      for (const ext of notInstalled) {
        items.push({
          label: `$(circle-outline) ${ext.name}`,
          description: 'Not installed',
        });
      }
    }

    agentPicker.items = items;
    agentPicker.title = 'OpenUI — Detected Agents';
    agentPicker.placeholder = 'View detected IDE and extension agents';
    agentPicker.onDidChangeSelection(() => {
      if (this.onAgentSelectionChanged) {
        void this.setPreferredAgent('ide-chat');
      }
      agentPicker.hide();
    });
    agentPicker.show();
  }

  public onPreferredAgentChanged(
    callback: (agentName: PreferredAgent) => void,
  ) {
    this.onAgentSelectionChanged = callback;
  }

  public getPreferredAgent(): PreferredAgent {
    return 'ide-chat';
  }

  public async setPreferredAgent(agentName: PreferredAgent) {
    this.preferredAgent = agentName;
    await this.storageService.set(this.PREFERRED_AGENT_STORAGE_KEY, agentName);
    this.onAgentSelectionChanged?.(agentName);
  }
}

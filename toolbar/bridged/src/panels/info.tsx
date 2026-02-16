import {
  Panel,
  PanelContent,
  PanelFooter,
  PanelHeader,
} from '@/components/ui/panel';
import {
  OpenUILogoImg,
  AntigravityLogoImg,
  CursorLogoImg,
  TraeLogoImg,
  WindsurfLogoImg,
  ClineLogoImg,
  RooCodeLogoImg,
  GithubCopilotLogoImg,
  KilocodeLogoImg,
  ClaudeCodeLogoImg,
  CodexLogoImg,
} from '@/components/logos';
import { Button } from '@/components/ui/button';
import { useAgents } from '@/hooks/agent/use-agent-provider';
import { usePanels } from '@/hooks/use-panels';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { XIcon } from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  domain: string;
  logo: string;
  appName: string;
  clipboard?: boolean;
}

const agents: Agent[] = [
  {
    id: 'antigravity',
    name: 'Antigravity',
    domain: 'antigravity.dev',
    logo: AntigravityLogoImg,
    appName: 'antigravity',
  },
  {
    id: 'claude',
    name: 'Claude Code',
    domain: 'claude.com',
    logo: ClaudeCodeLogoImg,
    appName: 'claude',
    clipboard: true,
  },
  {
    id: 'cursor',
    name: 'Cursor.com',
    domain: 'cursor.com',
    logo: CursorLogoImg,
    appName: 'cursor',
  },
  {
    id: 'windsurf',
    name: 'Windsurf.com',
    domain: 'windsurf.com',
    logo: WindsurfLogoImg,
    appName: 'windsurf',
  },
  {
    id: 'trae',
    name: 'Trae',
    domain: 'trae.ai',
    logo: TraeLogoImg,
    appName: 'trae',
  },
  {
    id: 'cline',
    name: 'Cline.bot',
    domain: 'cline.bot',
    logo: ClineLogoImg,
    appName: 'code',
  },
  {
    id: 'copilot',
    name: 'GitHub Copilot',
    domain: 'github.com/features/copilot',
    logo: GithubCopilotLogoImg,
    appName: 'code',
  },
  {
    id: 'roocode',
    name: 'Roo-Code',
    domain: 'roocline.dev/',
    logo: RooCodeLogoImg,
    appName: 'code',
  },
  {
    id: 'kilocode',
    name: 'Kilo-Code',
    domain: 'kilocode.ai',
    logo: KilocodeLogoImg,
    appName: 'code',
  },
  {
    id: 'codex',
    name: 'Codex',
    domain: 'openai.com',
    logo: CodexLogoImg,
    appName: 'code',
  },
];

function getAgentExtensionUrl(agent: Agent) {
  switch (agent.id) {
    case 'cline':
    case 'roocode':
    case 'copilot':
    case 'kilocode':
    case 'codex':
      return 'vscode:extension/openui.openui-vscode-extension';
    case 'antigravity':
      return 'antigravity:extension/openui.openui-vscode-extension';
    default:
      return `${agent.id}:extension/openui.openui-vscode-extension`;
  }
}

export function InfoPanel() {
  const { availableAgents, connected } = useAgents();
  const { closeInfo } = usePanels();

  const isInstalled = (appName: string, agentId?: string) => {
    const allAgents = [...availableAgents];
    if (connected) {
      allAgents.push(connected);
    }

    return allAgents.some((serverAgent) => {
      const nameLower = (serverAgent.name || '').toLowerCase();
      const descLower = (serverAgent.description || '').toLowerCase();

      if (agentId) {
        const searchId = agentId.toLowerCase();
        return nameLower.includes(searchId) || descLower.includes(searchId);
      }

      const searchAppName = appName.toLowerCase();
      return (
        nameLower.includes(searchAppName) ||
        descLower.includes(searchAppName)
      );
    });
  };

  return (
    <Panel>
      <PanelHeader
        title="Connect Your Agent"
        actionArea={
          <button
            type="button"
            onClick={closeInfo}
            className="flex size-6 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
          >
            <XIcon className="size-4" />
          </button>
        }
      />
      <PanelContent className="flex flex-col gap-2 px-3">
        <p className="mb-2 text-sm text-zinc-600 leading-relaxed">
          To connect your agent, simply install the openui extension.
        </p>

        <div className="scrollbar-thin scrollbar-thumb-black/15 scrollbar-track-transparent max-h-48 overflow-hidden overflow-y-auto rounded-2xl border border-zinc-200 bg-white">
          {agents.map((agent, index) => (
            <div
              key={agent.id}
              className={`flex items-center justify-between p-2 ${
                index !== agents.length - 1 ? 'border-zinc-100 border-b' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <img
                  src={agent.logo}
                  alt={`${agent.name} logo`}
                  className="size-4 object-contain"
                />
                <span className="font-regular text-sm text-zinc-900">
                  {agent.name}
                </span>
              </div>
              {!isInstalled(agent.appName, agent.id) && !agent.clipboard && (
                <Button
                  onClick={() => {
                    window.open(
                      getAgentExtensionUrl(agent),
                      '_blank',
                      'noopener,noreferrer',
                    );
                  }}
                  variant="secondary"
                  size="sm"
                  className="h-8 bg-zinc-100 px-4 text-xs hover:bg-zinc-200"
                  glassy
                >
                  Install the extension
                </Button>
              )}{' '}
              {isInstalled(agent.appName, agent.id) && !agent.clipboard && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-8 px-4 text-xs"
                  glassy
                  disabled={true}
                >
                  Connected
                </Button>
              )}
              {agent.clipboard && (
                <Tooltip>
                  <TooltipTrigger>
                    <span className="inline-block">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-8 px-4 text-xs"
                        disabled={true}
                        glassy
                      >
                        Via Copy Mode
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      Use the copy mode to copy and paste prompts to{' '}
                      {agent.name}.
                    </p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          ))}
        </div>
      </PanelContent>
      <PanelFooter>
        <div className="flex w-full items-center justify-center gap-2 py-2">
          <img
            src={OpenUILogoImg}
            alt="OpenUI logo"
            className="size-4 object-contain"
          />
          <a
            rel="noreferrer noopener"
            className="text-xs text-zinc-600 underline hover:text-zinc-900"
            href="https://github.com/openui-dev/openui#readme"
            target="_blank"
          >
            Read the docs
          </a>
        </div>
      </PanelFooter>
    </Panel>
  );
}

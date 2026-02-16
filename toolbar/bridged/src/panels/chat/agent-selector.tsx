import { Plus } from 'lucide-react';
import { Select } from '@/components/ui/select';
import {
  AntigravityLogoImg,
  CodexLogoImg,
  CursorLogoImg,
  TraeLogoImg,
  WindsurfLogoImg,
  ClineLogoImg,
  ClaudeCodeLogoImg,
  RooCodeLogoImg,
  GithubCopilotLogoImg,
  KilocodeLogoImg,
} from '@/components/logos';

const getAgentLogo = (name: string, description: string): string | null => {
  const searchText = `${name} ${description}`.toLowerCase();

  if (searchText.includes('antigravity')) return AntigravityLogoImg;
  if (searchText.includes('cursor')) return CursorLogoImg;
  if (searchText.includes('windsurf')) return WindsurfLogoImg;
  if (searchText.includes('cline')) return ClineLogoImg;
  if (searchText.includes('codex') || searchText.includes('chatgpt'))
    return CodexLogoImg;
  if (searchText.includes('roo') && searchText.includes('code'))
    return RooCodeLogoImg;
  if (searchText.includes('trae')) return TraeLogoImg;
  if (searchText.includes('kilocode') || searchText.includes('kilo-code'))
    return KilocodeLogoImg;
  if (searchText.includes('github') || searchText.includes('copilot'))
    return GithubCopilotLogoImg;
  if (searchText.includes('claude')) return ClaudeCodeLogoImg;

  return null;
};

function parseDetectedExtensions(description: string): string[] {
  const match = description.match(/detected:\s*(.+)/i);
  if (!match) return [];
  return match[1].split(',').map((s) => s.trim()).filter(Boolean);
}

interface AgentOption {
  port: number;
  name: string;
  description: string;
}

interface AgentSelectorProps {
  selectedAgent: string | number;
  onAgentChange: (value: string | number) => void;
  availableAgents: AgentOption[];
}

export function AgentSelector({
  selectedAgent,
  onAgentChange,
  availableAgents,
}: AgentSelectorProps) {
  const agentItems = availableAgents.flatMap((agent) => {
    const ideLogo = getAgentLogo(agent.name, '');
    const ideItem = {
      label: agent.name,
      value: `${agent.port}:${agent.name}`,
      icon: ideLogo ? (
        <img
          src={ideLogo}
          alt={`${agent.name} logo`}
          className="size-4 object-contain"
        />
      ) : null,
    };

    const detectedNames = parseDetectedExtensions(agent.description);
    const extensionItems = detectedNames.map((name) => {
      const logo = getAgentLogo(name, '');
      return {
        label: name,
        value: `${agent.port}:${name}`,
        icon: logo ? (
          <img
            src={logo}
            alt={`${name} logo`}
            className="size-4 object-contain"
          />
        ) : null,
      };
    });

    return [ideItem, ...extensionItems];
  });

  return (
    <Select
      value={selectedAgent}
      onChange={onAgentChange}
      items={[
        {
          label: 'Copy Mode',
          value: 'clipboard',
        },
        ...agentItems,
        {
          label: 'Connect other agents...',
          value: 'connect-other-agents',
          icon: <Plus className="size-4" />,
        },
      ]}
      placeholder="Select destination..."
      className="h-8 w-max max-w-56 border-none bg-transparent shadow-none hover:bg-blue-400/10 hover:shadow-none"
    />
  );
}


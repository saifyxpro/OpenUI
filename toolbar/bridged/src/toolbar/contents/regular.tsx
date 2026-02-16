import { ToolbarSection } from '@/toolbar/components/section';
import { ToolbarButton } from '@/toolbar/components/button';
import { MessageCircleIcon, PuzzleIcon, Settings } from 'lucide-react';
import { usePanels } from '@/hooks/use-panels';
import { usePlugins } from '@/hooks/use-plugins';
import { useChatState } from '@/hooks/use-chat-state';
import { useAgents } from '@/hooks/agent/use-agent-provider';
import { cn } from '@/utils';

export function RegularContent() {
  const {
    isChatOpen,
    openChat,
    closeChat,
    openPluginName,
    closePlugin,
    openPlugin,
    isInfoOpen,
    openInfo,
    closeInfo,
  } = usePanels();

  const { startPromptCreation, startContextSelector, domContextElements } =
    useChatState();

  const { connected } = useAgents();

  const plugins = usePlugins();

  const pluginsWithActions = plugins.plugins.filter(
    (plugin) => plugin.onActionClick,
  );

  const selectedElementCount = domContextElements.length;

  return (
    <>
      {pluginsWithActions.length > 0 && (
        <ToolbarSection>
          {pluginsWithActions.map((plugin) => (
            <ToolbarButton
              key={plugin.pluginName}
              onClick={
                openPluginName === plugin.pluginName
                  ? closePlugin
                  : () => openPlugin(plugin.pluginName)
              }
              active={openPluginName === plugin.pluginName}
            >
              {plugin.iconSvg ? (
                <span className="size-4 *:size-full">{plugin.iconSvg}</span>
              ) : (
                <PuzzleIcon className="size-4" />
              )}
            </ToolbarButton>
          ))}
        </ToolbarSection>
      )}
      <ToolbarSection>
        <ToolbarButton
          onClick={
            isChatOpen
              ? closeChat
              : () => {
                  openChat();
                  startPromptCreation();
                  startContextSelector();
                }
          }
          active={isChatOpen}
          className="relative"
        >
          <MessageCircleIcon className="size-4" />
          <span
            className={cn(
              'absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-blue-600 font-bold text-[10px] text-white shadow-sm transition-all duration-300 ease-spring',
              selectedElementCount > 0
                ? 'scale-100 opacity-100'
                : 'scale-0 opacity-0',
            )}
          >
            {selectedElementCount}
          </span>
          <span
            className={cn(
              'absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-white transition-colors duration-300',
              connected ? 'bg-green-500' : 'bg-zinc-300',
            )}
          />
        </ToolbarButton>
        <ToolbarButton
          onClick={isInfoOpen ? closeInfo : openInfo}
          active={isInfoOpen}
        >
          <Settings className="size-4" />
        </ToolbarButton>
      </ToolbarSection>
    </>
  );
}

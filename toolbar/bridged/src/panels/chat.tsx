import {
  Panel,
  PanelContent,
  PanelFooter,
} from '@/components/ui/panel';
import { useKartonProcedure } from '@/hooks/use-karton';
import { useAgentState } from '@/hooks/agent/use-agent-state';
import { useChatState } from '@/hooks/use-chat-state';
import { usePlugins } from '@/hooks/use-plugins';
import { usePanels } from '@/hooks/use-panels';
import { cn } from '@/utils';
import { AgentStateType } from '@openui-xio/agent-interface/toolbar';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ContextElementsChips } from '@/components/context-elements-chips';
import { AgentMessageDisplay } from '@/components/agent-message-display';
import { useAgentMessaging } from '@/hooks/agent/use-agent-messaging';
import { useAgents } from '@/hooks/agent/use-agent-provider';
import { createPrompt, type PluginContextSnippets } from '@/prompts';
import { collectUserMessageMetadata, getSelectedElementInfo } from '@/utils';

import { AgentStateHeader } from './chat/agent-state-header';
import { AgentSelector } from './chat/agent-selector';
import { ChatInputArea } from './chat/chat-input-area';
import { ChatActionButtons } from './chat/chat-action-buttons';

export function ChatPanel() {
  const agentState = useAgentState();
  const chatState = useChatState();
  const chatMessaging = useAgentMessaging();
  const trackCopyToClipboard = useKartonProcedure(
    (p) => p.trackCopyToClipboard,
  );
  const [isComposing, setIsComposing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<string | number>(
    'clipboard',
  );
  const { connected, availableAgents, connectAgent, disconnectAgent } =
    useAgents();
  const { plugins } = usePlugins();
  const { openInfo } = usePanels();

  const enableInputField = true;

  const canSendMessage = useMemo(() => {
    return chatState.chatInput.trim().length > 2;
  }, [chatState.chatInput]);

  const anyMessageInChat = useMemo(() => {
    return chatMessaging.agentMessage?.contentItems?.length > 0;
  }, [chatMessaging.agentMessage?.contentItems]);

  const handleSubmit = useCallback(() => {
    const agentName =
      typeof selectedAgent === 'string' && selectedAgent.includes(':')
        ? selectedAgent.split(':').slice(1).join(':')
        : undefined;
    chatState.sendMessage(agentName);
    chatState.stopPromptCreation();
  }, [chatState, selectedAgent]);

  const buildFullPrompt = useCallback(async () => {
    const metadata = collectUserMessageMetadata(
      chatState.domContextElements.map((item) =>
        getSelectedElementInfo(item.element),
      ),
    );

    const pluginProcessingPromises = plugins.map(async (plugin) => {
      try {
        const baseUserMessage = {
          id: '',
          createdAt: new Date(),
          contentItems: [{ type: 'text' as const, text: chatState.chatInput }],
          metadata,
          role: 'user' as const,
          parts: [{ type: 'text' as const, text: chatState.chatInput }],
          pluginContent: {},
          sentByPlugin: false,
        };

        const handlerResult = await plugin.onPromptSend?.(
          baseUserMessage as any,
        );

        if (
          !handlerResult ||
          !handlerResult.contextSnippets ||
          handlerResult.contextSnippets.length === 0
        ) {
          return null;
        }

        const snippetPromises = handlerResult.contextSnippets.map(
          async (snippet) => {
            try {
              const resolvedContent =
                typeof snippet.content === 'string'
                  ? snippet.content
                  : await snippet.content();
              return {
                promptContextName: snippet.promptContextName,
                content: resolvedContent,
              };
            } catch {
              return null;
            }
          },
        );

        const resolvedSnippets = await Promise.all(snippetPromises);
        const validSnippets = resolvedSnippets.filter(
          (snippet): snippet is NonNullable<typeof snippet> => snippet !== null,
        );

        if (validSnippets.length > 0) {
          const pluginSnippets: PluginContextSnippets = {
            pluginName: plugin.pluginName,
            contextSnippets: validSnippets,
          };
          return pluginSnippets;
        }
        return null;
      } catch {
        return null;
      }
    });

    const allPluginContexts = await Promise.all(pluginProcessingPromises);
    const validPluginContexts = allPluginContexts.filter(
      (context): context is PluginContextSnippets => context !== null,
    );

    return createPrompt(
      chatState.domContextElements.map((item) => item.element),
      chatState.chatInput,
      metadata.currentUrl || '',
      validPluginContexts,
    );
  }, [chatState.chatInput, chatState.domContextElements, plugins]);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const isIntentionallyStoppingRef = useRef<boolean>(false);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCopyToClipboard = useCallback(async () => {
    void trackCopyToClipboard();
    if (chatState.chatInput.trim()) {
      try {
        const fullPrompt = await buildFullPrompt();
        await navigator.clipboard.writeText(fullPrompt);
        chatState.setChatInput('');
        chatState.stopPromptCreation();

        if (copyTimeoutRef.current) {
          clearTimeout(copyTimeoutRef.current);
        }

        setIsCopied(true);
        copyTimeoutRef.current = setTimeout(() => {
          setIsCopied(false);
          copyTimeoutRef.current = null;
        }, 1000);
      } catch (error) {
        console.error('Failed to copy prompt to clipboard:', error);
      }
    }
  }, [chatState, buildFullPrompt]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
        e.preventDefault();
        if (!connected) {
          handleCopyToClipboard();
        } else if (canSendMessage) {
          handleSubmit();
        }
      }
    },
    [handleSubmit, handleCopyToClipboard, isComposing, connected, canSendMessage],
  );

  const handleAgentChange = useCallback(
    (value: string | number) => {
      if (value === 'connect-other-agents') {
        openInfo();
        setSelectedAgent('clipboard');
        return;
      }

      setSelectedAgent(value);

      if (value === 'clipboard') {
        disconnectAgent(true);
        return;
      }
      const portStr = String(value).split(':')[0];
      const port = Number.parseInt(portStr);
      if (port && !Number.isNaN(port)) {
        connectAgent(port);
      }
    },
    [openInfo, disconnectAgent, connectAgent],
  );

  useEffect(() => {
    if (connected?.port) {
      const connectedAgent = availableAgents.find(
        (a) => a.port === connected.port,
      );
      setSelectedAgent(
        `${connected.port}:${connectedAgent?.name ?? 'agent'}`,
      );
    } else {
      setSelectedAgent('clipboard');
    }
  }, [connected?.port, availableAgents]);

  useEffect(() => {
    const blurHandler = () => {
      if (isIntentionallyStoppingRef.current) {
        isIntentionallyStoppingRef.current = false;
        return;
      }
      inputRef.current?.focus();
    };

    if (chatState.isPromptCreationActive && enableInputField) {
      inputRef.current?.focus();
      inputRef.current?.addEventListener('blur', blurHandler);
      isIntentionallyStoppingRef.current = false;
    } else {
      if (inputRef.current === document.activeElement) {
        isIntentionallyStoppingRef.current = true;
      }
      inputRef.current?.blur();
    }

    return () => {
      inputRef.current?.removeEventListener('blur', blurHandler);
    };
  }, [chatState.isPromptCreationActive, enableInputField]);

  return (
    <Panel
      className={cn(
        anyMessageInChat
          ? 'h-[35vh] max-h-[50vh] min-h-[20vh]'
          : '!h-[calc-size(auto,size)] h-auto min-h-0',
      )}
    >
      <AgentStateHeader
        state={agentState.state}
        description={agentState.description}
      />
      <PanelContent
        className={cn(
          'flex basis-[initial] flex-col gap-0 px-1 py-0',
          anyMessageInChat ? '!h-[calc-size(auto,size)] h-auto flex-1' : 'h-0',
          agentState.state === AgentStateType.IDLE
            ? 'rounded-t-[inherit]'
            : 'rounded-t-none',
          'mask-alpha mask-[linear-gradient(to_bottom,transparent_0px,black_48px,black_calc(95%_-_16px),transparent_calc(100%_-_16px))]',
          'overflow-hidden',
        )}
      >
        <AgentMessageDisplay />
      </PanelContent>
      <PanelFooter
        className={cn(
          'mt-0 flex origin-top flex-col items-stretch gap-1 px-2 pt-1 pb-2 duration-150 ease-out',
          !enableInputField && 'pointer-events-none opacity-80 brightness-75',
          chatState.isPromptCreationActive && 'bg-blue-400/10',
          !anyMessageInChat &&
            agentState.state === AgentStateType.IDLE &&
            'rounded-t-[inherit] border-transparent border-t-none pt-3',
        )}
      >
        <ContextElementsChips />
        <div className="flex flex-col gap-2">
          <ChatInputArea
            inputRef={inputRef}
            value={chatState.chatInput}
            onChange={chatState.setChatInput}
            onFocus={() => {
              if (!chatState.isPromptCreationActive) {
                chatState.startPromptCreation();
                chatState.startContextSelector();
              }
            }}
            onKeyDown={handleKeyDown}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            disabled={!enableInputField}
          />
          <div className="flex flex-row items-center justify-end gap-4">
            <AgentSelector
              selectedAgent={selectedAgent}
              onAgentChange={handleAgentChange}
              availableAgents={availableAgents}
            />
            <ChatActionButtons
              isPromptCreationActive={chatState.isPromptCreationActive}
              isContextSelectorActive={chatState.isContextSelectorActive}
              onToggleContextSelector={() => {
                if (chatState.isContextSelectorActive) {
                  chatState.stopContextSelector();
                } else {
                  chatState.startContextSelector();
                }
              }}
              inputRef={inputRef}
              connected={!!connected}
              canSendMessage={canSendMessage}
              chatInputTrimmed={!!chatState.chatInput.trim()}
              isCopied={isCopied}
              onCopy={handleCopyToClipboard}
              onSubmit={handleSubmit}
            />
          </div>
        </div>
      </PanelFooter>
    </Panel>
  );
}

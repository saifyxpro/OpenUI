import { type ReactNode, createContext } from 'react';
import { useContext, useState, useCallback, useEffect } from 'react';
import { useAppState } from './use-app-state.js';
import { usePlugins } from './use-plugins.js';
import {
  generateId,
  getSelectedElementInfo,
  collectUserMessageMetadata,
} from '@/utils';
import { useAgentMessaging } from './agent/use-agent-messaging.js';
import { useAgentState } from './agent/use-agent-state.js';
import type {
  UserMessage,
  UserMessageContentItem,
} from '@openui-dev/agent-interface/toolbar';
import { AgentStateType } from '@openui-dev/agent-interface/toolbar';
import { usePanels } from './use-panels.js';

interface ContextSnippet {
  promptContextName: string;
  content: (() => string | Promise<string>) | string;
}
export type PluginContextSnippets = {
  pluginName: string;
  contextSnippets: ContextSnippet[];
};

interface ChatContext {
  // Chat content operations
  chatInput: string;
  setChatInput: (value: string) => void;
  domContextElements: {
    element: HTMLElement;
    pluginContext: {
      pluginName: string;
      context: any;
    }[];
  }[];
  addChatDomContext: (element: HTMLElement) => void;
  removeChatDomContext: (element: HTMLElement) => void;
  clearAllDomContext: () => void;
  sendMessage: (targetAgent?: string) => void;

  // UI state
  isPromptCreationActive: boolean;
  startPromptCreation: () => void;
  stopPromptCreation: () => void;
  isContextSelectorActive: boolean;
  startContextSelector: () => void;
  stopContextSelector: () => void;
  isSending: boolean;
}

const ChatContext = createContext<ChatContext>({
  chatInput: '',
  setChatInput: () => {},
  domContextElements: [],
  addChatDomContext: () => {},
  removeChatDomContext: () => {},
  clearAllDomContext: () => {},
  sendMessage: () => {},
  isPromptCreationActive: false,
  startPromptCreation: () => {},
  stopPromptCreation: () => {},
  isContextSelectorActive: false,
  startContextSelector: () => {},
  stopContextSelector: () => {},
  isSending: false,
});

interface ChatStateProviderProps {
  children: ReactNode;
}

export const ChatStateProvider = ({ children }: ChatStateProviderProps) => {
  const [chatInput, setChatInput] = useState<string>('');
  const [isPromptCreationMode, setIsPromptCreationMode] =
    useState<boolean>(false);
  const [isContextSelectorMode, setIsContextSelectorMode] =
    useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [domContextElements, setDomContextElements] = useState<
    {
      element: HTMLElement;
      pluginContext: {
        pluginName: string;
        context: any;
      }[];
    }[]
  >([]);

  const { minimized } = useAppState();
  const { plugins } = usePlugins();
  const { sendMessage: sendAgentMessage } = useAgentMessaging();
  const { isChatOpen } = usePanels();
  const agentState = useAgentState();

  const startPromptCreation = useCallback(() => {
    setIsPromptCreationMode(true);
    plugins.forEach((plugin) => {
      plugin.onPromptingStart?.();
    });
  }, [plugins]);

  const stopPromptCreation = useCallback(() => {
    setIsPromptCreationMode(false);
    // Always stop context selector when stopping prompt creation
    setIsContextSelectorMode(false);
    setDomContextElements([]);
    plugins.forEach((plugin) => {
      plugin.onPromptingAbort?.();
    });
  }, [plugins]);

  const startContextSelector = useCallback(() => {
    setIsContextSelectorMode(true);
  }, []);

  const stopContextSelector = useCallback(() => {
    setIsContextSelectorMode(false);
  }, []);

  useEffect(() => {
    if (!isChatOpen) {
      stopPromptCreation();
    }
    // Note: We removed automatic startPromptCreation() when chat opens
    // Prompt creation should only start when user explicitly focuses input
  }, [isChatOpen, stopPromptCreation]);

  useEffect(() => {
    if (minimized) {
      stopPromptCreation();
    }
  }, [minimized]);



  const addChatDomContext = useCallback(
    (element: HTMLElement) => {
      const pluginsWithContextGetters = plugins.filter(
        (plugin) => plugin.onContextElementSelect,
      );

      setDomContextElements((prev) => [
        ...prev,
        {
          element,
          pluginContext: pluginsWithContextGetters.map((plugin) => ({
            pluginName: plugin.pluginName,
            context: plugin.onContextElementSelect?.(element),
          })),
        },
      ]);
    },
    [plugins],
  );

  const removeChatDomContext = useCallback((element: HTMLElement) => {
    setDomContextElements((prev) =>
      prev.filter((item) => item.element !== element),
    );
  }, []);

  const clearAllDomContext = useCallback(() => {
    setDomContextElements([]);
  }, []);

  const sendMessage = useCallback(async (targetAgent?: string) => {
    console.log('[OpenUI:sendMessage] called', { targetAgent, chatInput: chatInput.substring(0, 50), inputLength: chatInput.length });
    if (!chatInput.trim()) {
      console.log('[OpenUI:sendMessage] BLOCKED — chatInput is empty/whitespace');
      return;
    }

    setIsSending(true);
    console.log('[OpenUI:sendMessage] isSending set to true');

    try {
      const contentItems: UserMessageContentItem[] = [
        {
          type: 'text',
          text: chatInput,
        },
      ];

      if (targetAgent) {
        contentItems.push({
          type: 'text',
          text: `[[OPENUI_TARGET_AGENT:${targetAgent}]]`,
        });
      }

      const baseUserMessage: UserMessage = {
        id: generateId(),
        createdAt: new Date(),
        contentItems,
        metadata: collectUserMessageMetadata(
          domContextElements.map((item) =>
            getSelectedElementInfo(item.element),
          ),
        ),
        pluginContent: {},
        sentByPlugin: false,
      };

      const pluginProcessingPromises = plugins.map(async (plugin) => {
        try {
          const handlerResult = await plugin.onPromptSend?.(
            baseUserMessage as any, // TODO: fix
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
              } catch (snippetError) {
                console.error(
                  `Failed to resolve snippet for plugin ${plugin.pluginName}:`,
                  snippetError,
                );
                return null;
              }
            },
          );

          const resolvedSnippets = await Promise.all(snippetPromises);
          const validSnippets = resolvedSnippets.filter(
            (snippet): snippet is NonNullable<typeof snippet> =>
              snippet !== null,
          );

          if (validSnippets.length > 0) {
            const pluginSnippets: PluginContextSnippets = {
              pluginName: plugin.pluginName,
              contextSnippets: validSnippets,
            };
            return pluginSnippets;
          }
          return null;
        } catch (pluginError) {
          console.error(
            `Failed to process plugin ${plugin.pluginName}:`,
            pluginError,
          );
          return null;
        }
      });

      const allPluginContexts = await Promise.all(pluginProcessingPromises);

      const pluginContent: Record<
        string,
        Record<string, UserMessageContentItem>
      > = {};
      allPluginContexts.forEach((context) => {
        if (!context) return;
        pluginContent[context.pluginName] = {};
        context.contextSnippets.forEach((snippet) => {
          pluginContent[context.pluginName][snippet.promptContextName] = {
            type: 'text',
            text: `${snippet.content}`,
          };
        });
      });

      const userMessageInput: UserMessage = {
        ...baseUserMessage,
        pluginContent,
      };

      console.log('[OpenUI:sendMessage] calling sendAgentMessage...', { messageId: userMessageInput.id, contentItemsCount: userMessageInput.contentItems.length });
      sendAgentMessage(userMessageInput);
      console.log('[OpenUI:sendMessage] sendAgentMessage returned — resetting state');

      setChatInput('');
      setDomContextElements([]);
      setIsPromptCreationMode(false);
    } finally {
      setIsSending(false);
      console.log('[OpenUI:sendMessage] isSending set to false');
    }
  }, [chatInput, domContextElements, plugins, sendAgentMessage]);

  const value: ChatContext = {
    chatInput,
    setChatInput,
    domContextElements,
    addChatDomContext,
    removeChatDomContext,
    clearAllDomContext,
    sendMessage,
    isPromptCreationActive: isPromptCreationMode,
    startPromptCreation,
    stopPromptCreation,
    isContextSelectorActive: isContextSelectorMode,
    startContextSelector,
    stopContextSelector,
    isSending,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export function useChatState() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatState must be used within a ChatStateProvider');
  }
  return context;
}

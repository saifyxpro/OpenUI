import type { SelectedElement } from '@openui-dev/agent-interface/toolbar';

export type { SelectedElement };

export interface PluginChatMessagePart {
  type: 'text';
  text: string;
}

export interface PluginChatMessage {
  role: 'plugin';
  parts: PluginChatMessagePart[];
  id: string;
}

export interface ContextSnippet {
  promptContextName: string;
  content: string | (() => string | Promise<string>);
  type?: string;
}

export interface PluginContextResult {
  contextSnippets: ContextSnippet[];
}

export interface ElementAnnotationResult {
  annotation: string | null;
}

export type ContextElementContext = ElementAnnotationResult;

export interface ToolbarContext {
  sendPrompt: (message: PluginChatMessage) => void | Promise<void>;
  mainAppWindow?: Window | null;
}

export interface ToolbarPlugin {
  name: string;
  pluginName?: string;
  displayName?: string;
  description?: string;
  iconSvg?: any;
  onLoad?: (context: ToolbarContext) => void | Promise<void>;
  onActionClick?: () => any;
  onPromptSend?: (prompt: any) => PluginContextResult | null | Promise<PluginContextResult | null>;
  onPromptingStart?: () => void;
  onPromptingAbort?: () => void;
  onContextElementHover?: (element: HTMLElement) => ElementAnnotationResult | null;
  onContextElementSelect?: (element: HTMLElement) => ElementAnnotationResult | null;
  getContextFromSelectedElements?: (elements: SelectedElement[]) => PluginContextResult | null | Promise<PluginContextResult | null>;
  panels?: Array<{
    name: string;
    icon?: string;
    component: () => any;
  }>;
}

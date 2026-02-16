'use client';
import type { ToolbarPlugin } from '@openui-xio/plugin-sdk';
import { ReactLogo } from './logo';
import {
  getSelectedElementAnnotation,
  getSelectedElementsPrompt,
} from './utils';

const ReactPlugin: ToolbarPlugin = {
  name: 'react',
  displayName: 'React',
  description:
    'This plugin adds additional information and metadata for apps using React as a UI framework',
  iconSvg: <ReactLogo />,
  pluginName: 'react',
  onContextElementHover: getSelectedElementAnnotation,
  onContextElementSelect: getSelectedElementAnnotation,
  onPromptSend: (prompt) => {
    const content = getSelectedElementsPrompt(
      prompt.metadata.browserData.selectedElements ??
        prompt.metadata.browserData?.selectedElements,
    );

    if (!content) {
      return { contextSnippets: [] };
    }

    return {
      contextSnippets: [
        {
          promptContextName: 'elements-react-component-info',
          content: content,
        },
      ],
    };
  },
};

export default ReactPlugin;

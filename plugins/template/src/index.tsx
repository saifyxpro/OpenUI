'use client';
import type { ToolbarPlugin } from '@openui-xio/plugin-sdk';
import { ExampleComponent } from './component';

const Plugin: ToolbarPlugin = {
  name: 'example',
  displayName: 'Example',
  description: 'Example Plugin',
  iconSvg: null,
  pluginName: 'example',
  onActionClick: () => <ExampleComponent />,
};

/**
 * WARNING: Make sure that the plugin is exported as default as this is a required format for the plugin builder.
 */
export default Plugin;

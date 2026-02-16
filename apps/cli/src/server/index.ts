import express, { type Request, type Response } from 'express';
import type { WebSocketServer, WebSocket } from 'ws';
import { createKartonServer } from '@openui-xio/karton/server';
import { createServer } from 'node:http';
import { configResolver } from '../config/index.js';
import { proxy } from './proxy.js';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import { log } from '../utils/logger.js';
import {
  loadPlugins,
  generatePluginImportMapEntries,
  type Plugin,
} from './plugin-loader.js';
import { discoverSkills } from './skill-discovery.js';

type KartonContract = {
  state: {
    noop: boolean;
  };
  clientProcedures: {
    noop: () => Promise<void>;
  };
  serverProcedures: {
    noop: () => Promise<void>;
  };
};

const __dirname = dirname(fileURLToPath(import.meta.url));

const getImportMap = async (plugins: Plugin[]) => {
  const config = configResolver.getConfig();
  const manifestPath =
    process.env.NODE_ENV === 'production'
      ? resolve(__dirname, 'toolbar-bridged/.vite/manifest.json')
      : resolve(
          'node_modules/@openui-xio/toolbar-bridged/dist/toolbar-main/.vite/manifest.json',
        );

  const mainAppManifest = JSON.parse(await readFile(manifestPath, 'utf-8'));
  const mainAppEntries: Record<string, string> = {};
  for (const [_, entry] of Object.entries(mainAppManifest) as [
    string,
    { file: string },
  ][]) {
    if (entry.file.endsWith('.js')) {
      mainAppEntries[entry.file] = `/openui-toolbar-app/${entry.file}`;
    }
  }
  const reactDepsDevSuffix =
    process.env.NODE_ENV === 'development' ? '?dev' : '';
  return {
    imports: {
      react: `https://esm.sh/react@19.1.0${reactDepsDevSuffix}`,
      'react-dom': `https://esm.sh/react-dom@19.1.0${reactDepsDevSuffix}`,
      'react-dom/client': `https://esm.sh/react-dom@19.1.0/client${reactDepsDevSuffix}`,
      'react/jsx-runtime': `https://esm.sh/react@19.1.0/jsx-runtime${reactDepsDevSuffix}`,
      ...mainAppEntries,
      '@openui-xio/toolbar/config': '/openui-toolbar-app/config.js',
      '@openui-xio/plugin-sdk': '/openui-toolbar-app/plugin-sdk.js',
      ...generatePluginImportMapEntries(plugins),
    },
  };
};

const createToolbarConfigHandler =
  (plugins: Plugin[]) => async (_req: Request, res: Response) => {
    try {
      const availablePlugins = plugins.filter((p) => p.available !== false);
      const pluginImports: string[] = [];
      const pluginExports: string[] = [];
      const errorHandlers: string[] = [];

      availablePlugins.forEach((plugin, index) => {
        pluginImports.push(`let plugin${index} = null;`);
        errorHandlers.push(`
try {
  const module${index} = await import('plugin-entry-${index}');
  plugin${index} = module${index}.default || module${index};
  console.debug('[openui] Successfully loaded plugin: ${plugin.name}');
} catch (error) {
  console.error('[openui] Failed to load plugin ${plugin.name}:', error.message);
  console.error('[openui] Plugin path: ${JSON.stringify(plugin.path || plugin.url)}');
}`);
        pluginExports.push(`plugin${index}`);
      });

      const unavailablePlugins = plugins.filter((p) => p.available === false);
      const unavailableWarnings = unavailablePlugins
        .map(
          (p) =>
            `console.warn('[openui] Plugin "${p.name}" is not available: ${p.error || 'Unknown error'}');`,
        )
        .join('\n');

      const convertedPluginArray = `[${pluginExports.join(', ')}].filter(p => p !== null)`;

      const config = configResolver.getConfig();
      const convertedConfig: Record<string, any> = {
        plugins: '__PLUGIN_PLACEHOLDER__',
        devAppPort: config.appPort,
      };

      if (config.eddyMode !== undefined) {
        convertedConfig.eddyMode = config.eddyMode;
      }

      let configString = JSON.stringify(convertedConfig);
      configString = configString.replace(
        '"__PLUGIN_PLACEHOLDER__"',
        convertedPluginArray,
      );

      const responseContent = `${pluginImports.join('\n')}

${unavailableWarnings}

${errorHandlers.join('')}

const config = ${configString};

export default config;
`;

      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      res.send(responseContent);
    } catch (_error) {
      res.status(500).send('Error generating config');
    }
  };

const createToolbarHtmlHandler =
  (plugins: Plugin[]) => async (_req: Request, res: Response) => {
    try {
      const importMap = await getImportMap(plugins);

      const html = `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Expires" content="0">
    <title>OpenUI</title>
    <link rel="preconnect" href="https://rsms.me/">
    <link rel="stylesheet" href="https://rsms.me/inter/inter.css">
    <script type="importmap">${JSON.stringify(importMap)}</script>
    <script type="module">import "index.js";</script>
  </head>
  <body></body>
  </html>`;

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.send(html);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error generating HTML');
    }
  };

export const getServer = async () => {
  try {
    const app = express();
    const config = configResolver.getConfig();

    const plugins = await loadPlugins(config);
    const unavailablePlugins = plugins.filter((p) => p.available === false);

    if (unavailablePlugins.length > 0) {
      log.warn('The following plugins are not available:');
      unavailablePlugins.forEach((p) => {
        log.warn(`  - ${p.name}: ${p.error || 'Unknown error'}`);
      });
    }

    let skillCount = 0;
    try {
      const skills = await discoverSkills(config.dir);
      skillCount = skills.length;
    } catch (_error) {
      log.debug('Failed to discover skills at startup');
    }

    app.get('/openui-toolbar-app/api/skills', async (_req: Request, res: Response) => {
      try {
        const skills = await discoverSkills(config.dir);
        res.json({ skills });
      } catch (error) {
        log.debug(`Failed to discover skills: ${error}`);
        res.json({ skills: [] });
      }
    });

    app.use(proxy);

    for (const plugin of plugins) {
      if (plugin.path && plugin.available !== false) {
        const pluginName = plugin.name.replace(/[@/]/g, '-');
        app.use(
          `/openui-toolbar-app/plugins/${pluginName}`,
          express.static(plugin.path),
        );
        log.debug(`Serving local plugin ${plugin.name} from ${plugin.path}`);
      }
    }

    const toolbarPath =
      process.env.NODE_ENV === 'production'
        ? resolve(__dirname, 'toolbar-bridged')
        : resolve('node_modules/@openui-xio/toolbar-bridged/dist/toolbar-main');
    app.use('/openui-toolbar-app', express.static(toolbarPath));
    app.get(
      '/openui-toolbar-app/config.js',
      createToolbarConfigHandler(plugins),
    );

    app.disable('x-powered-by');

    const server = createServer(app);

    const kartonServer = await createKartonServer<KartonContract>({
      initialState: {
        noop: false,
      },
      procedures: {
        noop: async () => {},
      },
    });
    const bridgeModeWss = kartonServer.wss;
    const bridgeModeWsPath = '/openui-toolbar-app/karton';
    log.debug(
      `WebSocket server configured for path: ${bridgeModeWsPath}`,
    );

    app.get(
      /^(?!\/openui-toolbar-app).*$/,
      createToolbarHtmlHandler(plugins),
    );

    server.on('upgrade', (request, socket, head) => {
      const url = request.url || '';
      const { pathname } = new URL(url, 'http://localhost');
      log.debug(`WebSocket upgrade request for: ${url}`);

      if (!pathname.startsWith('/openui-toolbar-app')) {
        log.debug(`Proxying WebSocket request to app port ${config.appPort}`);
        proxy.upgrade?.(request, socket as any, head);
      } else {
        if (bridgeModeWss && pathname === bridgeModeWsPath) {
          log.debug('Handling bridge mode WebSocket upgrade');
          bridgeModeWss.handleUpgrade(
            request,
            socket,
            head,
            (ws: WebSocket) => {
              bridgeModeWss.emit('connection', ws, request);
            },
          );
        } else {
          log.debug(`Unknown WebSocket path: ${pathname}`);
          socket.destroy();
        }
      }
    });

    return { app, server, plugins, skillCount };
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

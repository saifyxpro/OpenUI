import { configResolver } from './config';
import { configFileExists } from './config/config-file';
import { identifierManager } from './utils/identifier';
import { getServer } from './server';
import { log } from './utils/logger';
import {
  silent,
  commandExecuted,
  wrappedCommand,
  hasWrappedCommand,
} from './config/argparse';
import { printBanner } from './utils/banner';
import {
  discoverDependencies,
  getDependencyList,
} from './dependency-parser/index.js';
import open from 'open';
import { commandExecutor } from './utils/command-executor';
import { startupBanner } from './utils/startup-banner.js';

const originalStderr = process.stderr.write;
process.stderr.write = function (chunk: any, encoding?: any, callback?: any) {
  const str = chunk.toString();
  if (str.includes('DEP0060') && str.includes('util._extend')) {
    return true;
  }
  return originalStderr.call(this, chunk, encoding, callback);
};

async function main() {
  try {
    if (!silent) {
      printBanner(false);
    }

    const config = await configResolver.resolveConfig();

    await identifierManager.getMachineId();

    const hasConfigFile = await configFileExists(config.dir);

    if (config.verbose) {
      log.debug('Configuration resolved:');
      log.debug(JSON.stringify(config, null, 2));
    }

    log.info('Resolving configuration...');

    let skillCount = 0;
    try {
      const dependencies = await discoverDependencies(config.dir);
      const dependencyList = getDependencyList(dependencies);

      if (dependencyList.length > 0) {
        if (config.verbose) {
          log.debug(
            `Discovered dependencies: ${dependencyList.slice(0, 10).join(', ')}${
              dependencyList.length > 10
                ? ` and ${dependencyList.length - 10} more...`
                : ''
            }`,
          );
        }
      } else {
        log.debug('No dependencies found in current directory');
      }
    } catch (error) {
      log.warn(
        `Failed to discover dependencies: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }

    log.info('Starting proxy server...');

    const { server, plugins, skillCount: discoveredSkills } = await getServer();
    skillCount = discoveredSkills;

    startupBanner({
      loadedPlugins: plugins,
      appPort: config.port,
      proxyPort: config.appPort,
      skillCount,
    });

    server.listen(config.port);

    server.on('listening', async () => {
      const address = server.address();
      const port =
        typeof address === 'object' && address ? address.port : config.port;
      const serverUrl = `http://localhost:${port}`;

      log.info(`Ready! Open ${serverUrl} in your browser`);

      if (process.env.NODE_ENV !== 'test') {
        try {
          await open(serverUrl);
        } catch (_error) {
          log.debug('Failed to open browser automatically');
        }
      }
    });

    const gracefulShutdown = async () => {
      if ((global as any).isShuttingDown) {
        log.debug('Already shutting down');
        return;
      }
      (global as any).isShuttingDown = true;

      server.closeAllConnections();
      process.exit(0);
    };

    process.on('SIGINT', gracefulShutdown);
    process.on('SIGTERM', gracefulShutdown);

    process.on('uncaughtException', (error) => {
      log.error(`Uncaught exception: ${error.message}`);
      log.debug(error.stack || '');
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      log.error(`Unhandled rejection at: ${promise}, reason: ${reason}`);
      process.exit(1);
    });

    if (hasWrappedCommand && wrappedCommand.length > 0) {
      const result = await commandExecutor.executeCommand(wrappedCommand);
      process.exit(result.exitCode);
    }
  } catch (error) {
    if (error instanceof Error) {
      try {
        log.error(error.message);
      } catch {
        console.error(error.message);
      }
    } else {
      console.error('An unknown error occurred');
    }
    process.exit(1);
  }
}

main();

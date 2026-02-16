import * as args from './argparse';
import type { Config, ConfigFile } from './types';
import {
  loadConfigFile,
  saveConfigFile,
  configFileExists,
  CONFIG_FILE_NAME,
  type ConfigLoadError,
} from './config-file';
import { promptNumber, promptConfirm } from '../utils/user-input';
import { log, configureLogger } from '../utils/logger';

export class ConfigResolver {
  private config: Config | null = null;

  async resolveConfig(): Promise<Config> {
    configureLogger(args.verbose);

    let configFile: ConfigFile | null = null;
    try {
      configFile = await loadConfigFile(args.workspace);
      if (configFile) {
        log.debug(`Loaded config from ${CONFIG_FILE_NAME}`);
      }
    } catch (error) {
      if (error && typeof error === 'object' && 'type' in error) {
        const configError = error as ConfigLoadError;
        log.error(configError.message);
        if (configError.details) {
          log.error(configError.details);
        }
        log.info(
          `\nPlease fix the errors in ${CONFIG_FILE_NAME} and try again.`,
        );
        process.exit(1);
      }
      throw error;
    }

    const port = args.port || configFile?.port || 3100;
    let appPort = args.appPort || configFile?.appPort;
    const autoPlugins = configFile?.autoPlugins ?? true;
    const plugins = configFile?.plugins ?? [];

    if (!appPort && !args.silent) {
      appPort = await promptNumber({
        message: 'What port is your development app running on?',
        default: '3000',
      });
    } else if (!appPort) {
      throw new Error(
        'App port is required. Please provide it via --app-port argument or run without --silent flag.',
      );
    }

    if (port === appPort) {
      throw new Error('OpenUI port and app port cannot be the same');
    }

    if (!args.silent && !(await configFileExists(args.workspace))) {
      const shouldSave = await promptConfirm({
        message: `Would you like to save this configuration to ${CONFIG_FILE_NAME}?`,
        default: true,
      });

      if (shouldSave) {
        const configToSave: ConfigFile = {
          port,
          appPort,
          autoPlugins,
          plugins,
        };

        await saveConfigFile(args.workspace, configToSave);
        log.info(`Configuration saved to ${CONFIG_FILE_NAME}`);
      }
    }

    this.config = {
      port,
      appPort,
      dir: args.workspace,
      silent: args.silent,
      verbose: args.verbose,
      bridgeMode: true,
      autoPlugins,
      plugins,
      eddyMode: configFile?.eddyMode,
    };

    return this.config;
  }

  getConfig(): Config {
    if (!this.config) {
      throw new Error('Config not resolved yet. Call resolveConfig() first.');
    }
    return this.config;
  }
}

export const configResolver = new ConfigResolver();
export default configResolver;

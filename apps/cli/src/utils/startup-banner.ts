import { log } from './logger.js';
import chalk from 'chalk';
import type { Plugin } from '../server/plugin-loader.js';

interface StartupBannerProps {
  loadedPlugins: Plugin[];
  appPort: number;
  proxyPort: number;
  skillCount?: number;
}

export function startupBanner({ loadedPlugins, appPort, proxyPort, skillCount }: StartupBannerProps) {
  const available = loadedPlugins.filter((p) => p.available !== false);
  const pluginLabel = available.length > 0
    ? available.map((p) => p.name).join(', ')
    : 'none';

  const lines = [
    `${chalk.green('✓')} ${chalk.bold('Proxy')}         ${chalk.cyan(`http://localhost:${proxyPort}`)} ${chalk.gray('→')} localhost:${appPort}`,
    `${chalk.green('✓')} ${chalk.bold('Plugins')}       ${pluginLabel} ${chalk.gray(`(${available.length} loaded)`)}`,
  ];

  if (skillCount !== undefined) {
    lines.push(
      `${chalk.green('✓')} ${chalk.bold('Skills')}        ${skillCount} discovered`,
    );
  }

  lines.push(
    `${chalk.blue('ℹ')} ${chalk.bold('IDE')}           Install the OpenUI VS Code extension to forward prompts`,
  );

  console.log('');
  for (const line of lines) {
    log.info(line);
  }
  console.log('');
}

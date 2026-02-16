import chalk from 'chalk';

const gradient = [
  chalk.hex('#4692CF'),
  chalk.hex('#4B88D1'),
  chalk.hex('#537CD5'),
  chalk.hex('#5C70D8'),
  chalk.hex('#6066DA'),
  chalk.hex('#6D28D9'),
];

function colorGradient(text: string): string {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const colorIndex = Math.floor((i / text.length) * gradient.length);
    const color = gradient[colorIndex] ?? gradient[gradient.length - 1]!;
    result += color(text[i]);
  }
  return result;
}

export function printBanner(silent: boolean): void {
  if (silent) {
    return;
  }

  console.log();
  console.log(
    `  ${chalk.bold(colorGradient('OPENUI'))} ${chalk.gray(process.env.CLI_VERSION ? `v${process.env.CLI_VERSION}` : '')}`,
  );
  console.log(chalk.gray('  Select UI elements, describe changes, forward to your IDE'));
  console.log();
}

export function printCompactBanner(silent: boolean): void {
  if (silent) {
    return;
  }

  console.log();
  console.log(`  ${chalk.bold(colorGradient('OPENUI'))}`);
  console.log(chalk.gray('  Select UI elements, describe changes, forward to your IDE'));
  console.log();
}

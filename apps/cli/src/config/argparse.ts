import { Command, InvalidArgumentError } from 'commander';
import fs from 'node:fs';
import path from 'node:path';

function myParseInt(value: string) {
  const parsedValue = Number.parseInt(value, 10);
  if (Number.isNaN(parsedValue)) {
    throw new InvalidArgumentError('Not a number.');
  }
  return parsedValue;
}

function myParsePath(value: string) {
  const parsedValue = path.resolve(value);
  if (!fs.existsSync(parsedValue)) {
    throw new InvalidArgumentError('Path does not exist.');
  }
  return parsedValue;
}

const program = new Command();

let commandExecuted: string | undefined;

program
  .name('openui')
  .description('OpenUI CLI - Development Proxy & IDE Agent Bridge')
  .version(process.env.CLI_VERSION ?? '0.0.1')
  .option<number>(
    '-p, --port [port]',
    'The port on which the OpenUI-wrapped app will run',
    myParseInt,
  )
  .option<number>(
    '-a, --app-port <app-port>',
    'The port of the developed app that OpenUI will wrap with the toolbar',
    myParseInt,
  )
  .option<string>(
    '-w, --workspace <workspace>',
    'The path to the repository of the developed app',
    myParsePath,
    process.cwd(),
  )
  .option('-s, --silent', 'Will not request user input or guide through setup')
  .option('-v, --verbose', 'Output debug information to the CLI');

program.action(() => {
  commandExecuted = 'main';
});

const rawArgs = process.argv.slice(2);

const doubleDashIndex = rawArgs.indexOf('--');
let openuiArgs = rawArgs;
let wrappedCommand: string[] = [];
let hasWrappedCommand = false;

if (doubleDashIndex !== -1) {
  hasWrappedCommand = true;
  openuiArgs = rawArgs.slice(0, doubleDashIndex);
  wrappedCommand = rawArgs.slice(doubleDashIndex + 1);
}

program.parse([...process.argv.slice(0, 2), ...openuiArgs]);

let port: number | undefined;
let appPort: number | undefined;
let workspace: string;
let silent: boolean;
let verbose: boolean;

const options = program.opts();

const {
  port: parsedPort,
  appPort: parsedAppPort,
  workspace: parsedWorkspace,
  silent: parsedSilent,
  verbose: parsedVerbose,
} = options as {
  port?: number;
  appPort?: number;
  workspace: string;
  silent: boolean;
  verbose: boolean;
};

if (parsedAppPort && parsedPort === parsedAppPort) {
  throw new Error('port and app-port cannot be the same');
}

port = parsedPort;
appPort = parsedAppPort;
workspace = parsedWorkspace;
silent = parsedSilent;
verbose = parsedVerbose;

export {
  port,
  appPort,
  workspace,
  silent,
  verbose,
  commandExecuted,
  wrappedCommand,
  hasWrappedCommand,
};

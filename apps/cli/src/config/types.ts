export interface ConfigFile {
  port?: number;
  appPort?: number;
  autoPlugins?: boolean;
  plugins?: Array<string | { name: string; path?: string; url?: string }>;
  eddyMode?: string;
}

export interface Config {
  port: number;
  appPort: number;
  dir: string;
  silent: boolean;
  verbose: boolean;
  bridgeMode: boolean;
  autoPlugins: boolean;
  plugins: Array<string | { name: string; path?: string; url?: string }>;
  eddyMode?: string;
}

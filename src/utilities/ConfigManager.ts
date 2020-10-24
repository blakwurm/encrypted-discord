import { existsSync, mkdirSync, promises } from 'fs';
import { dirname, join } from 'path';
import { createLogger } from './Console';
import { IConfig } from './IConfig';

const { readFile, writeFile } = promises;
const { log, error } = createLogger('Config');

export class ConfigManager {
  isLoaded = false;

  config: IConfig = {};

  constructor(private file: string) {
    mkdirSync(dirname(file), { recursive: true });
  }

  async load() {
    const { file } = this;
    this.isLoaded = false;
    let config: IConfig = {};
    try {
      config = JSON.parse(await readFile(file, 'utf8'));
    } catch (err) {
      if (!existsSync(file)) writeFile(file, '{}', 'utf8').catch((e) => error('Missing permissions on the config file.', e));
      else error('Config file could not be used, returning to default values...');
    }
    this.config = {
      accounts: config.accounts ?? [],
      roundifyAvatars: config.roundifyAvatars ?? true,
      fastLaunch: config.fastLaunch ?? false,
      debug: config.debug ?? false,
      enableAvatars: config.enableAvatars ?? true,
      processMarkDown: config.processMarkDown ?? true,
      theme: config.theme ?? 'dark',
      locale: config.locale ?? 'en-US',
      recentEmojis: config.recentEmojis ?? [],
    };
    if (config.debug === true) log('Loaded config:', config);
    this.isLoaded = true;
  }

  async save() {
    try {
      await writeFile(join(this.file), JSON.stringify(this.config));
    } catch (e) {
      error(e);
    }
  }
}

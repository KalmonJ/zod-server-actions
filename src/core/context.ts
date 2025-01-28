import type { Config } from "./config";
import { logger } from "./logger";

export class Context<T extends object> {
  private context: T;

  constructor(private readonly config: Omit<Config<T>, "setConfig">) {}

  async get<K extends keyof T>(key: K): Promise<T[K]>;
  async get<K extends keyof T>(key?: K): Promise<T>;
  async get<K extends keyof T>(key?: K) {
    const context = await this.getContext();

    if (key) {
      return context[key];
    }

    return context;
  }

  private async getContext() {
    if (!this.config.contextFn) return this.context;

    if (!this.context) {
      const context = await this.config.contextFn();
      this.context = context;

      if (this.config.debug) logger.debug("Getting context: ", context);

      return context;
    }

    return this.context;
  }
}

new Proxy({}, {});

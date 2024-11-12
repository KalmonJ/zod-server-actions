import { Config } from "./";

export class HandlerContext<C> {
  private config: Config<C>;

  constructor(config: Config<C>) {
    this.config = config;
  }

  async getContext() {
    if (!this.config.contextFn) return;
    const context = await this.config.contextFn();
    return context;
  }
}

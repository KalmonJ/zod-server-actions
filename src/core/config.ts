import { RetriesConfig } from ".";
import { Context } from "./context";

export type ContextFn<T> = () => Promise<T>;
export type OnError = (error: any) => Promise<void>;

export class Config<T extends object = {}> {
  readonly retries?: RetriesConfig;
  readonly contextFn?: ContextFn<T>;
  readonly context?: Context<T>;
  readonly onError?: OnError;
  readonly debug?: boolean;

  constructor(
    retries?: RetriesConfig,
    contextFn?: ContextFn<T>,
    context?: Context<T>,
    onError?: OnError,
    debug?: boolean,
  ) {
    this.retries = retries;
    this.context = context;
    this.contextFn = contextFn;
    this.onError = onError;
    this.debug = debug;
  }

  setConfig(config: Omit<Config, "setConfig">) {
    Object.assign(this, config);
  }
}

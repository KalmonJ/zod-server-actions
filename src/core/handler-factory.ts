import { ActionHandler } from "./action-handler";
import { HandlerContext } from "./handler-context";

export type Retries = {
  maximumAttempts: number;
  delay: number;
};

type ContextFn<T> = () => Promise<T>;

export type Config<T = any> = {
  retries?: Retries;
  contextFn?: ContextFn<T>;
  context?: ReturnType<ContextFn<T>>;
};

export class ActionHandlerFactory {
  private static config: Config;

  static defineConfig<T>(config: Config<T>) {
    this.config = config;
    return this.config as Config<T>;
  }

  static createActionHandler<C extends Config>(config: C) {
    const handlerContext = new HandlerContext<C>(config);
    const context = handlerContext.getContext();
    const configWithContext = { ...config, context };
    return new ActionHandler<C>(configWithContext);
  }
}

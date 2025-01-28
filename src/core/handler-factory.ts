import { ActionHandler } from "./action-handler";
import { Config } from "./config";
import { Context } from "./context";
import { ZodValidator } from "./validators";

export type RetriesConfig = {
  maximumAttempts: number;
  delay: number;
};

export class ActionHandlerFactory {
  static createActionHandler<C extends object>(
    config: Omit<Config<C>, "setConfig">,
  ): ActionHandler<C>;
  static createActionHandler<C extends object>(
    config?: Omit<Config<C>, "setConfig">,
  ): ActionHandler<never>;
  static createActionHandler<C extends object>(config?: Omit<Config<C>, "setConfig">) {
    const validator = new ZodValidator();

    if (!config) return new ActionHandler(validator);

    const context = new Context(config);
    const configuration = new Config(
      config.retries,
      config.contextFn,
      context,
      config.onError,
      config.debug,
    );

    return new ActionHandler(validator, configuration);
  }
}

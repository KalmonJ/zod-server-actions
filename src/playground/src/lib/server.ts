import { ActionHandlerFactory } from "../../../core/.";

const config = ActionHandlerFactory.defineConfig({
  async contextFn() {
    return {
      success: true,
    };
  },
});

export const handler = ActionHandlerFactory.createActionHandler(config);

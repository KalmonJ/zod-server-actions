import { ActionHandlerFactory } from "../../../core/.";
import { AWSProvider } from "../../../core/upload/aws/provider";

const config = ActionHandlerFactory.defineConfig({
  async contextFn() {
    const provider = new AWSProvider({
      ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID!,
      REGION: "sa-east-1",
      SECRET_KEY: process.env.AWS_SECRET_ACCESS_KEY!,
    });

    return {
      success: true,
      provider,
    };
  },
});

export const handler = ActionHandlerFactory.createActionHandler(config);

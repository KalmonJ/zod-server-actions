# ActionHandler Library

The `ActionHandler` library provides a typesafe and robust way to manage and execute asynchronous actions with input validation, output validation, and retry logic. This library leverages `zod` for schema validation and includes functionality to create and handle actions in a structured manner.

## Features

- **Input and Output Validation**: Define schemas for input and output using `zod` for type-safe validation.
- **Retry Logic**: Automatically retry actions on failure with configurable attempts and delays.
- **Context Management**: Optionally provide context for actions using a factory function.
- **Flexible Action Handling**: Create handlers for actions with specified input and output types.

## Installation

To use the `ActionHandler` library, first install the required dependencies:

```bash
npm install zod
```

## Usage

### Creating an Action Handler

Use the `createActionHandler` function to initialize a new action handler with configuration options.

```typescript
import { createActionHandler } from "zod-server-actions";
```

### Example

Here's a step-by-step guide to creating an action handler:

1. **Define Schemas**

   Define the input and output schemas using `zod`.

   ```typescript
   import { z } from "zod";

   const InputSchema = z.object({
     name: z.string(),
     age: z.number().min(0),
   });

   const OutputSchema = z.object({
     greeting: z.string(),
   });
   ```

2. **Create Action Handler**

   Use `createActionHandler` to initialize your action handler.

   ```typescript
   const actionHandler = createActionHandler({
     maximumAttempts: 3,
     delay: 1000,
     contextFn: async () => {
       return { user: "contextData" }; // Example context data
     },
   });
   ```

3. **Define the Handler Function**

   Create a handler function that will process the input and return the output.

   ```typescript
   const action = handler
     .input(InputSchema)
     .output(OutputSchema)
     .handler(async () => {
       // create user and return data
     });
   ```

4. **Execute the Action**

   Call the action with the appropriate input.

   ```typescript
   const result = await action({ name: "Alice", age: 30 });
   console.log(result);
   ```

## API

### `createActionHandler(config)`

Creates a new `ActionHandler` instance with the specified configuration.

**Parameters:**

- `config` (object): Configuration for the action handler.
  - `maximumAttempts` (number): Number of retry attempts (optional, default: 0).
  - `delay` (number): Delay between retries in milliseconds (optional, default: 0).
  - `contextFn` (function): Asynchronous function that returns context data (optional).

**Returns:**

- `ActionHandler`: An instance of `ActionHandler`.

### `ActionHandler`

**Methods:**

- `input<S extends ZodTypeAny>(schema: S)`: Defines the input schema for the action handler.
- `output<S extends ZodTypeAny>(schema: S)`: Defines the output schema for the action handler.
- `retry({ maximumAttempts, delay }: RetryProps)`: Configures retry logic with maximum attempts and delay.
- `handler<R>(callback: HandlerFn<T, R, TContext>)`: Registers the handler function to process the action.

### `ActionHandler Properties`

- `input`: Input schema.
- `output`: Output schema.
- `maximumAttempts`: Number of retry attempts.
- `delay`: Delay between retries.
- `contextFn`: Context factory function.

## Examples

### Basic Example

```typescript
import { createActionHandler } from "zod-server-actions";
import { z } from "zod";

const InputSchema = z.object({
  name: z.string(),
  age: z.number().min(0),
});

const OutputSchema = z.object({
  greeting: z.string(),
});

const actionHandler = createActionHandler({
  maximumAttempts: 3,
  delay: 1000,
});

const handler = async (input, context) => {
  return {
    greeting: `Hello, ${input.name}!`,
  };
};

const action = actionHandler
  .input(InputSchema)
  .output(OutputSchema)
  .handler(handler);

(async () => {
  const result = await action({ name: "Bob", age: 25 });
  console.log(result);
})();
```

## Contributing

Feel free to submit issues or pull requests to improve the library. Contributions are welcome!

## Contact

For questions or support, please contact kalmonkk69@gmail.com.

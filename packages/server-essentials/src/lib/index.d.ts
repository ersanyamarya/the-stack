/**
 * The above type defines a Logger interface with methods for logging different levels of messages.
 * @property info - The `Logger` type you've defined includes four properties:
 * @property warn - The `warn` property in the `Logger` type is a function that takes a `message`
 * parameter of type `string` and an optional rest parameter `optionalParams` of type `unknown[]`. This
 * function is used to log warning messages.
 * @property error - The `error` property in the `Logger` type represents a function that can be used
 * to log error messages. It takes a `message` parameter of type `string` which is the error message to
 * be logged, and an optional rest parameter `optionalParams` of type `unknown[]` which
 * @property debug - The `debug` property in the `Logger` type represents a function that can be used
 * to log debug messages. It takes a message of type `string` as the first parameter, and accepts
 * additional optional parameters of type `unknown[]`. This function is typically used for logging
 * detailed information for debugging purposes
 */
type Logger = {
  info: (message: string, ...optionalParams: unknown[]) => void;
  warn: (message: string, ...optionalParams: unknown[]) => void;
  error: (message: string, ...optionalParams: unknown[]) => void;
  debug: (message: string, ...optionalParams: unknown[]) => void;
};

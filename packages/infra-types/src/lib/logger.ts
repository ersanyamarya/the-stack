export type Logger = {
  info: (message: string, ...optionalParams: unknown[]) => void;
  warn: (message: string, ...optionalParams: unknown[]) => void;
  error: (message: string, ...optionalParams: unknown[]) => void;
  debug: (message: string, ...optionalParams: unknown[]) => void;
};

export type Logger = {
  info: (...optionalParams: unknown[]) => void;
  warn: (...optionalParams: unknown[]) => void;
  error: (...optionalParams: unknown[]) => void;
  debug: (...optionalParams: unknown[]) => void;
};

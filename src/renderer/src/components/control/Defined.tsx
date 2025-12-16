import { define } from "../../utils/define";

interface DefinedFProps<T> {
  value: T | undefined | null;
  children: (value: T) => React.ReactNode;
}

export const DefinedF = <T,>({ value, children }: DefinedFProps<T>) =>
  define(value) ? children(value) : null;

interface DefinedProps<T> {
  value: T;
  children: React.ReactNode;
}

export const Defined = <T,>({ value, children }: DefinedProps<T>) =>
  define(value) ? children : null;

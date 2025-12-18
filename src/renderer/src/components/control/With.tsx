import { define } from "../../utils/define";

interface WithProps<T> {
  value: T | undefined | null;
  children: (value: T) => React.ReactNode;
}

export const With = <T,>({ value, children }: WithProps<T>) =>
  define(value) ? children(value) : null;

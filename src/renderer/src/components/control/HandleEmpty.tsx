import type { JSX } from "react";
import { Mapped } from "./Mapped";
import { Else, If, Ternary } from "./Ternary";

interface HandleEmptyProps<T> {
  array: T[];
  empty: JSX.Element;
  children: (value: T) => JSX.Element;
}

export const HandleEmpty = <T extends { id: string | number }>({
  array,
  empty,
  children,
}: HandleEmptyProps<T>) => (
  <Ternary condition={array.length === 0}>
    <If>{empty}</If>
    <Mapped Tag={Else} value={array}>
      {(elm) => children(elm)}
    </Mapped>
  </Ternary>
);

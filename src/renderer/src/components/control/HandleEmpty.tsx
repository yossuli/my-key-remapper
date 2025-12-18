import type { JSX } from "react";
import { Mapped } from "./Mapped";
import { Conditional, Else, Then } from "./Ternary";

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
  <Conditional condition={array.length === 0}>
    <Then>{empty}</Then>
    <Mapped as={Else} value={array}>
      {(elm) => children(elm)}
    </Mapped>
  </Conditional>
);

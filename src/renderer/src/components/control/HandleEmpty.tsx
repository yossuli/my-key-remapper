import type { JSX } from "react";
import { Mapped } from "./Mapped";
import { Conditional, Else, Then } from "./Ternary";

interface HandleEmptyProps<T> {
  array: T[];
  empty?: JSX.Element;
  children: (value: T, index: number, array: T[]) => JSX.Element;
}

export const HandleEmpty = <T extends { id: string | number }>({
  array,
  empty,
  children,
}: HandleEmptyProps<T>) => (
  <Conditional condition={array.length === 0}>
    <Then>{empty}</Then>
    <Else>
      <Mapped value={array}>{(elm, i) => children(elm, i, array)}</Mapped>
    </Else>
  </Conditional>
);

import type { JSX } from "react";
import { Mapped } from "@/components/control/Mapped";
import { Else, Ternary, Then } from "@/components/control/Ternary";

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
  <Ternary condition={array.length === 0}>
    <Then>{empty}</Then>
    <Else>
      <Mapped value={array}>{(elm, i) => children(elm, i, array)}</Mapped>
    </Else>
  </Ternary>
);

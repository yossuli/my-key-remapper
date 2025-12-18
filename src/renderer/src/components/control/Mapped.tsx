import type { JSX } from "react";
import React from "react";
import type { _BaseProps } from ".";

interface MappedProps<
  T extends { id: string | number },
  U extends JSX.ElementType = typeof React.Fragment,
> extends _BaseProps<U> {
  value: T[];
  children: (item: T, index: number, array: T[]) => React.ReactNode;
}

export const Mapped = <
  T extends { id: string | number },
  U extends JSX.ElementType = typeof React.Fragment,
>({
  value,
  children,
  as,
  ...props
}: MappedProps<T, U>) => {
  const Tag = as ?? React.Fragment;
  return (
    <Tag {...props}>
      {value.map((item, index) => children(item, index, value))}
    </Tag>
  );
};

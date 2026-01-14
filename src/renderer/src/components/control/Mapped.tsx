import type { JSX } from "react";
import React from "react";
import type { _BaseProps } from ".";

type MappedProps<
  T extends { id: string | number },
  U extends JSX.ElementType = typeof React.Fragment,
> = {
  value: readonly T[];
  children: (item: T, index: number, array: readonly T[]) => React.ReactNode;
} & _BaseProps<U>;

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
      {value.map((item, index) => (
        <React.Fragment key={item.id}>
          {children(item, index, value)}
        </React.Fragment>
      ))}
    </Tag>
  );
};

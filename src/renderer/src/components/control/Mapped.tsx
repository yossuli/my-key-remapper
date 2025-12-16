import type { JSX } from "react";
import React from "react";

interface MappedProps<T extends { id: string | number }> {
  value: T[];
  children: (item: T, index: number, array: T[]) => React.ReactNode;
  Tag?: JSX.ElementType;
  [
    key: string
  ]: React.HTMLAttributes<HTMLDivElement>[keyof React.HTMLAttributes<HTMLDivElement>];
}

export const Mapped = <T extends { id: string | number }>({
  value,
  children,
  Tag = React.Fragment,
  ...props
}: MappedProps<T>) => (
  <Tag {...props}>
    {value.map((item, index) => children(item, index, value))}
  </Tag>
);

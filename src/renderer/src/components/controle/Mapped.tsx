import React from "react";

interface MappedProps<T extends { id: string | number }> {
  array: T[];
  children: (item: T, index: number, array: T[]) => React.ReactNode;
}

export const Mapped = <T extends { id: string | number }>({
  array,
  children,
}: MappedProps<T>) =>
  array.map((item, index) => (
    <React.Fragment key={item.id}>
      {children(item, index, array)}
    </React.Fragment>
  ));

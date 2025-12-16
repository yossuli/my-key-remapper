interface MappedProps<T> {
  array: T[];
  children: (item: T, index: number, array: T[]) => React.ReactNode;
}

export const Mapped = <T,>({ array, children }: MappedProps<T>) =>
  array.map((item, index) => <>{children(item, index, array)}</>);

import type React from "react";
import type { JSX } from "react";

export type _BaseProps<T extends JSX.ElementType = typeof React.Fragment> = {
  as?: T;
} & {
  [k in keyof React.HTMLAttributes<T>]: React.HTMLAttributes<T>[keyof React.HTMLAttributes<T>];
};

export interface BaseProps<T extends JSX.ElementType = typeof React.Fragment>
  extends _BaseProps<T> {
  as?: T;
  children: React.ReactNode;
}

export const findWithComponentType = <
  T extends JSX.Element,
  // biome-ignore lint/suspicious/noExplicitAny: コンポーネント型の汎用性のため
  U extends React.FC<any>,
>(
  children: T[],
  component: U
) => children.find((C) => C.type === component);

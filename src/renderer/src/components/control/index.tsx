import type { JSX } from "react";

export interface BaseProps {
  children: React.ReactNode;
}

export const findWithComponentType = <
  T extends JSX.Element,
  U extends React.FC<BaseProps>,
>(
  children: T[],
  component: U
) => children.find((C) => C.type === component);

// export const Ternary:React.FC<TernaryProps> = ({condition,children}) => condition ?

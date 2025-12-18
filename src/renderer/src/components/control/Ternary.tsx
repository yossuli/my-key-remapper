import type { JSX } from "react";
import React from "react";
import { type BaseProps, findWithComponentType } from ".";

interface ConditionalProps {
  condition: boolean;
  children: [JSX.Element, JSX.Element];
}

export const Then = <T extends JSX.ElementType = typeof React.Fragment>({
  children,
  as,
  ...props
}: BaseProps<T>) => {
  const Tag = as ?? React.Fragment;
  return <Tag {...props}>{children}</Tag>;
};

export const Else = <T extends JSX.ElementType = typeof React.Fragment>({
  children,
  as,
  ...props
}: BaseProps<T>) => {
  const Tag = as ?? React.Fragment;
  return <Tag {...props}>{children}</Tag>;
};

export const Conditional = ({ condition, children }: ConditionalProps) =>
  findWithComponentType(children, condition ? Then : Else);

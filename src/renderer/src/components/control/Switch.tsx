import type React from "react";
import type { JSX } from "react";
import { define } from "../../utils/define";
import type { BaseProps } from ".";
import { findWithComponentType } from "./index";

interface CaseProps {
  when: boolean;
  children: React.ReactNode;
}

interface DefineCaseProps<T> {
  when: T | undefined | null;
  children: (when: T) => React.ReactNode;
}

interface DefaultProps<T extends JSX.ElementType = typeof React.Fragment>
  extends BaseProps<T> {}

export const Case = ({ children }: CaseProps) => <>{children}</>;

export const DefineCase = <T,>({
  children,
  when,
}: DefineCaseProps<T>): JSX.Element | false =>
  define(when) && <>{children(when)}</>;

export const Default = <T extends JSX.ElementType = typeof React.Fragment>({
  children,
}: DefaultProps<T>) => <>{children}</>;

export const Switch = ({ children }: { children: JSX.Element[] }) => {
  const match = children.find(
    (child) =>
      (child.type === Case || child.type === DefineCase) &&
      Boolean(child.props.when)
  );

  const defaultCase = findWithComponentType(children, Default);

  return <>{match || defaultCase}</>;
};

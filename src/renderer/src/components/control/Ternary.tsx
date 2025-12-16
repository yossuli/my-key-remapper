import type React from "react";
import type { JSX } from "react";
import { type BaseProps, findWithComponentType } from ".";

interface TernaryProps {
  condition: boolean;
  children: [JSX.Element, JSX.Element];
}

export const If: React.FC<BaseProps> = ({ children }) => <>{children}</>;

export const Else: React.FC<BaseProps> = ({ children }) => <>{children}</>;

export const Ternary: React.FC<TernaryProps> = ({ condition, children }) =>
  findWithComponentType(children, condition ? If : Else);

import type React from "react";
import { cn } from "../../utils/cn";
import type { BaseProps } from "../control";

type FlexProps<T extends React.ElementType = "div"> = {
  children: React.ReactNode;
} & BaseProps<T>;

export const Column = <T extends React.ElementType = "div">({
  as,
  children,
  ...props
}: FlexProps<T>) => {
  const Tag = as || "div";
  return (
    <Tag
      className={cn("flex flex-col items-center", props.className)}
      {...props}
    >
      {children}
    </Tag>
  );
};

export const Row = <T extends React.ElementType = "div">({
  as,
  children,
  className,
  ...props
}: FlexProps<T>) => {
  const Tag = as || "div";
  return (
    <Tag
      className={cn("flex flex-row items-center", className)}
      {...props}
    >
      {children}
    </Tag>
  );
};

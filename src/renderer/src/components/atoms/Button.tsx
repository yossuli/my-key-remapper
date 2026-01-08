import type { ReactNode } from "react";
import {
  Button as ShadcnButton,
  type ButtonProps as ShadcnButtonProps,
} from "@/components/ui/button";

interface ButtonProps extends ShadcnButtonProps {
  children: ReactNode;
}

export function Button({ children, ...props }: ButtonProps) {
  return <ShadcnButton {...props}>{children}</ShadcnButton>;
}

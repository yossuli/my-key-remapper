import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "primary" | "accent" | "muted";
  className?: string;
}

export function Badge({
  children,
  variant = "default",
  className,
}: BadgeProps) {
  const variantStyles = {
    default: "bg-background border-border text-foreground",
    primary: "bg-primary/10 text-primary border-primary/20",
    accent: "bg-accent/50 text-accent-foreground border-accent",
    muted: "bg-muted text-muted-foreground border-muted",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded border px-2 py-0.5 font-medium text-xs",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

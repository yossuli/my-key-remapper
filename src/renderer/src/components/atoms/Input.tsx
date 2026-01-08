import type { InputHTMLAttributes, LabelHTMLAttributes } from "react";
import { Input as ShadcnInput } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AddPrefix } from "../../types";
import { cn } from "../../utils/cn";
import { Show } from "../control/Show";

interface InputProps
  extends AddPrefix<InputHTMLAttributes<HTMLInputElement>, "input-">,
    AddPrefix<LabelHTMLAttributes<HTMLLabelElement>, "label-"> {
  label?: string;
  error?: string;
  id: string;
}

export function Input({
  label,
  error,
  "input-className": inputClassName,
  "label-className": labelClassName,
  id,
  ...props
}: InputProps) {
  const labelProps = Object.fromEntries(
    Object.entries(props)
      .filter(([key]) => key.startsWith("label-"))
      .map(([key, value]) => [key.replace("label-", ""), value])
  );
  const inputProps = Object.fromEntries(
    Object.entries(props)
      .filter(([key]) => key.startsWith("input-"))
      .map(([key, value]) => [key.replace("input-", ""), value])
  );
  return (
    <div className="space-y-2">
      <Show condition={Boolean(label)}>
        <Label
          className={cn(
            "font-medium text-muted-foreground text-xs",
            labelClassName
          )}
          htmlFor={id}
          {...labelProps}
        >
          {label}
        </Label>
      </Show>
      <ShadcnInput
        className={cn(
          Boolean(error) && "border-destructive focus-visible:ring-destructive",
          inputClassName
        )}
        id={id}
        {...inputProps}
      />
      <Show condition={Boolean(error)}>
        <p className="text-destructive text-xs">{error}</p>
      </Show>
    </div>
  );
}

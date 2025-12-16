import type { ReactNode, SelectHTMLAttributes } from "react";
import type { AddPrefix } from "../../types";
import { cn } from "../../utils/cn";
import { Mapped } from "../control/Mapped";

interface SelectOption {
  value: string;
  label: string;
  id: string | number;
}

interface SelectProps
  extends AddPrefix<SelectHTMLAttributes<HTMLSelectElement>, "select-">,
    AddPrefix<SelectHTMLAttributes<HTMLLabelElement>, "label-"> {
  label: ReactNode;
  options: SelectOption[];
  id: string;
}

export function Select({
  label,
  options,
  "select-className": selectClassName,
  "label-className": labelClassName,
  id,
  ...props
}: SelectProps) {
  const labelProps = Object.fromEntries(
    Object.entries(props)
      .filter(([key]) => key.startsWith("label-"))
      .map(([key, value]) => [key.replace("label-", ""), value])
  );
  const selectProps = Object.fromEntries(
    Object.entries(props)
      .filter(([key]) => key.startsWith("select-"))
      .map(([key, value]) => [key.replace("select-", ""), value])
  );
  return (
    <div className="space-y-2">
      <label
        className={cn(
          "font-medium text-muted-foreground text-xs",
          labelClassName
        )}
        htmlFor={id}
        {...labelProps}
      >
        {label}
      </label>
      <Mapped
        className={cn(
          "w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary",
          selectClassName
        )}
        Tag="select"
        {...selectProps}
        value={options}
      >
        {(opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        )}
      </Mapped>
    </div>
  );
}

import type { ReactNode, SelectHTMLAttributes } from "react";
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Select as ShadcnSelect,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { AddPrefix } from "../../types";
import { cn } from "../../utils/cn";
import { Mapped } from "../control/Mapped";

interface SelectOption {
  value: string;
  label: string;
  id: string | number;
}

interface SelectProps<T extends string>
  extends AddPrefix<SelectHTMLAttributes<HTMLSelectElement>, "select-">,
    AddPrefix<SelectHTMLAttributes<HTMLLabelElement>, "label-"> {
  label: ReactNode;
  id: string;
  options: SelectOption[];
  onValueChange: (value: T) => void;
  className?: string;
}

export function Select<T extends string>({
  label,
  options,
  "select-className": selectClassName,
  onValueChange,
  "select-value": value,
  "label-className": labelClassName,
  className,
  id,
  ...props
}: SelectProps<T>) {
  const labelProps = Object.fromEntries(
    Object.entries(props)
      .filter(([key]) => key.startsWith("label-"))
      .map(([key, value]) => [key.replace("label-", ""), value])
  );

  return (
    <>
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
      <ShadcnSelect onValueChange={onValueChange} value={`${value}`}>
        <SelectTrigger className={cn("w-full", selectClassName)} id={id}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <Mapped as={SelectContent} value={options}>
            {(opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            )}
          </Mapped>
        </SelectContent>
      </ShadcnSelect>
    </>
  );
}

import { Button } from "../atoms/Button";
import { cn } from "../../utils/cn";

interface ToggleButtonProps<T extends string | number> {
  value: T;
  options: readonly T[];
  labels: Record<T, string>;
  onChange: (value: T) => void;
  className?: string;
}

/**
 * トグルボタンコンポーネント
 * クリックするたびに次のオプションに切り替わる
 */
export function ToggleButton<T extends string | number>({
  value,
  options,
  labels,
  onChange,
  className,
}: ToggleButtonProps<T>) {
  const handleClick = (): void => {
    const currentIndex = options.indexOf(value);
    const nextIndex = (currentIndex + 1) % options.length;
    onChange(options[nextIndex]);
  };

  const currentIndex = options.indexOf(value);

  return (
    <div className="flex flex-col gap-1">
      <Button
        label={labels[value]}
        onClick={handleClick}
        variant="outline"
        className={className}
      />
      <div className="h-0.5 flex gap-0.5 px-0.5">
        {options.map((_, index) => (
          <div
            key={index}
            className={cn(
              "flex-1 transition-colors duration-200",
              index === currentIndex ? "bg-primary" : "bg-border"
            )}
          />
        ))}
      </div>
    </div>
  );
}

import { motion } from "framer-motion";
import { KEY_SIZE_REM } from "../constants";
import type { KeyDefinition } from "../types";
import { cn } from "../utils/cn";
import { getKeyLabel } from "../utils/getKeyLabel";

interface SimpleKeyboardProps {
  mappings: Map<number, number>;
  keyboardLayout: KeyDefinition[][];
  onKeyClick: (vk: number) => void;
}

export function SimpleKeyboard({
  mappings,
  keyboardLayout,
  onKeyClick,
}: SimpleKeyboardProps) {
  return (
    <div className="flex select-none flex-col gap-2 rounded-xl border bg-card p-4 shadow-sm">
      {keyboardLayout.map((row, rowIndex) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: 順序が不変であるため
        <div className="flex justify-center gap-1.5" key={rowIndex}>
          {row.map((key) => {
            const baseVk = Array.isArray(key.vk) ? key.vk[0] : key.vk;
            const remapped = mappings.get(baseVk);
            return (
              <motion.button
                className={cn(
                  "flex items-center justify-center rounded-md border font-medium text-sm shadow-sm transition-colors",
                  remapped
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground hover:bg-muted"
                )}
                key={key.id}
                onClick={() => onKeyClick(baseVk)}
                style={{
                  width: `${(key.width || 1) * KEY_SIZE_REM}rem`,
                  height: "3rem",
                }}
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {remapped ? getKeyLabel(remapped, keyboardLayout) : key.label}
              </motion.button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

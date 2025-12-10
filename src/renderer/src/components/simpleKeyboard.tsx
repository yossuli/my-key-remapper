import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { KEY_SIZE_REM } from "../constants";
import type { KeyDefinition } from "../types";
import { cn } from "../utils/cn";

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
            const isRemapped = mappings.has(key.vk);
            return (
              <motion.button
                className={cn(
                  "flex items-center justify-center rounded-md border font-medium text-sm shadow-sm transition-colors",
                  isRemapped
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground hover:bg-muted"
                )}
                key={key.vk}
                onClick={() => onKeyClick(key.vk)}
                style={{
                  width: `${(key.width || 1) * KEY_SIZE_REM}rem`,
                  height: "3rem",
                }}
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {key.label}
              </motion.button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

interface KeyEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetVk: number | null;
  mappings: Map<number, number>;
  keyboardLayout: KeyDefinition[][];
  onSave: (from: number, to: number) => void;
  onRemove: (from: number) => void;
}

export function KeyEditorModal({
  isOpen,
  onClose,
  targetVk,
  mappings,
  keyboardLayout,
  onSave,
  onRemove,
}: KeyEditorModalProps) {
  const [targetKey, setTargetKey] = useState("");

  const currentMapping = targetVk ? mappings.get(targetVk) : undefined;

  useEffect(() => {
    if (currentMapping) {
      setTargetKey(currentMapping.toString());
    } else {
      setTargetKey("");
    }
  }, [currentMapping]); // Depend only on currentMapping change

  const handleSave = () => {
    if (targetVk && targetKey) {
      onSave(targetVk, Number.parseInt(targetKey, 10));
      onClose();
    }
  };

  const handleRemove = () => {
    if (targetVk) {
      onRemove(targetVk);
      onClose();
    }
  };

  const getKeyLabel = (vk: number) => {
    for (const row of keyboardLayout) {
      const found = row.find((k) => k.vk === vk);
      if (found) {
        return found.label;
      }
    }
    return `VK ${vk}`;
  };

  if (!isOpen || targetVk === null) {
    return null;
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
        <motion.div
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm overflow-hidden rounded-xl border bg-background shadow-lg"
          exit={{ opacity: 0, scale: 0.95 }}
          initial={{ opacity: 0, scale: 0.95 }}
        >
          <div className="flex items-center justify-between border-b p-4">
            <h3 className="font-semibold text-lg">Edit Key Mapping</h3>
            <button
              className="rounded-full p-1 transition-colors hover:bg-muted"
              onClick={onClose}
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-4 p-6">
            <div className="flex items-center justify-center gap-4 font-bold text-2xl">
              <div className="rounded border bg-muted px-4 py-2">
                {getKeyLabel(targetVk)}
              </div>
              <span className="text-muted-foreground">→</span>
              <div className="rounded border bg-primary/10 px-4 py-2 text-primary">
                {targetKey || "?"}
              </div>
            </div>

            <div className="space-y-2">
              {/* biome-ignore lint/a11y/noLabelWithoutControl: Simple label */}
              <label className="font-medium text-muted-foreground text-xs">
                Map to VK Code
              </label>
              <input
                autoFocus
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                onChange={(e) => setTargetKey(e.target.value)}
                placeholder="Enter VK Code (e.g., 65)"
                type="number"
                // Auto-focus on open
                value={targetKey}
              />
              <p className="text-muted-foreground text-xs">
                Enter the Virtual Key code you want this key to trigger.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              {currentMapping !== undefined && (
                <button
                  className="rounded-md px-4 py-2 font-medium text-destructive text-sm transition-colors hover:bg-destructive/10"
                  onClick={handleRemove}
                  type="button"
                >
                  Reset to Default
                </button>
              )}
              <button
                className="rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground text-sm transition-colors hover:bg-primary/90 disabled:opacity-50"
                disabled={!targetKey}
                onClick={handleSave}
                type="button"
              >
                Save
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

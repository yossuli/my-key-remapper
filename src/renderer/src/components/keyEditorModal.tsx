import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { KeyDefinition } from "../types";

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
  const inputFocusedRef = useRef(false);

  const currentMapping = targetVk ? mappings.get(targetVk) : undefined;

  useEffect(() => {
    if (currentMapping) {
      setTargetKey(currentMapping.toString());
    } else {
      setTargetKey("");
    }
  }, [currentMapping]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyEvent = (_event: unknown, data: { vkCode: number }) => {
      // 入力がフォーカスされている間は外部のキーイベントで上書きしない
      if (inputFocusedRef.current) {
        return;
      }
      setTargetKey(data.vkCode.toString());
    };

    const ipc = window.electron?.ipcRenderer;
    ipc?.on("key-event", handleKeyEvent);
    return () => {
      ipc?.off("key-event", handleKeyEvent);
    };
  }, [isOpen]);

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

  const close = () => {
    onClose();
    setTargetKey("");
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
              onClick={close}
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
                {targetKey ? getKeyLabel(+targetKey) : "?"}
              </div>
            </div>

            <div className="space-y-2">
              <label
                className="font-medium text-muted-foreground text-xs"
                htmlFor="vkCode"
              >
                Map to VK Code
              </label>
              <input
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                name="vkCode"
                onBlur={() => {
                  inputFocusedRef.current = false;
                }}
                onChange={(e) => setTargetKey(e.target.value)}
                onFocus={() => {
                  inputFocusedRef.current = true;
                }}
                placeholder="Enter VK Code (e.g., 65)"
                type="number"
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

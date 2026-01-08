import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
import { Button } from "../atoms/Button";
import { Show } from "../control/Show";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * 確認ダイアログを表示するモーダルコンポーネント
 * ネイティブの confirm() の代わりに使用する
 */
export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = "はい",
  cancelLabel = "いいえ",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <AnimatePresence>
      <Show condition={isOpen}>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-md">
          <motion.div
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-sm overflow-hidden rounded-2xl border border-border/50 bg-background shadow-2xl"
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <div className="px-6 pt-6 pb-4">
              <h3 className="font-bold text-foreground text-xl tracking-tight">
                {title}
              </h3>
            </div>
            <div className="px-6 pt-2 pb-6">
              <div className="text-muted-foreground leading-relaxed">
                {message}
              </div>
            </div>
            <div className="flex justify-end gap-3 bg-muted/20 px-6 py-4">
              <Button
                className="font-medium hover:bg-muted"
                onClick={onCancel}
                size="md"
                variant="ghost"
              >
                {cancelLabel}
              </Button>
              <Button
                className="font-semibold shadow-sm"
                onClick={onConfirm}
                size="md"
                variant="destructive"
              >
                {confirmLabel}
              </Button>
            </div>
          </motion.div>
        </div>
      </Show>
    </AnimatePresence>
  );
}

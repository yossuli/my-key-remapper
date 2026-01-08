import { AnimatePresence, motion } from "framer-motion";
import { Button } from "../atoms/Button";
import { Show } from "../control/Show";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <motion.div
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm overflow-hidden rounded-xl border bg-background shadow-lg"
            exit={{ opacity: 0, scale: 0.95 }}
            initial={{ opacity: 0, scale: 0.95 }}
          >
            <div className="border-b p-4">
              <h3 className="font-semibold text-lg">{title}</h3>
            </div>

            <div className="p-4">
              <p className="text-muted-foreground">{message}</p>
            </div>

            <div className="flex justify-end gap-2 border-t p-4">
              <Button onClick={onCancel} size="sm" variant="ghost">
                {cancelLabel}
              </Button>
              <Button onClick={onConfirm} size="sm" variant="destructive">
                {confirmLabel}
              </Button>
            </div>
          </motion.div>
        </div>
      </Show>
    </AnimatePresence>
  );
}

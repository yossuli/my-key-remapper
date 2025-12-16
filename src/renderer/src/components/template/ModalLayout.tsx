import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "../atoms/Button";
import { Icon } from "../atoms/Icon";

interface ModalLayoutProps {
  editingKey: number | null;
  title: string;
  children: (editingKey: number) => ReactNode;
  onClose: () => void;
}

export function ModalLayout({
  editingKey,
  title,
  children,
  onClose,
}: ModalLayoutProps) {
  if (editingKey === null) {
    return null;
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
        <motion.div
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md overflow-hidden rounded-xl border bg-background shadow-lg"
          exit={{ opacity: 0, scale: 0.95 }}
          initial={{ opacity: 0, scale: 0.95 }}
        >
          <div className="flex items-center justify-between border-b p-4">
            <h3 className="font-semibold text-lg">{title}</h3>
            <Button
              className="rounded-full p-1"
              onClick={onClose}
              size="sm"
              variant="ghost"
            >
              <Icon icon={X} size="sm" />
            </Button>
          </div>
          {children(editingKey)}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

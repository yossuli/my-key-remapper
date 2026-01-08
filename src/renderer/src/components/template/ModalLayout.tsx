import type { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const isOpen = editingKey !== null;

  return (
    <Dialog onOpenChange={(open) => !open && onClose()} open={isOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {editingKey !== null && children(editingKey)}
      </DialogContent>
    </Dialog>
  );
}

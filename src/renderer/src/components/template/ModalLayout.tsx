import type { ReactNode } from "react";
import { Dialog } from "../atoms/Dialog";

interface ModalLayoutProps {
  editingKey: number | null;
  title?: string;
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

    <Dialog open={isOpen} onClose={onClose} title={title}>
      {editingKey !== null && children(editingKey)}
    </Dialog>
  );
}

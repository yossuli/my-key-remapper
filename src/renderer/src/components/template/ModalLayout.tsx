import type { ReactNode } from "react";
import { Dialog } from "../atoms/Dialog";

interface ModalLayoutProps<T> {
  value: T | null;
  title?: string;
  children: (value: T) => ReactNode;
  onClose: () => void;
}

export function ModalLayout<T>({
  value,
  title,
  children,
  onClose,
}: ModalLayoutProps<T>) {
  const isOpen = !!value;

  return (
    <Dialog open={isOpen} onClose={onClose} title={title}>
      {value !== null && children(value)}
    </Dialog>
  );
}

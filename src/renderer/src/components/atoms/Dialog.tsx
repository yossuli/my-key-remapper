import type { ReactNode } from "react";
import {
  Dialog as ShadcnDialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Show } from "../control/Show";

interface ModalLayoutProps {
  title?: string;
  children: ReactNode;
  open: boolean;
  onClose: () => void;
}

export function Dialog({
  title,
  children,
  open,
  onClose,
}: ModalLayoutProps) {
  return (
    <ShadcnDialog onOpenChange={(open) => !open && onClose()} open={open}>
      <DialogContent>
        <Show condition={Boolean(title)}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
        </Show>
        {children}
      </DialogContent>
    </ShadcnDialog>
  );
}

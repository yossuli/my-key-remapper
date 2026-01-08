import type { GlobalSettings } from "../../../../shared/types/remapConfig";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { GlobalSettingsForm } from "../organisms/GlobalSettingsForm";
import { JSX } from "react";

interface GlobalSettingsModalProps {
  /** モーダル開閉状態 */
  isOpen: boolean;
  /** モーダルを閉じるコールバック */
  onClose: () => void;
  /** グローバル設定オブジェクト */
  globalSettings: GlobalSettings;
  /** 設定保存コールバック */
  onSave: (settings: Partial<GlobalSettings>) => void;
}

/**
 * グローバルタイミング設定を表示するモーダルコンポーネント
 */
export function GlobalSettingsModal({
  isOpen,
  onClose,
  globalSettings,
  onSave,
}: GlobalSettingsModalProps): JSX.Element {
  const handleSave = (settings: Partial<GlobalSettings>) => {
    onSave(settings);
    onClose();
  };

  return (
    <AlertDialog onOpenChange={(open) => !open && onClose()} open={isOpen}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>グローバル設定</AlertDialogTitle>
        </AlertDialogHeader>
        <GlobalSettingsForm
          globalSettings={globalSettings}
          onSave={handleSave}
        />
      </AlertDialogContent>
    </AlertDialog>
  );
}

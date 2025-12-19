// クイック設定モード用カスタムフック
// キーボードグリッドでキークリック→キー押下で即座にリマップを適用

import { useCallback, useEffect, useState } from "react";
import type { Action, TriggerType } from "../../../shared/types/remapConfig";

interface UseQuickRemapOptions {
  enabled: boolean;
  selectedTrigger: TriggerType;
  onSaveMapping: (from: number, trigger: TriggerType, action: Action) => void;
}

interface UseQuickRemapReturn {
  editingKey: number | null;
  startEditing: (vk: number) => void;
  cancelEditing: () => void;
}

/**
 * クイック設定モード用フック
 * - editingKey: 現在選択中のFromキー（入力待ち状態）
 * - startEditing: キークリック時にFromキーを設定
 * - キー押下検知でリマップを即座に適用
 */
export function useQuickRemap({
  enabled,
  selectedTrigger,
  onSaveMapping,
}: UseQuickRemapOptions): UseQuickRemapReturn {
  const [editingKey, setEditingKey] = useState<number | null>(null);

  // キークリックでFromキーを設定
  const startEditing = useCallback(
    (vk: number) => {
      if (!enabled) {
        return;
      }
      setEditingKey(vk);
    },
    [enabled]
  );

  // 編集をキャンセル
  const cancelEditing = useCallback(() => {
    setEditingKey(null);
  }, []);

  // キー押下検知（入力待ち状態のとき）
  useEffect(() => {
    if (!enabled || editingKey === null) {
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // keyCodeからvkCodeへの変換（基本的にはkeyCodeで対応可能）
      const toVk = e.keyCode;

      // リマップを適用
      const action: Action = {
        type: "remap",
        keys: [toVk],
      };
      onSaveMapping(editingKey, selectedTrigger, action);

      // 編集完了、次のキーの入力待ちへ
      setEditingKey(null);
    };

    // Escapeで編集キャンセル
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        cancelEditing();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleEscape);
    };
  }, [enabled, editingKey, selectedTrigger, onSaveMapping, cancelEditing]);

  // モードが無効になったら編集中状態をクリア
  useEffect(() => {
    if (!enabled) {
      setEditingKey(null);
    }
  }, [enabled]);

  return {
    editingKey,
    startEditing,
    cancelEditing,
  };
}

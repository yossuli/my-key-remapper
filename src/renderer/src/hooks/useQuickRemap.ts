// クイック設定モード用カスタムフック
// キーボードグリッドでキークリック→キー押下で即座にリマップを適用

import { useCallback, useEffect, useState } from "react";
import type { Action, TriggerType } from "../../../shared/types/remapConfig";
import { useKeyEditorActions } from "./useKeyEditorAction";

interface UseQuickRemapOptions {
  enabled: boolean;
  hasExistingBinding: boolean;
  selectedLayerId: string;
  selectedTrigger: TriggerType;
  targetKeys: number[];

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
  hasExistingBinding,
  selectedLayerId,
  targetKeys,
}: UseQuickRemapOptions): UseQuickRemapReturn {
  const [editingKey, setEditingKey] = useState<number | null>(null);

  const { canSave, holds, addHoldKeys, removeHoldKeys, handleSave } =
    useKeyEditorActions({
      state: {
        actionType: "remap",
        selectedLayerId,
        targetKeys,
        hasExistingBinding,
      },
      targetVk: editingKey,
      selectedTrigger,
      onSave: (trigger: TriggerType, action: Action) => {
        if (editingKey !== null) {
          onSaveMapping(editingKey, trigger, action);
        }
      },
    });

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

      // キーを追加
      addHoldKeys(e);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // 今離すキーが holds の最後の 1 つなら保存を実行
      if (holds.length === 1 && holds[0] === e.keyCode) {
        if (canSave) {
          handleSave();
        }
        setEditingKey(null);
      }

      // キーを除去
      removeHoldKeys(e);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [
    enabled,
    editingKey,
    addHoldKeys,
    removeHoldKeys,
    holds,
    canSave,
    handleSave
  ]);

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

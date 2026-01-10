// クイック設定モード用カスタムフック
// キーボードグリッドでキークリック→キー押下で即座にリマップを適用

import { useCallback, useEffect, useState } from "react";
import { useKeyEditorActions } from "@/hooks/useKeyEditorAction";
import { useKeyEventInput } from "@/hooks/useKeyEventInput";
import type { KeyboardLayout } from "@/types";
import { getNextKeyVk } from "@/utils/getNextKeyVk";
import type { Action, TriggerType } from "../../../shared/types/remapConfig";

export interface UseQuickRemapOptions {
  enabled: boolean;
  hasExistingBinding: boolean;
  selectedLayerId: string;
  selectedTrigger: TriggerType;
  targetKeys: number[];
  keyboardLayout: KeyboardLayout;

  onSaveMapping: (from: number, trigger: TriggerType, action: Action) => void;
}

export interface UseQuickRemapReturn {
  editingKey: number | null;
  startEditing: (vk: number) => void;
  cancelEditing: () => void;
}

/**
 * クイック設定モード用フック
 * - editingKey: 現在選択中のFromキー（入力待ち状態）
 * - startEditing: キークリック時にFromキーを設定
 * - キー押下検知でリマップを即座に適用
 * - 保存後は自動的に右隣のキーに移動
 */
export function useQuickRemap({
  enabled,
  selectedTrigger,
  onSaveMapping,
  hasExistingBinding,
  selectedLayerId,
  targetKeys,
  keyboardLayout,
}: UseQuickRemapOptions): UseQuickRemapReturn {
  const [editingKey, setEditingKey] =
    useState<UseQuickRemapReturn["editingKey"]>(null);

  const { canSave, holds, addHoldKey, removeHoldKey, handleSave } =
    useKeyEditorActions({
      state: {
        actionType: "remap",
        selectedLayerId,
        targetKeys,
        hasExistingBinding,
      },
      layerId: selectedLayerId,
      targetVk: editingKey,
      selectedTrigger,
      onSave: (trigger: TriggerType, action: Action) => {
        if (editingKey !== null) {
          console.log("save", editingKey, trigger, action);
          onSaveMapping(editingKey, trigger, action);
        }
      },
    });

  // キークリックでFromキーを設定
  const startEditing = useCallback<UseQuickRemapReturn["startEditing"]>(
    (vk) => {
      if (!enabled) {
        return;
      }
      setEditingKey(vk);
    },
    [enabled]
  );

  // 編集をキャンセル
  const cancelEditing = useCallback<
    UseQuickRemapReturn["cancelEditing"]
  >(() => {
    setEditingKey(null);
  }, []);

  // IPC経由でキー入力を受け取る
  const handleKeyDown = useCallback(
    (vkCode: number) => {
      addHoldKey(vkCode);
    },
    [addHoldKey]
  );

  const handleKeyUp = useCallback(
    (vkCode: number) => {
      // 今離すキーが holds の最後の 1 つなら保存を実行
      if (holds.length === 1 && holds[0] === vkCode) {
        if (canSave) {
          handleSave();
        }
        // 次のキーに移動（行末なら null で編集終了）
        if (editingKey !== null) {
          const nextVk = getNextKeyVk(keyboardLayout, editingKey);
          setEditingKey(nextVk);
        }
      }

      // キーを除去
      removeHoldKey(vkCode);
    },
    [holds, canSave, handleSave, keyboardLayout, editingKey, removeHoldKey]
  );

  useKeyEventInput({
    enabled: enabled && editingKey !== null,
    onKeyDown: handleKeyDown,
    onKeyUp: handleKeyUp,
  });

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

// リマップキー選択ロジックのフック

import { useCallback, useEffect, useRef } from "react";
import { useKeyHoldAction } from "./useKeyHoldAction";

interface UseRemapKeySelectionProps {
  enabled: boolean;
  targetKeys: number[];
  onAddKey: (keyCode: number) => void;
  /** Enter長押し時に実行するアクション */
  onEnterHold: () => void;
}

interface UseRemapKeySelectionReturn {
  setInputFocused: (focused: boolean) => void;
}

/**
 * リマップ対象のキーを選択するフック
 */
export function useRemapKeySelection({
  enabled,
  targetKeys,
  onAddKey,
  onEnterHold,
}: UseRemapKeySelectionProps): UseRemapKeySelectionReturn {
  const inputFocusedRef = useRef(false);

  // 入力フォーカス状態を設定
  const setInputFocused = useCallback((focused: boolean) => {
    inputFocusedRef.current = focused;
  }, []);

  // Enter キーの長押し/単押しハンドラー
  const { handleHoldKeyDown, handleHoldKeyUp } = useKeyHoldAction({
    targetKey: "Enter",
  });

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const onKeyDown = (e: KeyboardEvent) => {
      // 入力中は無視
      if (inputFocusedRef.current) {
        return;
      }

      // Escape, Tab は無視
      if (e.key === "Escape" || e.key === "Tab") {
        return;
      }

      // Enter キーは長押しハンドラーで処理、それ以外はキーを追加
      handleHoldKeyDown(e, {
        onOtherKey() {
          if (e.keyCode && !targetKeys.includes(e.keyCode)) {
            onAddKey(e.keyCode);
          }
        },
        onHold: onEnterHold,
      });
    };

    const onKeyUp = (e: KeyboardEvent) => {
      handleHoldKeyUp(e, {
        onTap() {
          const enterKeyCode = 13;
          if (!(targetKeys.includes(enterKeyCode) || inputFocusedRef.current)) {
            onAddKey(enterKeyCode);
          }
        },
      });
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
    };
  }, [
    enabled,
    targetKeys,
    onAddKey,
    onEnterHold,
    handleHoldKeyDown,
    handleHoldKeyUp,
  ]);

  return {
    setInputFocused,
  };
}

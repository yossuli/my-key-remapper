// リマップキー選択ロジックのフック

import { useCallback, useEffect, useRef } from "react";

interface UseRemapKeySelectionProps {
  enabled: boolean;
  targetKeys: number[];
  onAddKey: (keyCode: number) => void;
  /** Enter単押し時にEnterキーを追加するか */
  handleEnterTap?: boolean;
}

/**
 * リマップ対象のキーを選択するフック
 */
export function useRemapKeySelection({
  enabled,
  targetKeys,
  onAddKey,
  handleEnterTap = true,
}: UseRemapKeySelectionProps) {
  const inputFocusedRef = useRef(false);
  const enterTapPendingRef = useRef(false);

  // 入力フォーカス状態を設定
  const setInputFocused = useCallback((focused: boolean) => {
    inputFocusedRef.current = focused;
  }, []);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // 入力中は無視
      if (inputFocusedRef.current) {
        return;
      }

      // Escapeは無視
      if (e.key === "Escape" || e.key === "Tab") {
        return;
      }

      // Enterキーは別途処理
      if (e.key === "Enter") {
        enterTapPendingRef.current = true;
        return;
      }

      // キーを追加
      if (e.keyCode && !targetKeys.includes(e.keyCode)) {
        onAddKey(e.keyCode);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      // Enter単押しの場合、Enterキーを追加
      if (e.key === "Enter" && handleEnterTap && enterTapPendingRef.current) {
        enterTapPendingRef.current = false;
        const enterKeyCode = 13;
        if (!(targetKeys.includes(enterKeyCode) || inputFocusedRef.current)) {
          onAddKey(enterKeyCode);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, [enabled, targetKeys, onAddKey, handleEnterTap]);

  return {
    setInputFocused,
  };
}

// Enter長押しで保存するロジックのフック

import { useCallback, useEffect, useRef } from "react";

interface UseEnterToSaveProps {
  onSave: () => void;
  holdMs?: number;
}

/**
 * Enter長押しで保存するフック
 */
export function useEnterToSave({ onSave, holdMs = 1000 }: UseEnterToSaveProps) {
  const enterTimerRef = useRef<number | null>(null);
  const enterActiveRef = useRef(false);
  const saveReadyRef = useRef(false);
  const onSaveRef = useRef(onSave);

  // onSaveの参照を更新
  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  const clearEnterTimer = useCallback(() => {
    if (enterTimerRef.current !== null) {
      window.clearTimeout(enterTimerRef.current);
      enterTimerRef.current = null;
    }
    enterActiveRef.current = false;
    saveReadyRef.current = false;
  }, []);

  // 保存準備完了かどうかを確認
  const isSaveReady = useCallback(() => saveReadyRef.current, []);

  // Enter長押し開始を知らせるフラグ
  const isEnterActive = useCallback(() => enterActiveRef.current, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Enter") {
        return;
      }

      // 保存準備完了状態なら保存
      if (saveReadyRef.current) {
        onSaveRef.current();
        clearEnterTimer();
        return;
      }

      // タイマー開始
      if (!enterActiveRef.current) {
        enterActiveRef.current = true;
        enterTimerRef.current = window.setTimeout(() => {
          saveReadyRef.current = true;
          enterActiveRef.current = false;
        }, holdMs);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key !== "Enter") {
        return;
      }

      // 保存準備完了状態なら保存
      if (saveReadyRef.current) {
        onSaveRef.current();
        clearEnterTimer();
        return;
      }

      // まだ長押しが完了していない場合はタイマーをクリア
      if (enterActiveRef.current) {
        clearEnterTimer();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, [clearEnterTimer, holdMs]);

  return {
    clearEnterTimer,
    isSaveReady,
    isEnterActive,
  };
}

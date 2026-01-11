import { useCallback, useEffect, useState } from "react";
import { MAX_VK_CODE, MIN_VK_CODE } from "../../../shared/constants/vk";

export interface UseKeyCaptureReturn {
  keys: number[];
  holds: number[];
  addKey: (vk: number) => void;
  removeKey: (vk: number) => void;
  onKeyDown: (vkCode: number) => void;
  onKeyUp: (vkCode: number) => void;
  reset: () => void;
  setKeys: (keys: number[]) => void;
}

export interface UseKeyCaptureProps {
  initialKeys?: number[];
  onKeysChange?: (keys: number[]) => void;
}

/**
 * キーキャプチャのロジック（同時押し・連続押し管理）を抽出したフック
 */
export function useKeyCapture({
  initialKeys = [],
  onKeysChange,
}: UseKeyCaptureProps = {}): UseKeyCaptureReturn {
  console.log("[DEBUG] useKeyCapture - render", { initialKeys });
  const [keys, setKeys] = useState<number[]>(initialKeys);
  const [holds, setHolds] = useState<number[]>([]);

  // 1. 下方向の同期：外部（親）からの初期値変更を内部状態に反映
  // ※ この同期によって onKeysChange が呼ばれないようにすることで、無限ループを回避する
  useEffect(() => {
    if (JSON.stringify(keys) !== JSON.stringify(initialKeys)) {
      console.log("[DEBUG] useKeyCapture - sync from props", { initialKeys });
      setKeys(initialKeys);
    }
  }, [initialKeys, keys]);

  // 2. 上方向の通知：ユーザーアクションによる変更を親に通知するヘルパー
  const notifyChange = useCallback(
    (newKeys: number[]) => {
      console.log("[DEBUG] useKeyCapture - notify change", { newKeys });
      onKeysChange?.(newKeys);
    },
    [onKeysChange]
  );

  const addKey = useCallback(
    (vk: number) => {
      if (vk >= MIN_VK_CODE && vk <= MAX_VK_CODE) {
        setKeys((prev) => {
          if (prev.includes(vk)) {
            return prev;
          }
          const next = [...prev, vk];
          notifyChange(next);
          return next;
        });
      }
    },
    [notifyChange]
  );

  const removeKey = useCallback(
    (vk: number) => {
      setKeys((prev) => {
        const next = prev.filter((k) => k !== vk);
        if (next.length !== prev.length) {
          notifyChange(next);
        }
        return next;
      });
      setHolds((prev) => prev.filter((k) => k !== vk));
    },
    [notifyChange]
  );

  const onKeyDown = useCallback(
    (vkCode: number) => {
      setHolds((prev) => [...prev.filter((k) => k !== vkCode), vkCode]);

      setKeys((prev) => {
        // 何も押されていない状態からの最初のキーなら置き換え、そうでなければ追加
        let next: number[];
        if (holds.length === 0) {
          next = [vkCode];
        } else {
          next = prev.includes(vkCode) ? prev : [...prev, vkCode];
        }

        if (JSON.stringify(next) !== JSON.stringify(prev)) {
          notifyChange(next);
        }
        return next;
      });
    },
    [holds.length, notifyChange]
  );

  const onKeyUp = useCallback((vkCode: number) => {
    setHolds((prev) => prev.filter((k) => k !== vkCode));
  }, []);

  const reset = useCallback(() => {
    setKeys([]);
    setHolds([]);
    notifyChange([]);
  }, [notifyChange]);

  // 手動での状態更新用（通知付き）
  const setKeysWithNotify = useCallback(
    (newKeys: number[]) => {
      setKeys(newKeys);
      notifyChange(newKeys);
    },
    [notifyChange]
  );

  return {
    keys,
    holds,
    addKey,
    removeKey,
    onKeyDown,
    onKeyUp,
    reset,
    setKeys: setKeysWithNotify,
  };
}

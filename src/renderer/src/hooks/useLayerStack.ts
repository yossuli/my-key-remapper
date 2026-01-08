// レイヤースタック状態を取得・監視するフック

import { useCallback, useEffect, useState } from "react";
import { useIpc, useIpcEvent } from "./useIpc";

interface UseLayerStackReturn {
  /** 現在のレイヤースタック */
  stack: string[];
  /** 手動でスタックを再取得 */
  refresh: () => void;
  /** 指定レイヤーに強制リセット */
  resetToLayer: (layerId: string) => void;
}

/**
 * レイヤースタック状態を取得・監視するフック
 * - イベント購読でリアルタイム更新
 * - 手動リフレッシュも可能
 */
export function useLayerStack(): UseLayerStackReturn {
  const { send, invoke } = useIpc();
  const [stack, setStack] = useState<string[]>(["base"]);

  // 初期取得
  const refresh = useCallback(() => {
    invoke<string[]>("get-layer-stack").then((result) => {
      if (result) {
        setStack(result);
      }
    });
  }, [invoke]);

  // 初期化時に取得
  useEffect(() => {
    refresh();
  }, [refresh]);

  // レイヤー変更イベントを購読
  useIpcEvent("layer-stack-changed", (...args: unknown[]) => {
    const data = args[1] as { stack: string[] };
    if (data?.stack) {
      setStack(data.stack);
    }
  });

  // 指定レイヤーに強制リセット
  const resetToLayer = useCallback(
    (layerId: string) => {
      send("reset-layer", { layerId });
      // 楽観的更新
      setStack([layerId]);
    },
    [send]
  );

  return {
    stack,
    refresh,
    resetToLayer,
  };
}

import type { MacroDef } from "@shared/types/remapConfig";
import { useCallback, useEffect, useState } from "react";
import { useIpc } from "@/hooks/useIpc";

export function useMacros() {
  const [macros, setMacros] = useState<MacroDef[]>([]);
  const { invoke, send } = useIpc();

  // マクロ一覧を再取得
  const fetchMacros = useCallback(async () => {
    const result = await invoke<MacroDef[]>("get-macros");
    if (result) {
      setMacros(result);
    }
  }, [invoke]);

  // マクロを保存（サーバー送信 + ローカル更新）
  const saveMacros = useCallback(
    (newMacros: MacroDef[]) => {
      send("save-macros", { macros: newMacros });
      setMacros(newMacros);
    },
    [send]
  );

  // 初期読み込み
  useEffect(() => {
    fetchMacros();
  }, [fetchMacros]);

  return {
    macros,
    fetchMacros,
    saveMacros,
  };
}

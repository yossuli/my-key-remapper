// リマップ有効/無効の制御フック

import { useCallback, useState } from "react";
import { useIpc } from "./useIpc";

interface UseRemapControlReturn {
  isActive: boolean;
  setIsActive: (active: boolean) => void;
  toggleActive: () => void;
  setRemapEnabled: (enabled: boolean) => void;
  enableRemap: () => void;
  disableRemap: () => void;
}

/**
 * リマップ機能の有効/無効を制御するカスタムフック
 */
export function useRemapControl(): UseRemapControlReturn {
  const { send } = useIpc();
  const [isActive, setIsActiveState] = useState(true);

  const setRemapEnabled = useCallback(
    (enabled: boolean) => {
      send("set-remap-enabled", { enabled });
    },
    [send]
  );

  const disableRemap = useCallback(() => {
    setRemapEnabled(false);
  }, [setRemapEnabled]);

  const enableRemap = useCallback(() => {
    setRemapEnabled(true);
  }, [setRemapEnabled]);

  const toggleActive = useCallback(() => {
    setIsActiveState((prev) => !prev);
  }, []);

  const setIsActive = useCallback((active: boolean) => {
    setIsActiveState(active);
  }, []);

  return {
    isActive,
    setIsActive,
    toggleActive,
    setRemapEnabled,
    enableRemap,
    disableRemap,
  };
}

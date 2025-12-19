// レイヤー状態とマッピング管理のカスタムフック

import { useCallback, useEffect, useState } from "react";
import type {
  Action,
  Layer,
  TriggerType,
} from "../../../shared/types/remapConfig";
import { remove, upsert } from "../utils/handleMapping";
import { useIpc } from "./useIpc";

interface UseLayerStateReturn {
  layers: Layer[];
  layerId: string;
  setLayerId: React.Dispatch<React.SetStateAction<string>>;
  currentBindings: Layer["bindings"];
  addLayer: (newLayerId: string) => void;
  removeLayer: (targetLayerId: string) => void;
  saveMapping: (from: number, trigger: TriggerType, action: Action) => void;
  removeMapping: (from: number, trigger: TriggerType) => void;
}

/**
 * レイヤーとマッピングを管理するカスタムフック
 */
export function useLayerState(): UseLayerStateReturn {
  const { send, invoke } = useIpc();
  const [layers, setLayers] = useState<Layer[]>([]);
  const [layerId, setLayerId] = useState<string>("base");

  // 初期化：マッピングを取得
  useEffect(() => {
    invoke<Layer[]>("get-mappings").then((initial) => {
      if (initial) {
        setLayers(initial);
      }
    });
  }, [invoke]);

  // レイヤー追加
  const addLayer = useCallback(
    (newLayerId: string) => {
      send("add-layer", { layerId: newLayerId });
      // 楽観的更新
      setLayers((prev) => [...prev, { id: newLayerId, bindings: {} }]);
    },
    [send]
  );

  // レイヤー削除
  const removeLayer = useCallback(
    (targetLayerId: string) => {
      send("remove-layer", { layerId: targetLayerId });
      // 楽観的更新
      setLayers((prev) => prev.filter((l) => l.id !== targetLayerId));
      // 削除したレイヤーが選択中だった場合はbaseに戻す
      setLayerId((prev) => (prev === targetLayerId ? "base" : prev));
    },
    [send]
  );

  // マッピング保存
  const saveMapping = useCallback(
    (from: number, trigger: TriggerType, action: Action) => {
      send("add-mapping", { layerId, from, binding: { trigger, action } });
      // 楽観的更新
      setLayers(upsert(layerId, from, trigger, action));
    },
    [send, layerId]
  );

  // マッピング削除
  const removeMapping = useCallback(
    (from: number, trigger: TriggerType) => {
      send("remove-binding", { layerId, from, trigger });
      // 楽観的更新
      setLayers(remove(layerId, from, trigger));
    },
    [send, layerId]
  );

  // 現在のレイヤーのバインディング
  const currentBindings = layers.find((l) => l.id === layerId)?.bindings ?? {};

  return {
    layers,
    layerId,
    setLayerId,
    currentBindings,
    addLayer,
    removeLayer,
    saveMapping,
    removeMapping,
  };
}

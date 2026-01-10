// レイヤー状態とマッピング管理のカスタムフック

import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  Action,
  Layer,
  TriggerType,
} from "../../../shared/types/remapConfig";
import { remove, upsert } from "../utils/handleMapping";
import { useIpc } from "./useIpc";

const REFRESH_DELAY_MS = 100;

export interface UseLayerStateReturn {
  layers: Layer[];
  layerOrder: string[]; // 追加
  layerId: string;
  setLayerId: React.Dispatch<React.SetStateAction<string>>;
  currentBindings: Layer["bindings"];
  addLayer: (newLayerId: string) => void;
  removeLayer: (targetLayerId: string) => void;
  reorderLayers: (newOrder: string[]) => void; // 追加
  saveMapping: (
    from: number,
    trigger: TriggerType,
    action: Action,
    timing?: number | null
  ) => void;
  removeMapping: (from: number, trigger: TriggerType) => void;
  reloadLayers: () => Promise<void>; // 追加
}

/**
 * レイヤーとマッピングを管理するカスタムフック
 */
export function useLayerState(): UseLayerStateReturn {
  const { send, invoke } = useIpc();
  const [layers, setLayers] = useState<UseLayerStateReturn["layers"]>([]);
  const [layerId, setLayerId] =
    useState<UseLayerStateReturn["layerId"]>("base");
  const [layerOrder, setLayerOrder] = useState<
    UseLayerStateReturn["layerOrder"]
  >([]); // 追加

  // 初期化：マッピングを取得
  const loadLayers = useCallback(async () => {
    const initial = await invoke<{ layers: Layer[]; layerOrder: string[] }>(
      "get-mappings"
    );
    if (initial) {
      setLayers(initial.layers);
      setLayerOrder(initial.layerOrder);
    }
  }, [invoke]);

  useEffect(() => {
    loadLayers();
  }, [loadLayers]);

  // レイヤー追加
  const addLayer = useCallback<UseLayerStateReturn["addLayer"]>(
    (newLayerId) => {
      send("add-layer", { layerId: newLayerId });
      // 楽観的更新
      setLayers((prev) => [...prev, { id: newLayerId, bindings: {} }]);
      setLayerOrder((prev) => [...prev, newLayerId]);
    },
    [send]
  );

  // レイヤー削除
  const removeLayer = useCallback<UseLayerStateReturn["removeLayer"]>(
    (targetLayerId) => {
      send("remove-layer", { layerId: targetLayerId });
      // 楽観的更新
      setLayers((prev) => prev.filter((l) => l.id !== targetLayerId));
      setLayerOrder((prev) => prev.filter((id) => id !== targetLayerId));
      // 削除したレイヤーが選択中だった場合はbaseに戻す
      setLayerId((prev) => (prev === targetLayerId ? "base" : prev));
    },
    [send]
  );

  // レイヤー並べ替え
  const reorderLayers = useCallback<UseLayerStateReturn["reorderLayers"]>(
    (newOrder) => {
      send("reorder-layers", { newOrder });
      // 楽観的更新
      setLayerOrder(newOrder);
    },
    [send]
  );

  // マッピング保存
  const saveMapping = useCallback<UseLayerStateReturn["saveMapping"]>(
    (from, trigger, action, timing) => {
      // triggerに応じたtimingMsを決定
      const timingMs =
        trigger === "hold" || trigger === "doubleTap" ? timing : undefined;

      send("save-key-config", {
        layerId,
        from,
        binding: { trigger, action, timingMs },
      });
      // 楽観的更新
      setLayers(upsert(layerId, from, trigger, action));
      // 設定が変更された場合は再読み込みしてUIを更新
      setTimeout(() => {
        loadLayers();
      }, REFRESH_DELAY_MS);
    },
    [send, layerId, loadLayers]
  );

  // マッピング削除
  const removeMapping = useCallback<UseLayerStateReturn["removeMapping"]>(
    (from, trigger) => {
      send("remove-binding", { layerId, from, trigger });
      // 楽観的更新
      setLayers(remove(layerId, from, trigger));
    },
    [send, layerId]
  );

  // レイヤーをlayerOrderに基づいてソート
  const sortedLayers = useMemo(() => {
    if (layerOrder.length === 0) {
      return layers;
    }

    // layerOrderのインデックスをマップ化
    const orderMap = new Map(layerOrder.map((id, index) => [id, index]));

    return [...layers].sort((a, b) => {
      const ia = orderMap.get(a.id) ?? Number.MAX_SAFE_INTEGER;
      const ib = orderMap.get(b.id) ?? Number.MAX_SAFE_INTEGER;
      return ia - ib;
    });
  }, [layers, layerOrder]);

  // 現在のレイヤーのバインディング
  const currentBindings =
    sortedLayers.find((l) => l.id === layerId)?.bindings ?? {};

  return {
    layers: sortedLayers,
    layerOrder,
    layerId,
    setLayerId,
    currentBindings,
    addLayer,
    removeLayer,
    reorderLayers,
    saveMapping,
    removeMapping,
    reloadLayers: loadLayers,
  };
}

// バインディング設定読み込みフック

import { useCallback, useEffect, useState } from "react";
import type {
  ActionType,
  TriggerType,
} from "../../../shared/types/remapConfig";
import {
  actionToBindingState,
  type BindingState,
  createInitialBindingState,
} from "../utils/bindingState";
import { useGetMappings } from "./useInvoke";

export interface UseBindingConfigProps {
  targetVk: number;
  layerId: string;
  defaultLayerId: string;
}

export interface UseBindingConfigReturn {
  state: BindingState;
  existingTiming: {
    holdThresholdMs: number | undefined;
    tapIntervalMs: number | undefined;
  };
  setActionType: (actionType: ActionType) => void;
  setTargetKeys: (targetKeys: number[]) => void;
  addTargetKey: (keyCode: number) => void;
  clearTargetKeys: () => void;
  setSelectedLayerId: (selectedLayerId: string) => void;
  loadBindingForTrigger: (trigger: TriggerType) => Promise<void>;
}

/**
 * 特定キーのバインディング設定を読み込むフック
 */
export function useBindingConfig({
  targetVk,
  layerId,
  defaultLayerId,
}: UseBindingConfigProps): UseBindingConfigReturn {
  const getMappings = useGetMappings();
  const [state, setState] = useState<UseBindingConfigReturn["state"]>(() =>
    createInitialBindingState(defaultLayerId)
  );

  const [existingTiming, setExistingTiming] = useState<{
    holdThresholdMs: number | undefined;
    tapIntervalMs: number | undefined;
  }>({ holdThresholdMs: undefined, tapIntervalMs: undefined });

  // バインディングとタイミング設定を一度に取得
  const fetchBindings = useCallback(async () => {
    const allLayers = await getMappings();
    if (!allLayers) {
      return;
    }
    const layer = allLayers.layers.find((l) => l.id === layerId);
    const bindings = layer?.bindings[targetVk];

    return bindings;
  }, [getMappings, layerId, targetVk]);

  // トリガー変更時にバインディングとタイミングを読み込み
  // トリガー変更時にバインディングとタイミングを読み込み
  const loadBindingForTrigger = useCallback<
    UseBindingConfigReturn["loadBindingForTrigger"]
  >(
    async (trigger) => {
      // 状態をリセット
      setState(createInitialBindingState(defaultLayerId));

      const bindings = await fetchBindings();

      const binding = bindings?.find((b) => b.trigger === trigger);

      if (binding) {
        const partialState = actionToBindingState(binding.action);
        setState((prev) => ({
          ...prev,
          ...partialState,
          hasExistingBinding: true,
        }));
      }
      // タイミング設定を更新
      setExistingTiming({
        holdThresholdMs: bindings?.find((b) => b.trigger === "hold")?.timingMs,
        tapIntervalMs: bindings?.find((b) => b.trigger === "doubleTap")
          ?.timingMs,
      });
    },
    [fetchBindings, defaultLayerId]
  );

  // 初期読み込み
  useEffect(() => {
    loadBindingForTrigger("tap");
  }, [loadBindingForTrigger]);

  // 状態セッター
  // 状態セッター
  const setActionType = useCallback<UseBindingConfigReturn["setActionType"]>(
    (actionType) => {
      setState((prev) => ({ ...prev, actionType }));
    },
    []
  );

  const setTargetKeys = useCallback<UseBindingConfigReturn["setTargetKeys"]>(
    (targetKeys) => {
      setState((prev) => ({ ...prev, targetKeys }));
    },
    []
  );

  const addTargetKey = useCallback<UseBindingConfigReturn["addTargetKey"]>(
    (keyCode) => {
      setState((prev) => ({
        ...prev,
        targetKeys: prev.targetKeys.includes(keyCode)
          ? prev.targetKeys
          : [...prev.targetKeys, keyCode],
      }));
    },
    []
  );

  const clearTargetKeys = useCallback<
    UseBindingConfigReturn["clearTargetKeys"]
  >(() => {
    setState((prev) => ({ ...prev, targetKeys: [] }));
  }, []);

  const setSelectedLayerId = useCallback<
    UseBindingConfigReturn["setSelectedLayerId"]
  >((selectedLayerId) => {
    setState((prev) => ({ ...prev, selectedLayerId }));
  }, []);

  return {
    state,
    existingTiming,
    setActionType,
    setTargetKeys,
    addTargetKey,
    clearTargetKeys,
    setSelectedLayerId,
    loadBindingForTrigger,
  };
}

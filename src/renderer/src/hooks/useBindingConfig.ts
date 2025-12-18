// バインディング設定読み込みフック

import { useCallback, useEffect, useState } from "react";
import type {
  ActionType,
  KeyBinding,
  TriggerType,
} from "../../../shared/types/remapConfig";
import {
  actionToBindingState,
  type BindingState,
  createInitialBindingState,
} from "../utils/bindingState";
import { useGetMappings } from "./useInvoke";

interface UseBindingConfigProps {
  targetVk: number;
  layerId: string;
  defaultLayerId: string;
}

/**
 * 特定キーのバインディング設定を読み込むフック
 */
export function useBindingConfig({
  targetVk,
  layerId,
  defaultLayerId,
}: UseBindingConfigProps) {
  const getMappings = useGetMappings();
  const [state, setState] = useState<BindingState>(() =>
    createInitialBindingState(defaultLayerId)
  );

  // バインディングを取得する関数
  const fetchBinding = useCallback(
    async (trigger: TriggerType): Promise<KeyBinding | undefined> => {
      const allLayers = await getMappings();
      if (!allLayers) {
        return;
      }

      const layer = allLayers.find((l) => l.id === layerId);
      return layer?.bindings[targetVk]?.find((b) => b.trigger === trigger);
    },
    [getMappings, layerId, targetVk]
  );

  // トリガー変更時にバインディングを読み込み
  const loadBindingForTrigger = useCallback(
    async (trigger: TriggerType) => {
      // 状態をリセット
      setState(createInitialBindingState(defaultLayerId));

      const binding = await fetchBinding(trigger);
      if (binding) {
        const partialState = actionToBindingState(binding.action);
        setState((prev) => ({
          ...prev,
          ...partialState,
          hasExistingBinding: true,
        }));
      }
    },
    [fetchBinding, defaultLayerId]
  );

  // 初期読み込み
  useEffect(() => {
    loadBindingForTrigger("tap");
  }, [loadBindingForTrigger]);

  // 状態セッター
  const setActionType = useCallback((actionType: ActionType) => {
    setState((prev) => ({ ...prev, actionType }));
  }, []);

  const setTargetKeys = useCallback((targetKeys: number[]) => {
    setState((prev) => ({ ...prev, targetKeys }));
  }, []);

  const addTargetKey = useCallback((keyCode: number) => {
    setState((prev) => ({
      ...prev,
      targetKeys: prev.targetKeys.includes(keyCode)
        ? prev.targetKeys
        : [...prev.targetKeys, keyCode],
    }));
  }, []);

  const clearTargetKeys = useCallback(() => {
    setState((prev) => ({ ...prev, targetKeys: [] }));
  }, []);

  const setSelectedLayerId = useCallback((selectedLayerId: string) => {
    setState((prev) => ({ ...prev, selectedLayerId }));
  }, []);

  return {
    ...state,
    setActionType,
    setTargetKeys,
    addTargetKey,
    clearTargetKeys,
    setSelectedLayerId,
    loadBindingForTrigger,
  };
}

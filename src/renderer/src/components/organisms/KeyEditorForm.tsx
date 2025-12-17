import { useCallback, useEffect, useRef, useState } from "react";
import type {
  Action,
  ActionType,
  Layer,
  TriggerType,
} from "../../../../shared/types/remapConfig";
import type { KeyboardLayout } from "../../types";
import { getLayerDescription } from "../../utils/getLayerDescription";
import {
  objectiveDiscriminantSwitch,
  objectiveSwitch,
} from "../../utils/objectiveSwitch";
import { Button } from "../atoms/Button";
import { ActionTypeSelector } from "../molecules/ActionTypeSelector";
import { KeyDisplay } from "../molecules/KeyDisplay";
import { LayerSelector } from "../molecules/LayerSelector";
import { TriggerSelector } from "../molecules/TriggerSelector";

interface KeyEditorFormProps {
  targetVk: number;
  layerId: string;
  keyboardLayout: KeyboardLayout;
  layers: Pick<Layer, "id">[];
  onSave: (trigger: TriggerType, action: Action) => void;
  onRemove: (trigger: TriggerType) => void;
  onClose: () => void;
}

export function KeyEditorForm({
  targetVk,
  layerId,
  keyboardLayout,
  layers,
  onSave,
  onRemove,
  onClose,
}: KeyEditorFormProps) {
  const [selectedTrigger, setSelectedTrigger] = useState<TriggerType>("tap");
  const [actionType, setActionType] = useState<ActionType>("remap");
  const [targetKeys, setTargetKeys] = useState<number[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState(layers[0]?.id || "");
  const [hasExistingBinding, setHasExistingBinding] = useState(false);

  // トリガータイプ変更時にconfigから該当トリガーのバインディングを取得
  const handleTriggerChange = useCallback(
    (newTrigger: TriggerType) => {
      setSelectedTrigger(newTrigger);
      // 状態をリセット
      setActionType("remap");
      setTargetKeys([]);
      setSelectedLayerId(layers[0]?.id || "");
      setHasExistingBinding(false);

      const ipc = window.electron?.ipcRenderer;
      if (!ipc) {
        return;
      }

      ipc.invoke("get-mappings").then((allLayers: Layer[]) => {
        const layer = allLayers.find((l) => l.id === layerId);
        const bindings = layer?.bindings[targetVk];
        const currentBinding = bindings?.find((b) => b.trigger === newTrigger);

        if (currentBinding) {
          setHasExistingBinding(true);
          objectiveDiscriminantSwitch(
            {
              remap: (act) => {
                setActionType("remap");
                setTargetKeys(act.keys);
              },
              layerToggle: (act) => {
                setActionType("layerToggle");
                setSelectedLayerId(act.layerId);
              },
              layerMomentary: (act) => {
                setActionType("layerMomentary");
                setSelectedLayerId(act.layerId);
              },
              none: () => {
                setActionType("none");
              },
            },
            currentBinding.action,
            "type"
          );
        }
      });
    },
    [layers, layerId, targetVk]
  );
  const inputFocusedRef = useRef(false);
  const enterTimerRef = useRef<number | null>(null);
  const enterActiveRef = useRef(false);
  const ENTER_HOLD_MS = 2000;

  // handleSaveとonCloseをrefで保持（useEffectの依存配列問題を回避）
  // biome-ignore lint/suspicious/noEmptyBlockStatements: 初期値としてのnoop関数
  const handleSaveRef = useRef<() => void>(() => {});
  // biome-ignore lint/suspicious/noEmptyBlockStatements: 初期値としてのnoop関数
  const onCloseRef = useRef<() => void>(() => {});

  const clearEnterTimer = useCallback(() => {
    if (enterTimerRef.current !== null) {
      window.clearTimeout(enterTimerRef.current);
      enterTimerRef.current = null;
    }
    enterActiveRef.current = false;
  }, []);

  const handleSave = useCallback(() => {
    const action: Action = objectiveSwitch<ActionType, Action>(
      {
        remap: () => ({ type: "remap", keys: targetKeys }),
        layerToggle: () => ({ type: "layerToggle", layerId: selectedLayerId }),
        layerMomentary: () => ({
          type: "layerMomentary",
          layerId: selectedLayerId,
        }),
        none: () => ({ type: "none" }),
      },
      actionType
    );

    onSave(selectedTrigger, action);
    onClose();
  }, [
    actionType,
    onClose,
    onSave,
    selectedLayerId,
    selectedTrigger,
    targetKeys,
  ]);

  // handleSaveとonCloseのrefを更新
  useEffect(() => {
    handleSaveRef.current = handleSave;
    onCloseRef.current = onClose;
  }, [handleSave, onClose]);

  const handleRemove = useCallback(() => {
    onRemove(selectedTrigger);
    onClose();
  }, [onClose, onRemove, selectedTrigger]);

  // マウント時にconfigからバインディングを取得（targetVkまたはlayerIdが変わった時のみ）
  useEffect(() => {
    // 状態をリセット
    setSelectedTrigger("tap");
    setActionType("remap");
    setTargetKeys([]);
    setHasExistingBinding(false);

    const ipc = window.electron?.ipcRenderer;
    if (!ipc) {
      return;
    }

    ipc.invoke("get-mappings").then((allLayers: Layer[]) => {
      // デフォルトのレイヤーIDを設定
      if (allLayers.length > 0) {
        setSelectedLayerId(allLayers[0].id);
      }

      const layer = allLayers.find((l) => l.id === layerId);
      const bindings = layer?.bindings[targetVk];
      const currentBinding = bindings?.find((b) => b.trigger === "tap");

      if (currentBinding) {
        setHasExistingBinding(true);
        objectiveDiscriminantSwitch(
          {
            remap: (act) => {
              setActionType("remap");
              setTargetKeys(act.keys);
            },
            layerToggle: (act) => {
              setActionType("layerToggle");
              setSelectedLayerId(act.layerId);
            },
            layerMomentary: (act) => {
              setActionType("layerMomentary");
              setSelectedLayerId(act.layerId);
            },
            none: () => {
              setActionType("none");
            },
          },
          currentBinding.action,
          "type"
        );
      }
    });
    // layersを依存配列から除外し、targetVkとlayerIdの変更時のみ再取得
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetVk, layerId]);

  // キーイベントリスナー（通常のDOMイベントを使用）
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Enterキーで保存
      if (e.key === "Enter" && !enterActiveRef.current) {
        enterActiveRef.current = true;
        enterTimerRef.current = window.setTimeout(() => {
          enterActiveRef.current = false;
        }, ENTER_HOLD_MS);
      }

      // リマップ設定中のキー選択
      if (inputFocusedRef.current || actionType !== "remap") {
        return;
      }
      // 特殊キーは無視
      if (e.key === "Enter" || e.key === "Escape" || e.key === "Tab") {
        return;
      }
      // e.keyCodeは非推奨だが、VKコードとして使用可能
      // 長押しで順次キーを追加
      if (e.keyCode && !targetKeys.includes(e.keyCode)) {
        setTargetKeys((prev) => [...prev, e.keyCode]);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        clearEnterTimer();
        if (enterActiveRef.current) {
          enterActiveRef.current = false;
          return;
        }
        handleSaveRef.current();
        onCloseRef.current();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, [clearEnterTimer, actionType, targetKeys]);

  return (
    <div className="space-y-4 p-6">
      {/* キー表示 */}
      <div className="flex items-center justify-center gap-4 font-bold text-2xl">
        <KeyDisplay keyboardLayout={keyboardLayout} vkCode={targetVk} />
      </div>

      {/* トリガー選択 */}
      <TriggerSelector
        onTriggerChange={handleTriggerChange}
        selectedTrigger={selectedTrigger}
      />

      {/* アクション種別選択 */}
      <ActionTypeSelector
        actionType={actionType}
        onActionTypeChange={setActionType}
        triggerType={selectedTrigger}
      />

      {/* リマップ設定 */}
      {actionType === "remap" && (
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-4 font-bold text-xl">
            <span className="text-muted-foreground">→</span>
            {targetKeys.length > 0 ? (
              <div className="flex gap-1">
                {targetKeys.map((vk) => (
                  <KeyDisplay
                    key={vk}
                    keyboardLayout={keyboardLayout}
                    variant="primary"
                    vkCode={vk}
                  />
                ))}
              </div>
            ) : (
              <span className="rounded-md border border-muted-foreground border-dashed px-4 py-2 text-muted-foreground">
                キーを長押して選択
              </span>
            )}
          </div>
          <Button onClick={() => setTargetKeys([])} size="sm" variant="ghost">
            クリア
          </Button>
        </div>
      )}

      {/* レイヤー選択 */}
      {(actionType === "layerToggle" || actionType === "layerMomentary") && (
        <LayerSelector
          description={getLayerDescription(actionType)}
          layers={layers}
          onLayerChange={setSelectedLayerId}
          selectedLayerId={selectedLayerId}
        />
      )}

      {/* ボタン */}
      <div className="flex justify-end gap-2 pt-2">
        {hasExistingBinding ? (
          <Button onClick={handleRemove} variant="destructive">
            削除
          </Button>
        ) : null}
        <Button
          disabled={actionType === "remap" && targetKeys.length === 0}
          onClick={handleSave}
          variant="primary"
        >
          保存
        </Button>
      </div>
    </div>
  );
}

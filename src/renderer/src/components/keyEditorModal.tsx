import { AnimatePresence, motion } from "framer-motion";
import { Layers, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Action, TriggerType } from "../../../shared/types/remapConfig";
import { VK } from "../constants";
import type { KeyDefinition } from "../types";
import { getKeyLabel } from "../utils/getKeyLabel";

/** トリガー種別の選択肢 */
const TRIGGER_OPTIONS: { value: TriggerType; label: string }[] = [
  { value: "tap", label: "Tap（単押し）" },
  { value: "hold", label: "Hold（長押し）" },
  { value: "doubleTap", label: "Double Tap（2回押し）" },
];

/** アクション種別の選択肢 */
const ACTION_TYPE_OPTIONS = [
  { value: "remap", label: "キーリマップ" },
  { value: "layerToggle", label: "レイヤー切替" },
  { value: "layerMomentary", label: "レイヤー（押下中）" },
  { value: "none", label: "無効化" },
] as const;

interface KeyEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetVk: number | null;
  keyboardLayout: KeyDefinition[][];
  onSave: (from: number, trigger: TriggerType, action: Action) => void;
  onRemove: (from: number, trigger: TriggerType) => void;
  /** 現在のバインディング */
  currentBindings: Array<{ trigger: TriggerType; action: Action }>;
  /** 利用可能なレイヤー */
  layers: Array<{ id: string; name: string }>;
}

export function KeyEditorModal({
  isOpen,
  onClose,
  targetVk,
  keyboardLayout,
  onSave,
  onRemove,
  currentBindings,
  layers,
}: KeyEditorModalProps) {
  // 選択中のトリガー
  const [selectedTrigger, setSelectedTrigger] = useState<TriggerType>("tap");
  // アクション種別
  const [actionType, setActionType] = useState<
    "remap" | "layerToggle" | "layerMomentary" | "none"
  >("remap");
  // リマップ先のキーコード
  const [targetKey, setTargetKey] = useState("");
  // レイヤーID（レイヤー関連アクション用）
  const [selectedLayerId, setSelectedLayerId] = useState(layers[0]?.id || "");

  const inputFocusedRef = useRef(false);
  const enterTimerRef = useRef<number | null>(null);
  const enterActiveRef = useRef(false);
  const ENTER_HOLD_MS = 2000;

  // 現在のトリガーに対するバインディングを取得
  const currentBinding = currentBindings.find(
    (b) => b.trigger === selectedTrigger
  );

  const clearEnterTimer = useCallback(() => {
    if (enterTimerRef.current !== null) {
      window.clearTimeout(enterTimerRef.current);
      enterTimerRef.current = null;
    }
    enterActiveRef.current = false;
  }, []);

  const close = useCallback(() => {
    clearEnterTimer();
    onClose();
    setTargetKey("");
    setSelectedTrigger("tap");
    setActionType("remap");
  }, [clearEnterTimer, onClose]);

  const handleSave = useCallback(() => {
    if (!targetVk) {
      return;
    }

    let action: Action;
    switch (actionType) {
      case "remap":
        if (!targetKey) {
          return;
        }
        action = { type: "remap", key: Number.parseInt(targetKey, 10) };
        break;
      case "layerToggle":
        action = { type: "layerToggle", layerId: selectedLayerId };
        break;
      case "layerMomentary":
        action = { type: "layerMomentary", layerId: selectedLayerId };
        break;
      case "none":
        action = { type: "none" };
        break;
    }

    onSave(targetVk, selectedTrigger, action);
    close();
  }, [
    actionType,
    close,
    onSave,
    selectedLayerId,
    selectedTrigger,
    targetKey,
    targetVk,
  ]);

  const handleRemove = useCallback(() => {
    if (targetVk) {
      onRemove(targetVk, selectedTrigger);
      close();
    }
  }, [close, onRemove, selectedTrigger, targetVk]);

  // バインディングが変わったらフォームを更新
  useEffect(() => {
    if (currentBinding) {
      const act = currentBinding.action;
      if (act.type === "remap") {
        setActionType("remap");
        setTargetKey(act.key.toString());
      } else if (act.type === "layerToggle") {
        setActionType("layerToggle");
        setSelectedLayerId(act.layerId);
      } else if (act.type === "layerMomentary") {
        setActionType("layerMomentary");
        setSelectedLayerId(act.layerId);
      } else if (act.type === "none") {
        setActionType("none");
      }
    } else {
      setTargetKey("");
    }
  }, [currentBinding]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleEnterKeyEvent = (isKeyUp: boolean) => {
      if (isKeyUp) {
        clearEnterTimer();
        if (enterActiveRef.current) {
          enterActiveRef.current = false;
          return true;
        }
        handleSave();
        close();
      } else if (!enterActiveRef.current) {
        enterActiveRef.current = true;
        enterTimerRef.current = window.setTimeout(() => {
          enterActiveRef.current = false;
        }, ENTER_HOLD_MS);
      }
      return false;
    };

    const handleKeyEvent = (
      _event: unknown,
      data: { vkCode: number; isUp: boolean }
    ) => {
      if (data.vkCode === VK.ENTER && !handleEnterKeyEvent(data.isUp)) {
        return;
      }

      if (inputFocusedRef.current || actionType !== "remap") {
        return;
      }
      setTargetKey(data.vkCode.toString());
    };

    const ipc = window.electron?.ipcRenderer;
    ipc?.on("key-event", handleKeyEvent);
    return () => {
      ipc?.off("key-event", handleKeyEvent);
    };
  }, [isOpen, clearEnterTimer, close, handleSave, actionType]);

  if (!isOpen || targetVk === null) {
    return null;
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
        <motion.div
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md overflow-hidden rounded-xl border bg-background shadow-lg"
          exit={{ opacity: 0, scale: 0.95 }}
          initial={{ opacity: 0, scale: 0.95 }}
        >
          <div className="flex items-center justify-between border-b p-4">
            <h3 className="font-semibold text-lg">Edit Key Mapping</h3>
            <button
              className="rounded-full p-1 transition-colors hover:bg-muted"
              onClick={close}
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4 p-6">
            {/* キー表示 */}
            <div className="flex items-center justify-center gap-4 font-bold text-2xl">
              <div className="rounded border bg-muted px-4 py-2">
                {getKeyLabel(targetVk, keyboardLayout)}
              </div>
            </div>

            {/* トリガー選択 */}
            <div className="space-y-2">
              <label className="font-medium text-muted-foreground text-xs">
                トリガー
              </label>
              <div className="flex gap-1 rounded-lg border bg-muted/30 p-1">
                {TRIGGER_OPTIONS.map((opt) => (
                  <button
                    className={`flex-1 rounded-md px-2 py-1.5 font-medium text-xs transition-colors ${
                      selectedTrigger === opt.value
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                    key={opt.value}
                    onClick={() => setSelectedTrigger(opt.value)}
                    type="button"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* アクション種別選択 */}
            <div className="space-y-2">
              <label className="font-medium text-muted-foreground text-xs">
                アクション
              </label>
              <select
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                onChange={(e) =>
                  setActionType(
                    e.target.value as
                      | "remap"
                      | "layerToggle"
                      | "layerMomentary"
                      | "none"
                  )
                }
                value={actionType}
              >
                {ACTION_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* リマップ設定（actionType === "remap"の場合） */}
            {actionType === "remap" && (
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-4 font-bold text-xl">
                  <span className="text-muted-foreground">→</span>
                  <div className="rounded border bg-primary/10 px-4 py-2 text-primary">
                    {targetKey ? getKeyLabel(+targetKey, keyboardLayout) : "?"}
                  </div>
                </div>
                <input
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  name="vkCode"
                  onBlur={() => {
                    inputFocusedRef.current = false;
                  }}
                  onChange={(e) => setTargetKey(e.target.value)}
                  onFocus={() => {
                    inputFocusedRef.current = true;
                  }}
                  placeholder="VK Code (e.g., 65) またはキーを押す"
                  type="number"
                  value={targetKey}
                />
              </div>
            )}

            {/* レイヤー選択（layerToggle/layerMomentaryの場合） */}
            {(actionType === "layerToggle" ||
              actionType === "layerMomentary") && (
              <div className="space-y-2">
                <label className="font-medium text-muted-foreground text-xs">
                  <Layers className="mr-1 inline h-4 w-4" />
                  対象レイヤー
                </label>
                <select
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  onChange={(e) => setSelectedLayerId(e.target.value)}
                  value={selectedLayerId}
                >
                  {layers.map((layer) => (
                    <option key={layer.id} value={layer.id}>
                      {layer.name}
                    </option>
                  ))}
                </select>
                <p className="text-muted-foreground text-xs">
                  {actionType === "layerToggle"
                    ? "キーを押すとレイヤーをトグル切替します"
                    : "キーを押している間だけレイヤーが有効になります"}
                </p>
              </div>
            )}

            {/* ボタン */}
            <div className="flex justify-end gap-2 pt-2">
              {currentBinding && (
                <button
                  className="rounded-md px-4 py-2 font-medium text-destructive text-sm transition-colors hover:bg-destructive/10"
                  onClick={handleRemove}
                  type="button"
                >
                  削除
                </button>
              )}
              <button
                className="rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground text-sm transition-colors hover:bg-primary/90 disabled:opacity-50"
                disabled={actionType === "remap" && !targetKey}
                onClick={handleSave}
                type="button"
              >
                保存
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

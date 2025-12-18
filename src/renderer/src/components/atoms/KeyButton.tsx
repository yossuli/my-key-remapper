import { motion } from "framer-motion";
import { KEY_SIZE_REM } from "../../../../shared/constants/index";
import type {
  Action,
  KeyBinding,
  TriggerType,
} from "../../../../shared/types/remapConfig";
import type { KeyboardLayout, KeyDefinition } from "../../types";
import { cn } from "../../utils/cn";
import { getKeyLabel } from "../../utils/getKeyLabel";

interface KeyButtonProps {
  keyDef: KeyDefinition;
  bindings?: KeyBinding[];
  keyboardLayout: KeyboardLayout;
  isBaseLayer: boolean;
  selectedTrigger: TriggerType;
  onClick: (vk: number) => void;
}

/**
 * アクションに基づいて表示ラベルを取得する
 */
function getDisplayLabel(
  action: Action | undefined,
  defaultLabel: string,
  keyboardLayout: KeyboardLayout
): string {
  if (!action) {
    return defaultLabel;
  }
  if ("keys" in action) {
    return action.keys.map((vk) => getKeyLabel(vk, keyboardLayout)).join("+");
  }
  if (action.type === "layerToggle") {
    return `[${action.layerId}]`;
  }
  if (action.type === "layerMomentary") {
    return `(${action.layerId})`;
  }
  if (action.type === "none") {
    return "×";
  }
  return defaultLabel;
}

export function KeyButton({
  keyDef,
  bindings,
  keyboardLayout,
  isBaseLayer,
  selectedTrigger,
  onClick,
}: KeyButtonProps) {
  const baseVk = Array.isArray(keyDef.vk) ? keyDef.vk[0] : keyDef.vk;

  // 選択されたトリガーに対応するアクションを取得
  const triggerAction = bindings?.find(
    (b) => b.trigger === selectedTrigger
  )?.action;
  const hasBindingForTrigger = triggerAction !== undefined;

  // 表示ラベルを決定
  const displayLabel = getDisplayLabel(
    triggerAction,
    keyDef.label,
    keyboardLayout
  );

  // カスタムレイヤーでバインディングがないキーは薄く表示
  const isInactive = !(isBaseLayer || hasBindingForTrigger);
  const isActive = hasBindingForTrigger && isBaseLayer;

  return (
    <motion.button
      className={cn(
        "flex items-center justify-center rounded-md border font-medium text-sm shadow-sm transition-colors",
        isActive
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background text-foreground hover:bg-muted",
        isInactive ? "opacity-30" : ""
      )}
      onClick={() => onClick(baseVk)}
      style={{
        width: `${(keyDef.width || 1) * KEY_SIZE_REM}rem`,
        height: "3rem",
      }}
      type="button"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {displayLabel}
    </motion.button>
  );
}

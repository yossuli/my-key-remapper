import { motion } from "framer-motion";
import { KEY_SIZE_REM } from "../../../../shared/constants/index";
import type { KeyBinding } from "../../../../shared/types/remapConfig";
import type { KeyboardLayout, KeyDefinition } from "../../types";
import { cn } from "../../utils/cn";
import { getKeyLabel } from "../../utils/getKeyLabel";

interface KeyButtonProps {
  keyDef: KeyDefinition;
  bindings?: KeyBinding[];
  keyboardLayout: KeyboardLayout;
  isBaseLayer: boolean;
  onClick: (vk: number) => void;
}

export function KeyButton({
  keyDef,
  bindings,
  keyboardLayout,
  isBaseLayer,
  onClick,
}: KeyButtonProps) {
  const baseVk = Array.isArray(keyDef.vk) ? keyDef.vk[0] : keyDef.vk;
  const tapAction = bindings?.find((b) => b.trigger === "tap")?.action;
  const hasBinding = Boolean(bindings && bindings.length > 0);

  const displayLabel =
    tapAction && "key" in tapAction
      ? getKeyLabel(tapAction.key, keyboardLayout)
      : keyDef.label;

  // カスタムレイヤーでバインディングがないキーは薄く表示
  const isInactive = !(isBaseLayer || hasBinding);

  return (
    <motion.button
      className={cn(
        "flex items-center justify-center rounded-md border font-medium text-sm shadow-sm transition-colors",
        hasBinding && isBaseLayer
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

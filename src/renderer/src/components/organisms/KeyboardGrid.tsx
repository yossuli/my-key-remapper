import {
  KEYBOARD_LAYOUT_BASE,
  KEYBOARD_LAYOUT_SHIFT,
} from "../../../../shared/constants";
import type { Layer, TriggerType } from "../../../../shared/types/remapConfig";
import type { KeyboardLayout, LayoutType } from "../../types";
import { KeyButton } from "../atoms/KeyButton";
import { Mapped } from "../control/Mapped";

interface KeyboardGridProps {
  bindings: Layer["bindings"];
  keyboardLayout: KeyboardLayout;
  layout: LayoutType;
  layerId: string;
  selectedTrigger: TriggerType;
  quickEditingKey?: number | null; // クイック設定モードで入力待ち中のキー
  onKeyClick: (vk: number) => void;
  onRemoveMapping: (from: number) => void;
}

export function KeyboardGrid({
  bindings,
  // keyboardLayout,
  layout,
  layerId,
  selectedTrigger,
  quickEditingKey,
  onKeyClick,
  onRemoveMapping,
}: KeyboardGridProps) {
  const keyboardLayout: KeyboardLayout =
    layerId === "shift"
      ? KEYBOARD_LAYOUT_SHIFT[layout]
      : KEYBOARD_LAYOUT_BASE[layout];
  return (
    <Mapped
      as="div"
      className="flex select-none flex-col gap-2 rounded-xl border bg-card p-4 shadow-sm"
      value={keyboardLayout}
    >
      {({ row }) => (
        <Mapped as="div" className="flex justify-center gap-1.5" value={row}>
          {(keyDef) => {
            const baseVk = Array.isArray(keyDef.vk) ? keyDef.vk[0] : keyDef.vk;
            return (
              <KeyButton
                bindings={bindings[baseVk]}
                isQuickEditing={quickEditingKey === baseVk}
                keyDef={keyDef}
                layerId={layerId}
                layout={layout}
                onClick={onKeyClick}
                onRemove={() => onRemoveMapping(baseVk)}
                selectedTrigger={selectedTrigger}
              />
            );
          }}
        </Mapped>
      )}
    </Mapped>
  );
}

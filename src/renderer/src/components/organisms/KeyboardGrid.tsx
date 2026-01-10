import { KeyButton } from "@/components/atoms/KeyButton";
import { Mapped } from "@/components/control/Mapped";
import type { LayerState } from "@/components/pages/KeyRemapperPage";
import type { KeyboardLayout, LayoutType } from "@/types";
import {
  KEYBOARD_LAYOUT_BASE,
  KEYBOARD_LAYOUT_SHIFT,
} from "../../../../shared/constants";
import type {
  KeyBinding,
  TriggerType,
} from "../../../../shared/types/remapConfig";

interface KeyboardGridProps {
  bindings: Record<number, KeyBinding[]>;
  keyboardLayout: KeyboardLayout;
  layout: LayoutType;
  layerState: LayerState; // { layers, layerId }
  mappingActions: {
    removeMapping: (from: number) => void;
  };
  selectedTrigger: TriggerType;
  quickEditingKey?: number | null;
  onKeyClick: (vk: number) => void;
}

export function KeyboardGrid({
  bindings,
  keyboardLayout,
  layout,
  layerState,
  mappingActions,
  selectedTrigger,
  quickEditingKey,
  onKeyClick,
}: KeyboardGridProps) {
  // layerId === "shift" の場合はShiftレイアウトを使用
  const effectiveLayout: KeyboardLayout =
    layerState.layerId === "shift"
      ? KEYBOARD_LAYOUT_SHIFT[layout]
      : (keyboardLayout ?? KEYBOARD_LAYOUT_BASE[layout]);
  return (
    <Mapped
      as="div"
      className="flex select-none flex-col gap-2 rounded-xl border bg-card p-4 shadow-sm"
      value={effectiveLayout}
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
                layerId={layerState.layerId}
                layout={layout}
                onClick={onKeyClick}
                onRemove={() => mappingActions.removeMapping(baseVk)}
                selectedTrigger={selectedTrigger}
              />
            );
          }}
        </Mapped>
      )}
    </Mapped>
  );
}

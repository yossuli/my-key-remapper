import type { Layer, TriggerType } from "../../../../shared/types/remapConfig";
import type { KeyboardLayout } from "../../types";
import { KeyButton } from "../atoms/KeyButton";
import { Mapped } from "../control/Mapped";

interface KeyboardGridProps {
  bindings: Layer["bindings"];
  keyboardLayout: KeyboardLayout;
  isBaseLayer: boolean;
  selectedTrigger: TriggerType;
  onKeyClick: (vk: number) => void;
}

export function KeyboardGrid({
  bindings,
  keyboardLayout,
  isBaseLayer,
  selectedTrigger,
  onKeyClick,
}: KeyboardGridProps) {
  return (
    <Mapped
      as="div"
      className="flex select-none flex-col gap-2 rounded-xl border bg-card p-4 shadow-sm"
      value={keyboardLayout}
    >
      {({ row }) => (
        <Mapped as="div" className="flex justify-center gap-1.5" value={row}>
          {(keyDef) => (
            <KeyButton
              bindings={
                bindings[Array.isArray(keyDef.vk) ? keyDef.vk[0] : keyDef.vk]
              }
              isBaseLayer={isBaseLayer}
              key={keyDef.id}
              keyboardLayout={keyboardLayout}
              keyDef={keyDef}
              onClick={onKeyClick}
              selectedTrigger={selectedTrigger}
            />
          )}
        </Mapped>
      )}
    </Mapped>
  );
}

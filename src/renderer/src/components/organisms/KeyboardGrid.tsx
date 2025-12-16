import type { Layer } from "../../../../shared/types/remapConfig";
import type { KeyboardLayout } from "../../types";
import { KeyButton } from "../atoms/KeyButton";
import { Mapped } from "../control/Mapped";

interface KeyboardGridProps {
  bindings: Layer["bindings"];
  keyboardLayout: KeyboardLayout;
  onKeyClick: (vk: number) => void;
}

export function KeyboardGrid({
  bindings,
  keyboardLayout,
  onKeyClick,
}: KeyboardGridProps) {
  return (
    <Mapped
      className="flex select-none flex-col gap-2 rounded-xl border bg-card p-4 shadow-sm"
      Tag="div"
      value={keyboardLayout}
    >
      {({ row }) => (
        <Mapped className="flex justify-center gap-1.5" Tag="div" value={row}>
          {(keyDef) => (
            <KeyButton
              bindings={
                bindings[Array.isArray(keyDef.vk) ? keyDef.vk[0] : keyDef.vk]
              }
              key={keyDef.id}
              keyboardLayout={keyboardLayout}
              keyDef={keyDef}
              onClick={onKeyClick}
            />
          )}
        </Mapped>
      )}
    </Mapped>
  );
}

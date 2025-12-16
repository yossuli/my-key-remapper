import type { Layer } from "../../../shared/types/remapConfig";
import type { KeyboardLayout } from "../types";
import { KeyButton } from "./atoms/KeyButton";
import { Mapped } from "./controle/Mapped";

interface SimpleKeyboardProps {
  bindings: Layer["bindings"];
  keyboardLayout: KeyboardLayout;
  onKeyClick: (vk: number) => void;
}

export function SimpleKeyboard({
  bindings,
  keyboardLayout,
  onKeyClick,
}: SimpleKeyboardProps) {
  return (
    <div className="flex select-none flex-col gap-2 rounded-xl border bg-card p-4 shadow-sm">
      <Mapped array={keyboardLayout}>
        {({ row }) => (
          <Mapped array={row}>
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
    </div>
  );
}

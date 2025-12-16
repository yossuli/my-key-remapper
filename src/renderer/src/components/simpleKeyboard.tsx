import type { Layer } from "../../../shared/types/remapConfig";
import type { KeyDefinition } from "../types";
import { KeyButton } from "./atoms/KeyButton";

interface SimpleKeyboardProps {
  bindings: Layer["bindings"];
  keyboardLayout: KeyDefinition[][];
  onKeyClick: (vk: number) => void;
}

export function SimpleKeyboard({
  bindings,
  keyboardLayout,
  onKeyClick,
}: SimpleKeyboardProps) {
  return (
    <div className="flex select-none flex-col gap-2 rounded-xl border bg-card p-4 shadow-sm">
      {keyboardLayout.map((row, rowIndex) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: 順序が不変であるため
        <div className="flex justify-center gap-1.5" key={rowIndex}>
          {row.map((keyDef) => {
            const baseVk = Array.isArray(keyDef.vk) ? keyDef.vk[0] : keyDef.vk;
            return (
              <KeyButton
                bindings={bindings[baseVk]}
                key={keyDef.id}
                keyboardLayout={keyboardLayout}
                keyDef={keyDef}
                onClick={onKeyClick}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

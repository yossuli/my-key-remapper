import { Keyboard, Settings } from "lucide-react";
import type { Layer } from "../../../../shared/types/remapConfig";
import { SWITCH_LAYOUT_RULE } from "../../constants";
import type { KeyboardLayout, LayoutType } from "../../types";
import { SimpleKeyboard } from "../simpleKeyboard";

interface KeyRemapViewProps {
  layers: Layer[];
  layerId: string;
  layout: LayoutType;
  keyboardLayout: KeyboardLayout;
  onLayerChange: (layerId: string) => void;
  onLayoutToggle: () => void;
  onKeyClick: (vk: number) => void;
}

export function KeyRemapView({
  layers,
  layerId,
  layout,
  keyboardLayout,
  onLayerChange,
  onLayoutToggle,
  onKeyClick,
}: KeyRemapViewProps) {
  return (
    <section className="space-y-4">
      {/* レイヤー選択UI */}
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-sm">Layer:</span>
        <div className="flex gap-1 rounded-lg border bg-muted/30 p-1">
          {layers.map(({ name }) => (
            <button
              className={`rounded-md px-3 py-1.5 font-medium text-sm transition-colors ${
                layerId === name
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
              key={name}
              onClick={() => onLayerChange(name)}
              type="button"
            >
              {name.charAt(0).toUpperCase() + name.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-semibold text-lg">
          <Settings className="h-5 w-5 opacity-70" />
          Keyboard Layout: {layout}
        </h2>
        <button
          className="flex items-center gap-2 rounded-full border px-4 py-2 font-medium text-sm transition-colors hover:border hover:border-primary"
          onClick={onLayoutToggle}
          type="button"
        >
          <Keyboard className="h-4 w-4" />
          {SWITCH_LAYOUT_RULE[layout]}
        </button>
      </div>
      <div className="overflow-x-auto pb-4">
        <SimpleKeyboard
          bindings={layers.find((l) => l.id === layerId)?.bindings || {}}
          keyboardLayout={keyboardLayout}
          onKeyClick={onKeyClick}
        />
      </div>
    </section>
  );
}

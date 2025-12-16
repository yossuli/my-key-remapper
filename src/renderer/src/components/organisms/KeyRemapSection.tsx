import { Settings } from "lucide-react";
import type { Layer } from "../../../../shared/types/remapConfig";
import type { KeyboardLayout, LayoutType } from "../../types";
import { Icon } from "../atoms/Icon";
import { LayerTabs } from "../molecules/LayerTabs";
import { LayoutToggle } from "../molecules/LayoutToggle";
import { KeyboardGrid } from "./KeyboardGrid";

interface KeyRemapSectionProps {
  layers: Layer[];
  layerId: string;
  layout: LayoutType;
  keyboardLayout: KeyboardLayout;
  onLayerChange: (layerId: string) => void;
  onLayoutToggle: () => void;
  onKeyClick: (vk: number) => void;
}

export function KeyRemapSection({
  layers,
  layerId,
  layout,
  keyboardLayout,
  onLayerChange,
  onLayoutToggle,
  onKeyClick,
}: KeyRemapSectionProps) {
  return (
    <section className="space-y-4">
      {/* レイヤー選択UI */}
      <LayerTabs
        activeLayerId={layerId}
        layers={layers}
        onLayerChange={onLayerChange}
      />

      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-semibold text-lg">
          <Icon className="opacity-70" icon={Settings} />
          Keyboard Layout: {layout}
        </h2>
        <LayoutToggle currentLayout={layout} onToggle={onLayoutToggle} />
      </div>

      <div className="overflow-x-auto pb-4">
        <KeyboardGrid
          bindings={layers.find((l) => l.id === layerId)?.bindings || {}}
          keyboardLayout={keyboardLayout}
          onKeyClick={onKeyClick}
        />
      </div>
    </section>
  );
}

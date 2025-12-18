import { Settings } from "lucide-react";
import type {
  KeyBinding,
  Layer,
  TriggerType,
} from "../../../../shared/types/remapConfig";
import type { KeyboardLayout, LayoutType } from "../../types";
import { Icon } from "../atoms/Icon";
import { LayerTabs } from "../molecules/LayerTabs";
import { LayoutToggle } from "../molecules/LayoutToggle";
import { TriggerSelector } from "../molecules/TriggerSelector";
import { Row } from "../template/Flex";
import { KeyboardGrid } from "./KeyboardGrid";

interface KeyRemapSectionProps {
  layers: Layer[];
  layerId: string;
  layout: LayoutType;
  keyboardLayout: KeyboardLayout;
  bindings: Record<number, KeyBinding[]>;
  isBaseLayer: boolean;
  selectedTrigger: TriggerType;
  onLayerChange: (layerId: string) => void;
  onAddLayer: (layerId: string) => void;
  onRemoveLayer: (layerId: string) => void;
  onLayoutToggle: () => void;
  onKeyClick: (vk: number) => void;
  onTriggerChange: (trigger: TriggerType) => void;
}

export function KeyRemapSection({
  layers,
  layerId,
  layout,
  keyboardLayout,
  bindings,
  isBaseLayer,
  selectedTrigger,
  onLayerChange,
  onAddLayer,
  onRemoveLayer,
  onLayoutToggle,
  onKeyClick,
  onTriggerChange,
}: KeyRemapSectionProps) {
  return (
    <section className="space-y-4">
      <Row className="justify-between gap-4">
        <LayerTabs
          activeLayerId={layerId}
          layers={layers}
          onAddLayer={onAddLayer}
          onLayerChange={onLayerChange}
          onRemoveLayer={onRemoveLayer}
        />
        <TriggerSelector
          onTriggerChange={onTriggerChange}
          selectedTrigger={selectedTrigger}
          size="compact"
        />
      </Row>

      <div className="overflow-x-auto">
        <KeyboardGrid
          bindings={bindings}
          isBaseLayer={isBaseLayer}
          keyboardLayout={keyboardLayout}
          onKeyClick={onKeyClick}
          selectedTrigger={selectedTrigger}
        />
      </div>
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-semibold text-lg">
          <Icon className="opacity-70" icon={Settings} />
          Keyboard Layout: {layout}
        </h2>
        <LayoutToggle currentLayout={layout} onToggle={onLayoutToggle} />
      </div>
    </section>
  );
}

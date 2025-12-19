import { Settings, Zap } from "lucide-react";
import type {
  KeyBinding,
  Layer,
  TriggerType,
} from "../../../../shared/types/remapConfig";
import type { KeyboardLayout, LayoutType } from "../../types";
import { cn } from "../../utils/cn";
import { Button } from "../atoms/Button";
import { Icon } from "../atoms/Icon";
import { LayerTabs } from "../molecules/LayerTabs";
import { LayoutToggle } from "../molecules/LayoutToggle";
import { TriggerTabs } from "../molecules/TriggerTabs";
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
  isQuickEditMode: boolean;
  quickEditingKey: number | null;
  onLayerChange: (layerId: string) => void;
  onAddLayer: (layerId: string) => void;
  onRemoveLayer: (layerId: string) => void;
  onLayoutToggle: () => void;
  onKeyClick: (vk: number) => void;
  onTriggerChange: (trigger: TriggerType) => void;
  onToggleQuickEditMode: () => void;
}

export function KeyRemapSection({
  layers,
  layerId,
  layout,
  keyboardLayout,
  bindings,
  isBaseLayer,
  selectedTrigger,
  isQuickEditMode,
  quickEditingKey,
  onLayerChange,
  onAddLayer,
  onRemoveLayer,
  onLayoutToggle,
  onKeyClick,
  onTriggerChange,
  onToggleQuickEditMode,
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
        <Row className="gap-2">
          <TriggerTabs
            onTriggerChange={onTriggerChange}
            selectedTrigger={selectedTrigger}
            size="compact"
          />
          <Button
            className={cn(
              "gap-1",
              isQuickEditMode ? "bg-yellow-500 hover:bg-yellow-600" : ""
            )}
            onClick={onToggleQuickEditMode}
            size="sm"
            variant={isQuickEditMode ? "primary" : "secondary"}
          >
            <Icon icon={Zap} size="sm" />
            {isQuickEditMode ? "Quick ON" : "Quick"}
          </Button>
        </Row>
      </Row>

      <div className="overflow-x-auto">
        <KeyboardGrid
          bindings={bindings}
          isBaseLayer={isBaseLayer}
          keyboardLayout={keyboardLayout}
          layout={layout}
          onKeyClick={onKeyClick}
          quickEditingKey={quickEditingKey}
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

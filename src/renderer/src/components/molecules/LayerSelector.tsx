import { Layers } from "lucide-react";
import type { Layer } from "../../../../shared/types/remapConfig";
import { Icon } from "../atoms/Icon";
import { Select } from "../atoms/Select";
import { Show } from "../control/Show";

interface LayerSelectorProps {
  layers: Pick<Layer, "id">[];
  selectedLayerId: string;
  onLayerChange: (layerId: string) => void;
  description?: string;
}

export function LayerSelector({
  layers,
  selectedLayerId,
  onLayerChange,
  description,
}: LayerSelectorProps) {
  return (
    <>
      <Select
        id="selectLayer"
        label={
          <>
            <Icon icon={Layers} size="sm" />
            対象レイヤー
          </>
        }
        label-className="flex items-center gap-1 font-medium text-muted-foreground text-xs"
        options={layers.map((layer) => ({
          id: layer.id,
          value: layer.id,
          label: layer.id,
        }))}
        onValueChange={(e) => onLayerChange(e)}
        select-value={selectedLayerId}
      />
      <Show condition={Boolean(description)}>
        <p className="text-muted-foreground text-xs">{description}</p>
      </Show>
    </>
  );
}

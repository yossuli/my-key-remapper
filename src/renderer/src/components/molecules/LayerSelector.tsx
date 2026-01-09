import { Layers } from "lucide-react";
import type { Layer } from "../../../../shared/types/remapConfig";
import { Icon } from "../atoms/Icon";
import { Select } from "../atoms/Select";
import { Show } from "../control/Show";
import { VStack } from "../template/Flex";

interface LayerSelectorProps {
  layers: Pick<Layer, "id">[];
  selectedLayerId: string;
  onLayerChange: (layerId: string) => void;
  description?: string;
  className?: string;
}

export function LayerSelector({
  layers,
  selectedLayerId,
  onLayerChange,
  description,
  className,
}: LayerSelectorProps) {
  return (
    <VStack className={className} gap={2}>
      <Select
        id="selectLayer"
        label={
          <>
            <Icon icon={Layers} />
            対象レイヤー
          </>
        }
        label-className="flex items-center gap-1 font-medium text-muted-foreground text-xs"
        onValueChange={(e) => onLayerChange(e)}
        options={layers.map((layer) => ({
          id: layer.id,
          value: layer.id,
          label: layer.id,
        }))}
        select-value={selectedLayerId}
      />
      <Show condition={Boolean(description)}>
        <p className="text-muted-foreground text-xs">{description}</p>
      </Show>
    </VStack>
  );
}

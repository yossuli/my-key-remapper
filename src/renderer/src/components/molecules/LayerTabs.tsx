import type { Layer } from "../../../../shared/types/remapConfig";
import { Button } from "../atoms/Button";
import { Mapped } from "../control/Mapped";

interface LayerTabsProps {
  layers: Layer[];
  activeLayerId: string;
  onLayerChange: (layerId: string) => void;
}

export function LayerTabs({
  layers,
  activeLayerId,
  onLayerChange,
}: LayerTabsProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground text-sm">Layer:</span>
      <Mapped
        className="flex gap-1 rounded-lg border bg-muted/30 p-1"
        Tag="div"
        value={layers}
      >
        {({ id }) => (
          <Button
            onClick={() => onLayerChange(id)}
            size="sm"
            variant={activeLayerId === id ? "primary" : "ghost"}
          >
            {id.charAt(0).toUpperCase() + id.slice(1)}
          </Button>
        )}
      </Mapped>
    </div>
  );
}

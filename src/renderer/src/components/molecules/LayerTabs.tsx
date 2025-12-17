import { Plus, X } from "lucide-react";
import { useState } from "react";
import type { Layer } from "../../../../shared/types/remapConfig";
import { Button } from "../atoms/Button";
import { Icon } from "../atoms/Icon";
import { Mapped } from "../control/Mapped";

interface LayerTabsProps {
  layers: Layer[];
  activeLayerId: string;
  onLayerChange: (layerId: string) => void;
  onAddLayer: (layerId: string) => void;
  onRemoveLayer: (layerId: string) => void;
}

export function LayerTabs({
  layers,
  activeLayerId,
  onLayerChange,
  onAddLayer,
  onRemoveLayer,
}: LayerTabsProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newLayerName, setNewLayerName] = useState("");

  const handleAdd = () => {
    if (newLayerName.trim()) {
      onAddLayer(newLayerName.trim());
      setNewLayerName("");
      setIsAdding(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAdd();
    } else if (e.key === "Escape") {
      setIsAdding(false);
      setNewLayerName("");
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground text-sm">Layer:</span>
      <Mapped
        className="flex gap-1 rounded-lg border bg-muted/30 p-1"
        Tag="div"
        value={layers}
      >
        {({ id }) => (
          <div className="group relative" key={id}>
            <Button
              onClick={() => onLayerChange(id)}
              size="sm"
              variant={activeLayerId === id ? "primary" : "ghost"}
            >
              {id.charAt(0).toUpperCase() + id.slice(1)}
            </Button>
            {id !== "base" && (
              <button
                className="-top-1 -right-1 absolute hidden rounded-full bg-destructive p-0.5 text-destructive-foreground group-hover:block"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveLayer(id);
                }}
                type="button"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        )}
      </Mapped>

      {isAdding ? (
        <input
          autoFocus
          className="w-24 rounded border bg-background px-2 py-1 text-sm"
          onBlur={() => {
            if (!newLayerName.trim()) {
              setIsAdding(false);
            }
          }}
          onChange={(e) => setNewLayerName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="レイヤー名"
          type="text"
          value={newLayerName}
        />
      ) : (
        <Button onClick={() => setIsAdding(true)} size="sm" variant="ghost">
          <Icon icon={Plus} size="sm" />
        </Button>
      )}
    </div>
  );
}

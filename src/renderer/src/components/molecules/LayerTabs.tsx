import { Reorder } from "framer-motion";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Layer } from "../../../../shared/types/remapConfig";
import { Button } from "../atoms/Button";
import { Icon } from "../atoms/Icon";
import { Input } from "../atoms/Input";
import { WithRemoveBadge } from "../atoms/RemoveBadge";
import { Else, Ternary, Then } from "../control/Ternary";
import { ConfirmModal } from "./ConfirmModal";

interface LayerTabsProps {
  layers: Layer[];
  activeLayerId: string;
  onLayerChange: (layerId: string) => void;
  onAddLayer: (layerId: string) => void;
  onRemoveLayer: (layerId: string) => void;
  onReorder: (newOrder: string[]) => void;
}

export function LayerTabs({
  layers,
  activeLayerId,
  onLayerChange,
  onAddLayer,
  onRemoveLayer,
  onReorder,
}: LayerTabsProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newLayerName, setNewLayerName] = useState("");
  const [layerToRemove, setLayerToRemove] = useState<string | null>(null);

  const orderedLayerIds = useMemo(() => layers.map((l) => l.id), [layers]);

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

  const handleRemoveClick = (layerId: string) => {
    setLayerToRemove(layerId);
  };

  const handleConfirmRemove = () => {
    if (layerToRemove) {
      onRemoveLayer(layerToRemove);
      setLayerToRemove(null);
    }
  };

  const handleCancelRemove = () => {
    setLayerToRemove(null);
  };

  return (
    <>
      <Tabs onValueChange={onLayerChange} value={activeLayerId}>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">Layer:</span>

          <TabsList className="h-auto bg-muted/30 p-1">
            <Reorder.Group
              as="div"
              axis="x"
              className="flex items-center gap-1"
              onReorder={onReorder}
              values={orderedLayerIds}
            >
              {orderedLayerIds.map((id) => (
                <Reorder.Item as="div" key={id} value={id}>
                  <WithRemoveBadge onRemove={() => handleRemoveClick(id)}>
                    <TabsTrigger
                      className="data-[state=active]:bg-background"
                      value={id}
                    >
                      {id.charAt(0).toUpperCase() + id.slice(1)}
                    </TabsTrigger>
                  </WithRemoveBadge>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          </TabsList>

          <Ternary condition={isAdding}>
            <Then>
              <Input
                id="new-layer-input"
                input-autoFocus
                input-className="h-8 w-24 text-sm"
                input-onBlur={() => {
                  if (!newLayerName.trim()) {
                    setIsAdding(false);
                  }
                }}
                input-onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNewLayerName(e.target.value)
                }
                input-onKeyDown={handleKeyDown}
                input-placeholder="レイヤー名"
                input-value={newLayerName}
              />
            </Then>
            <Else>
              <Button
                onClick={() => setIsAdding(true)}
                size="sm"
                variant="ghost"
              >
                <Icon icon={Plus} />
              </Button>
            </Else>
          </Ternary>
        </div>
      </Tabs>
      <ConfirmModal
        confirmLabel="削除"
        isOpen={layerToRemove !== null}
        message={
          <>
            レイヤー「<strong>{layerToRemove}</strong>」を削除しますか？
            <br />
            この操作は元に戻せません。
          </>
        }
        onCancel={handleCancelRemove}
        onConfirm={handleConfirmRemove}
        title="レイヤーの削除"
      />
    </>
  );
}

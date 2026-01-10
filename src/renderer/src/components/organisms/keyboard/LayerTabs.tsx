import { Reorder } from "framer-motion";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { LayerActions, LayerState } from "../../../types/tree/roots/layer";
import { Button } from "../../atoms/Button";
import { Icon } from "../../atoms/Icon";
import { Input } from "../../atoms/Input";
import { WithRemoveBadge } from "../../atoms/RemoveBadge";
import { Else, Ternary, Then } from "../../control/Ternary";

interface LayerTabsProps {
  layerState: LayerState; // { layers, layerId }
  layerActions: LayerActions; // { setLayerId, addLayer, removeLayer, reorderLayers }
}

export function LayerTabs({ layerState, layerActions }: LayerTabsProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newLayerName, setNewLayerName] = useState("");

  const orderedLayerIds = useMemo(
    () => layerState.layers.map((l) => l.id),
    [layerState.layers]
  );

  const handleAdd = () => {
    if (newLayerName.trim()) {
      layerActions.addLayer(newLayerName.trim());
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
    // TODO: ModalLayoutを使った確認ダイアログを実装
    layerActions.removeLayer(layerId);
  };

  return (
    <>
      <Tabs onValueChange={layerActions.setLayerId} value={layerState.layerId}>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">Layer:</span>

          <TabsList className="h-auto bg-muted/30 p-1">
            <Reorder.Group
              as="div"
              axis="x"
              className="flex items-center gap-1"
              onReorder={layerActions.reorderLayers}
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
      {/* TODO: ModalLayoutを使った確認ダイアログを追加 */}
    </>
  );
}

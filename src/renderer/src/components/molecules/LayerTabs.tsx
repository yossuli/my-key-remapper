import { Plus } from "lucide-react";
import { useState } from "react";
import type { Layer } from "../../../../shared/types/remapConfig";
import { Button } from "../atoms/Button";
import { Icon } from "../atoms/Icon";
import { WithRemoveBadge } from "../atoms/RemoveBadge";
import { Mapped } from "../control/Mapped";
import { Conditional, Else, Then } from "../control/Ternary";
import { ConfirmModal } from "./ConfirmModal";

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
  // 削除確認モーダル用の状態
  const [layerToRemove, setLayerToRemove] = useState<string | null>(null);

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

  // 削除確認モーダルを開く
  const handleRemoveClick = (layerId: string) => {
    setLayerToRemove(layerId);
  };

  // 削除を確定
  const handleConfirmRemove = () => {
    if (layerToRemove) {
      onRemoveLayer(layerToRemove);
      setLayerToRemove(null);
    }
  };

  // 削除をキャンセル
  const handleCancelRemove = () => {
    setLayerToRemove(null);
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-sm">Layer:</span>
        <Mapped
          as={"div"}
          className="flex gap-1 rounded-lg border bg-muted/30 p-1"
          value={layers}
        >
          {({ id }) => (
            <Conditional condition={id !== "base"} key={id}>
              <Then>
                <WithRemoveBadge onRemove={() => handleRemoveClick(id)}>
                  <Button
                    onClick={() => onLayerChange(id)}
                    size="sm"
                    variant={activeLayerId === id ? "primary" : "ghost"}
                  >
                    {id.charAt(0).toUpperCase() + id.slice(1)}
                  </Button>
                </WithRemoveBadge>
              </Then>
              <Else>
                <Button
                  onClick={() => onLayerChange(id)}
                  size="sm"
                  variant={activeLayerId === id ? "primary" : "ghost"}
                >
                  {id.charAt(0).toUpperCase() + id.slice(1)}
                </Button>
              </Else>
            </Conditional>
          )}
        </Mapped>

        <Conditional condition={isAdding}>
          <Then>
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
          </Then>
          <Else>
            <Button onClick={() => setIsAdding(true)} size="sm" variant="ghost">
              <Icon icon={Plus} size="sm" />
            </Button>
          </Else>
        </Conditional>
      </div>
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

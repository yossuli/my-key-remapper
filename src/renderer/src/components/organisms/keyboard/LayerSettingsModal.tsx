import { useEffect, useState } from "react";
import { Button } from "@/components/atoms/Button";
import { WithRemoveBadge } from "@/components/atoms/RemoveBadge";
import { Show } from "@/components/control/Show";
import { KeyDisplay } from "@/components/molecules/display/KeyDisplay";
import { VStack } from "@/components/template/Flex";
import { ModalLayout } from "@/components/template/ModalLayout";
import { useKeyEventInput } from "@/hooks/useKeyEventInput";
import type { LayoutType } from "@/types";
import type { Layer } from "../../../../../shared/types/remapConfig";

interface LayerSettingsModalProps {
  layerId: string | null;
  layers: Layer[];
  layout: LayoutType;
  onUpdate: (layerId: string, updates: Partial<Layer>) => void;
  onClose: () => void;
}

export function LayerSettingsModal({
  layerId,
  layers,
  layout,
  onUpdate,
  onClose,
}: LayerSettingsModalProps) {
  const layer = layers.find((l) => l.id === layerId);
  const [modifiers, setModifiers] = useState({
    shift: false,
    ctrl: false,
    alt: false,
    win: false,
  });
  const [activeKeys, setActiveKeys] = useState<number[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);

  // 初期化
  useEffect(() => {
    if (layer) {
      setModifiers({
        shift: !!layer.defaultModifiers?.shift,
        ctrl: !!layer.defaultModifiers?.ctrl,
        alt: !!layer.defaultModifiers?.alt,
        win: !!layer.defaultModifiers?.win,
      });
      setActiveKeys(layer.activeKeys || []);
    }
  }, [layer]);

  // キーキャプチャ
  useKeyEventInput({
    enabled: isCapturing,
    onKeyDown: (vkCode) => {
      if (!activeKeys.includes(vkCode)) {
        const newKeys = [...activeKeys, vkCode];
        setActiveKeys(newKeys);
        onUpdate(layerId!, { activeKeys: newKeys });
      }
      setIsCapturing(false);
    },
  });

  if (!(layer && layerId)) {
    return null;
  }

  const toggleModifier = (key: keyof typeof modifiers) => {
    const newVal = !modifiers[key];
    const newModifiers = { ...modifiers, [key]: newVal };
    setModifiers(newModifiers);

    onUpdate(layerId, {
      defaultModifiers: {
        ...layer.defaultModifiers,
        [key]: newVal,
      },
    });
  };

  const removeActiveKey = (vkCode: number) => {
    const newKeys = activeKeys.filter((k) => k !== vkCode);
    setActiveKeys(newKeys);
    onUpdate(layerId, { activeKeys: newKeys });
  };

  return (
    <ModalLayout
      onClose={onClose}
      title={`Layer Settings: ${layerId}`}
      value={layerId}
    >
      {() => (
        <VStack className="w-[400px] p-4" gap={6}>
          {/* Default Modifiers Section */}
          <VStack gap={2}>
            <h3 className="font-semibold text-sm">Default Modifiers</h3>
            <div className="flex gap-4">
              {Object.keys(modifiers).map((mod) => (
                <label
                  className="flex cursor-pointer select-none items-center gap-2"
                  key={mod}
                >
                  <input
                    checked={modifiers[mod as keyof typeof modifiers]}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    onChange={() =>
                      toggleModifier(mod as keyof typeof modifiers)
                    }
                    type="checkbox"
                  />
                  <span className="text-sm capitalize">{mod}</span>
                </label>
              ))}
            </div>
          </VStack>

          {/* Active Keys Section */}
          <VStack gap={2}>
            <h3 className="font-semibold text-sm">Active Keys (Held)</h3>
            <div className="flex min-h-[40px] flex-wrap gap-2 rounded-md border bg-muted/20 p-2">
              {activeKeys.map((vk) => (
                <WithRemoveBadge key={vk} onRemove={() => removeActiveKey(vk)}>
                  <KeyDisplay layout={layout} size="sm" vkCode={vk} />
                </WithRemoveBadge>
              ))}
              <Show condition={activeKeys.length === 0 && !isCapturing}>
                <div className="self-center text-muted-foreground text-xs">
                  No active keys
                </div>
              </Show>
              <Show condition={isCapturing}>
                <div className="animate-pulse self-center font-bold text-primary text-xs">
                  Press any key...
                </div>
              </Show>
            </div>
            <Button
              label={isCapturing ? "Cancel" : "Add Key"}
              onClick={() => setIsCapturing(!isCapturing)}
              size="sm"
              variant={isCapturing ? "default" : "secondary"}
            />
          </VStack>
        </VStack>
      )}
    </ModalLayout>
  );
}

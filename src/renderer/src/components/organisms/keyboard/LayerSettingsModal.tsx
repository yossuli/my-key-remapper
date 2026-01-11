import { useEffect, useState } from "react";
import { KeyRemapList } from "@/components/molecules/forms/KeyRemapList";
import { VStack } from "@/components/template/Flex";
import { ModalLayout } from "@/components/template/ModalLayout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
  const [isActiveKeysOpen, setIsActiveKeysOpen] = useState(false);

  const [modifiers, setModifiers] = useState({
    shift: false,
    ctrl: false,
    alt: false,
    win: false,
  });

  // 初期化
  useEffect(() => {
    if (layer) {
      setModifiers({
        shift: !!layer.defaultModifiers?.shift,
        ctrl: !!layer.defaultModifiers?.ctrl,
        alt: !!layer.defaultModifiers?.alt,
        win: !!layer.defaultModifiers?.win,
      });
    }
  }, [layer]);

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

  const handleUpdateActiveKeys = (newKeys: number[]) => {
    if (layerId) {
      onUpdate(layerId, { activeKeys: newKeys });
    }
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
          <Accordion
            collapsible
            onValueChange={(val) => setIsActiveKeysOpen(val === "active-keys")}
            type="single"
          >
            <AccordionItem className="border-none" value="active-keys">
              <AccordionTrigger className="py-2 font-semibold text-sm hover:no-underline">
                Active Keys (Held)
              </AccordionTrigger>
              <AccordionContent>
                <KeyRemapList
                  initialKeys={layer.activeKeys ?? []}
                  isCaptureEnabled={isActiveKeysOpen}
                  layout={layout}
                  onClear={() => handleUpdateActiveKeys([])}
                  onKeysChange={handleUpdateActiveKeys}
                  requireExplicitAdd
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </VStack>
      )}
    </ModalLayout>
  );
}

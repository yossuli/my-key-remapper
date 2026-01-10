import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/atoms/Button";
import { Icon } from "@/components/atoms/Icon";
import { Input } from "@/components/atoms/Input";
import { WithRemoveBadge } from "@/components/atoms/RemoveBadge";
import { HandleEmpty } from "@/components/control/HandleEmpty";
import { KeyDisplay } from "@/components/molecules/display/KeyDisplay";
import { VStack } from "@/components/template/Flex";
import { ModalLayout } from "@/components/template/ModalLayout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useKeyEventInput } from "@/hooks/useKeyEventInput";
import type { LayoutType } from "@/types";
import { MAX_VK_CODE, MIN_VK_CODE } from "../../../../../shared/constants/vk";
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
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [showVkInput, setShowVkInput] = useState(false);
  const [vkInputValue, setVkInputValue] = useState("");
  const [isActiveKeysOpen, setIsActiveKeysOpen] = useState(false);

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
    enabled: isActiveKeysOpen && !isInputFocused,
    onKeyDown: (vkCode) => {
      if (!layerId) {
        return;
      }
      if (!activeKeys.includes(vkCode)) {
        const newKeys = [...activeKeys, vkCode];
        setActiveKeys(newKeys);
        onUpdate(layerId, { activeKeys: newKeys });
      }
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

  const handleAddVk = (vkStr: string) => {
    if (!layerId) {
      return;
    }
    const val = Number.parseInt(vkStr, 10);
    if (!Number.isNaN(val) && val >= MIN_VK_CODE && val <= MAX_VK_CODE) {
      if (!activeKeys.includes(val)) {
        const newKeys = [...activeKeys, val];
        setActiveKeys(newKeys);
        onUpdate(layerId, { activeKeys: newKeys });
      }
      setVkInputValue("");
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
                <VStack gap={2}>
                  <div className="flex flex-wrap justify-center gap-2">
                    <HandleEmpty
                      array={activeKeys.map((vk) => ({ id: vk }))}
                      empty={
                        <span className="rounded-md border border-muted-foreground border-dashed px-4 py-2 text-muted-foreground text-sm">
                          {showVkInput
                            ? "数値を入力して追加"
                            : "キーを長押して選択"}
                        </span>
                      }
                    >
                      {({ id: vk }) => (
                        <WithRemoveBadge
                          key={vk}
                          onRemove={() => removeActiveKey(vk)}
                        >
                          <KeyDisplay
                            layout={layout}
                            variant="primary"
                            vkCode={vk}
                          />
                        </WithRemoveBadge>
                      )}
                    </HandleEmpty>
                  </div>
                  　
                  <Accordion
                    collapsible
                    onValueChange={(val) => setShowVkInput(val === "vk-input")}
                    type="single"
                  >
                    <AccordionItem className="border-none" value="vk-input">
                      <AccordionTrigger className="justify-center text-muted-foreground text-xs hover:no-underline">
                        VKコードで直接指定
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="flex items-center justify-center gap-1">
                          <Input
                            id="vk-direct-input"
                            input-className="w-16 font-mono text-center text-sm"
                            input-onChange={(e) =>
                              setVkInputValue(e.target.value)
                            }
                            input-onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleAddVk(vkInputValue);
                              }
                            }}
                            input-placeholder="VK"
                            input-type="number"
                            input-value={vkInputValue}
                            setFocused={setIsInputFocused}
                          />
                          <Button
                            onClick={() => handleAddVk(vkInputValue)}
                            variant="ghost"
                          >
                            <Icon icon={Plus} />
                          </Button>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </VStack>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </VStack>
      )}
    </ModalLayout>
  );
}

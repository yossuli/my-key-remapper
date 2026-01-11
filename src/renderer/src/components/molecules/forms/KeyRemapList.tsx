import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/atoms/Button";
import { Icon } from "@/components/atoms/Icon";
import { Input } from "@/components/atoms/Input";
import { WithRemoveBadge } from "@/components/atoms/RemoveBadge";
import { HandleEmpty } from "@/components/control/HandleEmpty";
import { KeyDisplay } from "@/components/molecules/display/KeyDisplay";
import { HStack, VStack } from "@/components/template/Flex";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useKeyCapture } from "@/hooks/useKeyCapture";
import { useKeyEventInput } from "@/hooks/useKeyEventInput";
import type { LayoutType } from "@/types";
import { MAX_VK_CODE, MIN_VK_CODE } from "../../../../../shared/constants/vk";

export interface KeyRemapListProps {
  keys: number[];
  layout: LayoutType;
  onKeysChange: (keys: number[]) => void;
  isCaptureEnabled?: boolean;
  onClear?: () => void;
  onInputFocusChange?: (isFocused: boolean) => void;
  isRemoveDisabled?: (vkCode: number) => boolean;
  emptyLabel?: string;
  className?: string;
}

/**
 * キーのリスト表示、数値入力、およびグローバルキャプチャを統合した Smart Component
 */
export function KeyRemapList({
  keys,
  layout,
  onKeysChange,
  isCaptureEnabled = false,
  onClear,
  onInputFocusChange,
  isRemoveDisabled,
  emptyLabel,
  className,
}: KeyRemapListProps) {
  const [showVkInput, setShowVkInput] = useState(false);
  const [vkInputValue, setVkInputValue] = useState("");
  const [isInputFocused, setIsInputFocused] = useState(false);

  // 内部でキャプチャロジックを管理
  const { onKeyDown, onKeyUp, addKey, removeKey } = useKeyCapture({
    initialKeys: keys,
    onKeysChange,
  });

  // グローバルイベントの監視も内包（数値入力中は停止する）
  useKeyEventInput({
    enabled: isCaptureEnabled && !isInputFocused,
    onKeyDown,
    onKeyUp,
  });

  const handleVkInputConfirm = () => {
    const vk = Number.parseInt(vkInputValue, 10);
    if (!Number.isNaN(vk) && vk >= MIN_VK_CODE && vk <= MAX_VK_CODE) {
      addKey(vk);
      setVkInputValue("");
    }
  };

  const handleInputFocus = (focused: boolean) => {
    setIsInputFocused(focused);
    onInputFocusChange?.(focused);
  };

  return (
    <VStack className={className} gap={2}>
      {/* 1. キーリスト表示 & クリアボタン */}
      <HStack className="flex-wrap justify-center font-bold text-xl" gap={4}>
        <HandleEmpty
          array={keys.map((vk) => ({ id: vk }))}
          empty={
            <span className="rounded-md border border-muted-foreground border-dashed px-4 py-2 text-muted-foreground text-sm">
              {showVkInput
                ? "数値を入力して追加"
                : emptyLabel || (isCaptureEnabled ? "キーを長押して選択" : "")}
            </span>
          }
        >
          {({ id: vk }) => (
            <WithRemoveBadge
              disabled={isRemoveDisabled?.(vk) || keys.length === 1}
              onRemove={() => removeKey(vk)}
            >
              <KeyDisplay layout={layout} variant="primary" vkCode={vk} />
            </WithRemoveBadge>
          )}
        </HandleEmpty>
        {onClear && keys.length > 0 && (
          <Button label="クリア" onClick={onClear} variant="ghost" />
        )}
      </HStack>

      {/* 2. VKコード直接入力 (Accordion) */}
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
                input-onChange={(e) => setVkInputValue(e.target.value)}
                input-onKeyDown={(e) =>
                  e.key === "Enter" && handleVkInputConfirm()
                }
                input-placeholder="VK"
                input-type="number"
                input-value={vkInputValue}
                setFocused={handleInputFocus}
              />
              <Button onClick={handleVkInputConfirm} variant="ghost">
                <Icon icon={Plus} />
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </VStack>
  );
}

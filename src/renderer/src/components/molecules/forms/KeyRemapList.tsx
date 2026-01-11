import { Check, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/atoms/Button";
import { Icon } from "@/components/atoms/Icon";
import { HStack, VStack } from "@/components/template/Flex";
import { useKeyCapture } from "@/hooks/useKeyCapture";
import { useKeyEventInput } from "@/hooks/useKeyEventInput";
import type { LayoutType } from "@/types";
import { KeyRemapItems } from "./KeyRemapItems";
import { VkDirectInput } from "./VkDirectInput";

export interface KeyRemapListProps {
  initialKeys: number[];
  layout: LayoutType;
  onKeysChange: (keys: number[]) => void;
  isCaptureEnabled?: boolean;
  onClear?: () => void;
  onInputFocusChange?: (isFocused: boolean) => void;
  isRemoveDisabled?: (vkCode: number) => boolean;
  className?: string;
  requireExplicitAdd?: boolean;
  ignoredKeys?: number[];
}

/**
 * キーのリスト表示、数値入力、およびグローバルキャプチャを統合した Smart Component
 */
export function KeyRemapList({
  initialKeys,
  layout,
  onKeysChange,
  isCaptureEnabled = false,
  onClear,
  onInputFocusChange,
  isRemoveDisabled,
  className,
  requireExplicitAdd = false,
  ignoredKeys = [],
}: KeyRemapListProps) {
  const [showVkInput, setShowVkInput] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  const isCaptureActive =
    isCaptureEnabled && (!requireExplicitAdd || isCapturing);

  // 内部でキャプチャロジックを管理
  const { keys, addKey, removeKey, onKeyDown, onKeyUp } = useKeyCapture({
    initialKeys,
    onKeysChange,
  });

  // グローバルイベントの監視も内包（数値入力中は停止する）
  useKeyEventInput({
    enabled: isCaptureActive && !isInputFocused,
    onKeyDown: (vkCode) => {
      if (ignoredKeys.includes(vkCode)) {
        return;
      }
      onKeyDown(vkCode);
    },
    onKeyUp,
  });

  const handleInputFocus = (focused: boolean) => {
    setIsInputFocused(focused);
    onInputFocusChange?.(focused);
  };

  return (
    <VStack className={className} gap={2}>
      <HStack className="flex-wrap justify-center font-bold text-xl" gap={4}>
        <KeyRemapItems
          isRemoveDisabled={isRemoveDisabled}
          keys={keys}
          layout={layout}
          onRemoveKey={removeKey}
          showVkInput={showVkInput}
        />

        {!!requireExplicitAdd && (
          <Button
            className={isCapturing ? "animate-pulse gap-2" : "gap-2"}
            onClick={() => setIsCapturing(!isCapturing)}
            variant={isCapturing ? "default" : "outline"}
          >
            {isCapturing ? <Icon icon={Check} /> : <Icon icon={Plus} />}
            {isCapturing ? "完了" : "追加"}
          </Button>
        )}

        {keys.length > 0 && (
          <Button label="クリア" onClick={onClear} variant="ghost" />
        )}
      </HStack>
      <VkDirectInput
        onAddKey={addKey}
        onFocusChange={handleInputFocus}
        onOpenChange={setShowVkInput}
      />
    </VStack>
  );
}

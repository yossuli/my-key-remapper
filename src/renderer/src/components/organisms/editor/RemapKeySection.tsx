import { ArrowRight } from "lucide-react";
import { Icon } from "@/components/atoms/Icon";
import { KeyDisplay } from "@/components/molecules/display/KeyDisplay";
import { KeyRemapList } from "@/components/molecules/forms/KeyRemapList";
import { HStack, VStack } from "@/components/template/Flex";
import type { UseKeyEditorActionsReturn } from "@/hooks/useKeyEditorAction";
import type { LayoutType } from "@/types";
import type { KeyEditorUIHandlers } from "./KeyEditorForm";

interface RemapKeySectionProps {
  targetVk: number;
  layout: LayoutType;

  keyEditorActions: UseKeyEditorActionsReturn;
  keyEditorUIHandlers: KeyEditorUIHandlers;
}

export function RemapKeySection({
  targetVk,
  layout,
  keyEditorActions,
  keyEditorUIHandlers,
}: RemapKeySectionProps) {
  const { keys, setKeys, reset } = keyEditorActions;

  return (
    <VStack gap={4}>
      <HStack className="justify-center font-bold text-xl" gap={4}>
        <KeyDisplay layout={layout} vkCode={targetVk} />
        <Icon icon={ArrowRight} size="md" />
        <KeyRemapList
          isCaptureEnabled={true}
          isRemoveDisabled={() => keys.length === 1}
          keys={keys}
          layout={layout}
          onClear={reset}
          onInputFocusChange={keyEditorUIHandlers.setIsInputFocused}
          onKeysChange={setKeys}
        />
      </HStack>
    </VStack>
  );
}

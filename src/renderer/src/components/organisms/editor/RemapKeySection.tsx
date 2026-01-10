import { ArrowRight, Plus } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { MAX_VK_CODE, MIN_VK_CODE } from "../../../../../shared/constants/vk";
import type { LayoutType } from "../../../types";
import type {
  KeyEditorUIActions,
  KeyEditorUIHandlers,
  KeyEditorUIState,
} from "../../../types/tree/branches";
import { Button } from "../../atoms/Button";
import { Icon } from "../../atoms/Icon";
import { Input } from "../../atoms/Input";
import { WithRemoveBadge } from "../../atoms/RemoveBadge";
import { HandleEmpty } from "../../control/HandleEmpty";
import { Show } from "../../control/Show";
import { KeyDisplay } from "../../molecules/display/KeyDisplay";
import { HStack } from "../../template/Flex";

interface RemapKeySectionProps {
  targetVk: number;
  layout: LayoutType;
  newTargetKeys: number[];

  keyEditorState: KeyEditorUIState;
  keyEditorActions: KeyEditorUIActions;
  keyEditorUIHandlers: KeyEditorUIHandlers;
}

export function RemapKeySection({
  targetVk,
  layout,
  newTargetKeys,
  keyEditorState,
  keyEditorActions,
  keyEditorUIHandlers,
}: RemapKeySectionProps) {
  const handleVkInputConfirm = () => {
    const vk = Number.parseInt(keyEditorState.vkInputValue, 10);
    if (!Number.isNaN(vk) && vk >= MIN_VK_CODE && vk <= MAX_VK_CODE) {
      keyEditorActions.addHoldKey(vk);
      keyEditorUIHandlers.setVkInputValue("");
    }
  };

  return (
    <>
      <HStack className="flex-wrap justify-center font-bold text-xl" gap={4}>
        <KeyDisplay layout={layout} vkCode={targetVk} />
        <Icon icon={ArrowRight} size="md" />
        <HandleEmpty
          array={newTargetKeys.map((vk) => ({ id: vk }))}
          empty={
            <span className="rounded-md border border-muted-foreground border-dashed px-4 py-2 text-muted-foreground text-sm">
              {keyEditorState.showVkInput
                ? "数値を入力して追加"
                : "キーを長押して選択"}
            </span>
          }
        >
          {({ id: vk }) => (
            <WithRemoveBadge
              disabled={newTargetKeys.length === 1}
              onRemove={() => keyEditorActions.removeKey(vk)}
            >
              <KeyDisplay layout={layout} variant="primary" vkCode={vk} />
            </WithRemoveBadge>
          )}
        </HandleEmpty>
        <Show condition={newTargetKeys.length > 0}>
          <Button
            label="クリア"
            onClick={() => {
              keyEditorActions.resetState();
              keyEditorActions.clearTargetKeys();
            }}
            variant="ghost"
          />
        </Show>
      </HStack>

      <Accordion
        collapsible
        onValueChange={(val) =>
          keyEditorUIHandlers.setShowVkInput(val === "vk-input")
        }
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
                  keyEditorUIHandlers.setVkInputValue(e.target.value)
                }
                input-onKeyDown={(e) =>
                  e.key === "Enter" && handleVkInputConfirm()
                }
                input-placeholder="VK"
                input-type="number"
                input-value={keyEditorState.vkInputValue}
                setFocused={keyEditorUIHandlers.setIsInputFocused}
              />
              <Button onClick={handleVkInputConfirm} variant="ghost">
                <Icon icon={Plus} />
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </>
  );
}

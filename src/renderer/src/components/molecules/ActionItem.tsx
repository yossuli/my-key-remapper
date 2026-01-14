import type { Action } from "@shared/types/remapConfig";
import { objectiveDiscriminantSwitch } from "@shared/utils/objectiveSwitch";
import { useDragControls } from "framer-motion";
import { GripVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Icon } from "@/components/atoms/Icon";
import { ListCellButton } from "@/components/atoms/ListCellButton";
import { RichText } from "@/components/atoms/RichText";
import { HStack } from "@/components/template/Flex";
import { useMacros } from "@/hooks/useMacros";
import type { ActionSummaryHandlers } from "../organisms/macro/types";

interface ActionItemProps {
  action: Action;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  actionSummaryHandlers: ActionSummaryHandlers;
}

export function ActionItem({
  action,
  index,
  onEdit,
  onDelete,
  actionSummaryHandlers,
}: ActionItemProps) {
  const controls = useDragControls();
  const { macros } = useMacros();
  const { onNavigate } = actionSummaryHandlers;

  const summaryContent = objectiveDiscriminantSwitch<
    Action,
    "type",
    React.ReactNode
  >(
    {
      remap: (a) =>
        `キー入力: **${a.keys.join(" + ")}**${a.repeat ? " ((リピート))" : ""}`,
      delay: (a) => `待機: **${a.delayMs}ms**`,
      mouseMove: (a) => `マウス移動: **X:${a.x}, Y:${a.y}**`,
      mouseClick: (a) =>
        `クリック: **${a.button}**${
          (a.clickCount ?? 1) > 1 ? ` ((x${a.clickCount}))` : ""
        }`,
      layerToggle: (a) => `レイヤー切替: [[${a.layerId}]]`,
      layerMomentary: (a) => `レイヤーホールド: [[${a.layerId}]]`,
      macro: (a) => {
        const macroName = macros.find((m) => m.id === a.macroId)?.name;
        const displayText = `${macroName ?? a.macroId}`;

        return (
          <span>
            マクロ実行:
            <button
              className="ml-1 inline-flex items-center rounded-sm px-1 font-mono text-blue-400 hover:bg-blue-400/10 hover:underline"
              onClick={(e) => {
                e.stopPropagation();
                onNavigate(a.macroId);
              }}
              type="button"
            >
              {displayText}
            </button>
          </span>
        );
      },
      cursorReturn: (a) => `カーソル復帰: ((遅延 ${a.delayMs}ms))`,
      none: () => "((なし))",
    },
    action,
    "type"
  );

  return (
    <HStack className="w-full items-center justify-between">
      <div
        className="cursor-grab touch-none rounded p-1 hover:bg-muted"
        onPointerDown={(e) => controls.start(e)}
      >
        <Icon className="text-muted-foreground" icon={GripVertical} size="sm" />
      </div>

      <ListCellButton
        className="flex-1 px-2 py-2 font-mono text-sm"
        onClick={onEdit}
      >
        <span className="text-muted-foreground">{index + 1}.</span>
        {typeof summaryContent === "string" ? (
          <RichText text={summaryContent} />
        ) : (
          summaryContent
        )}
      </ListCellButton>

      <HStack gap={1}>
        <Button
          className="text-destructive hover:bg-destructive/10"
          onClick={onDelete}
          size="icon"
          variant="ghost"
        >
          <Icon icon={Trash2} size="sm" />
        </Button>
      </HStack>
    </HStack>
  );
}

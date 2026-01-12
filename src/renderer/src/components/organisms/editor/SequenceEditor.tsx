import type { Action } from "@shared/types/remapConfig";
import { objectiveDiscriminantSwitch } from "@shared/utils/objectiveSwitch";
import { Reorder, useDragControls } from "framer-motion";
import { GripVertical, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Icon } from "@/components/atoms/Icon";
import { HStack } from "@/components/template/Flex";
import type { IdentifiedAction } from "../macro/types";

interface SequenceEditorProps {
  // 並び替えのために一意なIDが必要なので IdentifiedAction を受け取る
  actions: IdentifiedAction[];
  onChange: (newActions: IdentifiedAction[]) => void;
  onEditAction: (index: number) => void;
  onDeleteAction: (index: number) => void;
}

export function SequenceEditor({
  actions,
  onChange,
  onEditAction,
  onDeleteAction,
}: SequenceEditorProps) {
  return (
    <Reorder.Group
      axis="y"
      className="flex w-full flex-col gap-2"
      onReorder={onChange}
      values={actions}
    >
      {actions.map((action, index) => (
        <Reorder.Item
          className="flex select-none items-center gap-3 rounded-md border border-border bg-secondary/30 p-2"
          key={action._uiId} // インデックスではなく不変のIDを使用
          value={action}
        >
          <ActionItem
            action={action}
            index={index}
            onDelete={() => onDeleteAction(index)}
            onEdit={() => onEditAction(index)}
          />
        </Reorder.Item>
      ))}
    </Reorder.Group>
  );
}

interface ActionItemProps {
  action: Action;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}

function ActionItem({ action, index, onEdit, onDelete }: ActionItemProps) {
  const controls = useDragControls();

  return (
    <HStack className="w-full items-center justify-between">
      <div
        className="cursor-grab touch-none rounded p-1 hover:bg-muted"
        onPointerDown={(e) => controls.start(e)}
      >
        <Icon className="text-muted-foreground" icon={GripVertical} size="sm" />
      </div>

      <div className="flex-1 truncate px-2 font-mono text-sm">
        <span className="mr-2 text-muted-foreground">{index + 1}.</span>
        <ActionSummary action={action} />
      </div>

      <HStack gap={1}>
        <Button onClick={onEdit} size="icon" variant="ghost">
          <Icon icon={Pencil} size="sm" />
        </Button>
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

// --- Action Summary Rendering System ---

/**
 * 簡易的なマークダウン記法パーサー
 * **text**: 太字 + プライマリーカラー
 * ((text)): 補足情報（薄い文字）
 * [[text]]: リンク/ID（青文字）
 */
function RichText({ text }: { text: string }) {
  const parts = text.split(/(\*\*.*?\*\*|\(\(.*\)\)|\[\[.*\]\])/g);
  return (
    <span>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: テキスト解析による生成で順序が固定されているため
            <span className="font-bold text-primary" key={i}>
              {part.slice(2, -2)}
            </span>
          );
        }
        if (part.startsWith("((") && part.endsWith("))")) {
          return (
            <span
              className="ml-2 text-muted-foreground text-xs opacity-80"
              // biome-ignore lint/suspicious/noArrayIndexKey: テキスト解析による生成で順序が固定されているため
              key={i}
            >
              {part.slice(2, -2)}
            </span>
          );
        }
        if (part.startsWith("[[") && part.endsWith("]]")) {
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: テキスト解析による生成で順序が固定されているため
            <span className="font-mono text-blue-400" key={i}>
              {part.slice(2, -2)}
            </span>
          );
        }
        return part;
      })}
    </span>
  );
}

/**
 * アクションごとの説明文生成ロジックマップ
 * オブジェクトとして定義することで、Switch文の複雑さを排除
 */

function ActionSummary({ action }: { action: Action }) {
  const formatter = objectiveDiscriminantSwitch<Action, "type", string>(
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
      macro: (a) => `マクロ実行: [[${a.macroId}]]`,
      cursorReturn: (a) => `カーソル復帰: ((遅延 ${a.delayMs}ms))`,
      none: () => "((なし))",
    },
    action,
    "type"
  );
  const text = formatter ?? "((Unknown Action))";
  return <RichText text={text} />;
}

import type { MacroDef } from "@shared/types/remapConfig";
import { Copy, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { DataGrid } from "@/components/atoms/DataGrid";
import { Icon } from "@/components/atoms/Icon";
import { HStack, VStack } from "@/components/template/Flex";

interface MacroListProps {
  macros: MacroDef[];
  onAdd: () => void;
  onEdit: (macroId: string) => void;
  onDelete: (macroId: string) => void;
  onDuplicate: (macroId: string) => void;
}

export function MacroList({
  macros,
  onAdd,
  onEdit,
  onDelete,
  onDuplicate,
}: MacroListProps) {
  if (macros.length === 0) {
    return (
      <VStack
        className="items-center justify-center rounded-lg border border-border border-dashed p-8 text-muted-foreground"
        gap={4}
      >
        <p>マクロはまだ作成されていません</p>
        <Button onClick={onAdd} variant="default">
          <Icon className="mr-2" icon={Plus} />
          新規マクロ作成
        </Button>
      </VStack>
    );
  }

  return (
    <VStack className="w-full" gap={4}>
      <HStack className="items-center justify-between">
        <h3 className="font-bold text-lg">マクロ一覧</h3>
        <Button onClick={onAdd} size="sm" variant="default">
          <Icon className="mr-1" icon={Plus} />
          新規作成
        </Button>
      </HStack>
      {/* TODO - カスタムコンポーネント化 */}
      <DataGrid
        className="grid-cols-[1fr_6rem]"
        gridCols="[1fr_6rem]"
        headers={[<div>名前</div>, <div className="text-center">操作</div>]}
        highlightOnFirstChildHover
        value={macros}
      >
        {(macro) => [
          <Button
            className="w-full justify-start justify-self-start px-4 hover:bg-transparent"
            key="name"
            onClick={() => onEdit(macro.id)}
            title={macro.name}
            variant="ghost"
          >
            {macro.name}
          </Button>,

          <HStack className="justify-end" gap={2} key="actions">
            <Button
              onClick={() => onDuplicate(macro.id)}
              size="icon"
              title="複製"
              variant="ghost"
            >
              <Icon icon={Copy} size="sm" />
            </Button>
            <Button
              className="text-destructive hover:bg-destructive/10"
              onClick={() => onDelete(macro.id)}
              size="icon"
              title="削除"
              variant="ghost"
            >
              <Icon icon={Trash2} size="sm" />
            </Button>
          </HStack>,
        ]}
      </DataGrid>
    </VStack>
  );
}

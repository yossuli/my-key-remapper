import type { MacroDef } from "@shared/types/remapConfig";
import { Copy, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/atoms/Button";
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
      <div className="grid w-full grid-cols-[1fr_6rem_8rem] overflow-hidden rounded-md border border-border bg-background">
        <div className="col-span-full grid grid-cols-subgrid items-center border-border border-b bg-muted px-4 py-3 text-muted-foreground text-xs uppercase">
          <div>名前</div>
          <div className="text-center">ステップ数</div>
          <div className="text-right">操作</div>
        </div>
        <div className="col-span-full grid grid-cols-subgrid divide-y divide-border">
          {macros.map((macro) => (
            <div
              className="col-span-full grid grid-cols-subgrid items-center px-4 py-3 transition-colors hover:bg-muted/50"
              key={macro.id}
            >
              <div className="truncate font-medium" title={macro.name}>
                {macro.name}
              </div>
              <div className="text-center text-sm">{macro.actions.length}</div>
              <div className="text-right">
                <HStack className="justify-end" gap={2}>
                  <Button
                    onClick={() => onDuplicate(macro.id)}
                    size="icon"
                    title="複製"
                    variant="ghost"
                  >
                    <Icon icon={Copy} size="sm" />
                  </Button>

                  <Button
                    onClick={() => onEdit(macro.id)}
                    size="icon"
                    title="編集"
                    variant="ghost"
                  >
                    <Icon icon={Pencil} size="sm" />
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
                </HStack>
              </div>
            </div>
          ))}
        </div>
      </div>
    </VStack>
  );
}

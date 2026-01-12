import type { Action, MacroDef } from "@shared/types/remapConfig";
import { ArrowLeft, Plus, Save } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/atoms/Button";
import { Icon } from "@/components/atoms/Icon";
import { SequenceEditor } from "@/components/organisms/editor/SequenceEditor";
import { HStack, VStack } from "@/components/template/Flex";
import { ModalLayout } from "@/components/template/ModalLayout";
import { useLayerState } from "@/hooks/useLayerState";
import { ActionStepEditor } from "./ActionStepEditor";

interface MacroEditFormProps {
  initialMacro?: MacroDef;
  onSave: (macro: MacroDef) => void;
  onCancel: () => void;
}

export function MacroEditForm({
  initialMacro,
  onSave,
  onCancel,
}: MacroEditFormProps) {
  const [name, setName] = useState(initialMacro?.name ?? "新規マクロ");
  const [actions, setActions] = useState<Action[]>(initialMacro?.actions ?? []);
  const [macroId] = useState(initialMacro?.id ?? crypto.randomUUID());
  const { layers } = useLayerState();

  // アクション編集用のステート
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddStart = () => {
    setIsAdding(true);
  };

  const handleEditStart = (index: number) => {
    setEditingIndex(index);
  };

  const handleSaveStep = (action: Action) => {
    if (isAdding) {
      setActions([...actions, action]);
    } else if (editingIndex !== null) {
      setActions(actions.map((a, i) => (i === editingIndex ? action : a)));
    }
    handleCloseModal();
  };

  const handleCloseModal = () => {
    setIsAdding(false);
    setEditingIndex(null);
  };

  const handleDeleteAction = (index: number) => {
    setActions(actions.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSave({ id: macroId, name, actions });
  };
  const initialAction = actions[editingIndex ?? 0];
  return (
    <VStack className="h-full w-full" gap={6}>
      <HStack className="items-center justify-between border-border border-b pb-4">
        <HStack className="items-center" gap={2}>
          <Button onClick={onCancel} size="icon" variant="ghost">
            <Icon icon={ArrowLeft} />
          </Button>
          <h2 className="font-bold text-xl">マクロ編集</h2>
        </HStack>
        <Button disabled={!name} onClick={handleSave} variant="default">
          <Icon className="mr-2" icon={Save} />
          保存
        </Button>
      </HStack>

      <VStack gap={2}>
        {/* TODO - カスタムInputコンポーネントを使用する */}
        <label className="flex flex-col gap-2 font-medium text-muted-foreground text-sm">
          マクロ名
          <input
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground text-sm ring-offset-background file:border-0 file:bg-transparent file:font-medium file:text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            onChange={(e) => setName(e.target.value)}
            placeholder="マクロ名を入力"
            value={name}
          />
        </label>
      </VStack>

      <div className="flex-1 overflow-auto rounded-md border border-border bg-background/50 p-4">
        <SequenceEditor
          actions={actions}
          onChange={setActions}
          onDeleteAction={handleDeleteAction}
          onEditAction={handleEditStart}
        />

        {actions.length === 0 && (
          <div className="py-8 text-center text-muted-foreground">
            アクションがありません。下部ボタンから追加してください。
          </div>
        )}
      </div>

      <div className="border-border border-t pt-4">
        <Button
          className="w-full gap-2 border-dashed"
          onClick={handleAddStart}
          variant="outline"
        >
          <Icon icon={Plus} />
          アクションを追加
        </Button>
      </div>

      {/* アクション編集モーダル */}
      <ModalLayout
        onClose={handleCloseModal}
        value={isAdding || editingIndex !== null}
      >
        {() => (
          <ActionStepEditor
            currentMacroId={macroId}
            initialAction={initialAction}
            layers={layers} // TODO: レイアウトをページから引き継ぐ
            layout="JIS"
            onCancel={handleCloseModal}
            onSave={handleSaveStep}
          />
        )}
      </ModalLayout>
    </VStack>
  );
}

import type { MacroDef } from "@shared/types/remapConfig";
import { useState } from "react";
import { Else, Ternary, Then } from "@/components/control/Ternary";
import { ConfirmDialog } from "@/components/molecules/ConfirmDialog";
import { Box, HStack, VStack } from "@/components/template/Flex";
import { useMacros } from "@/hooks/useMacros";
import { MacroEditForm } from "./MacroEditForm";
import { MacroList } from "./MacroList";

export function MacroManager() {
  // Navigation State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Data State
  const { macros, saveMacros } = useMacros();

  const handleAddStart = () => {
    setEditingId(null);
    setIsAddingNew(true);
  };

  const handleEditStart = (id: string) => {
    setEditingId(id);
    setIsAddingNew(false);
  };

  const handleSave = (macro: MacroDef) => {
    if (editingId) {
      saveMacros(macros.map((m) => (m.id === editingId ? macro : m)));
    } else {
      saveMacros([...macros, macro]);
      setEditingId(macro.id); // 作成後にそのまま編集状態にする
    }
    setIsAddingNew(false);
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsAddingNew(false);
  };

  const handleClickDelete = (id: string) => {
    setDeleteTargetId(id);
  };

  const executeDelete = () => {
    if (!deleteTargetId) {
      return;
    }
    const newMacros = macros.filter((m) => m.id !== deleteTargetId);
    saveMacros(newMacros);
    if (editingId === deleteTargetId) {
      setEditingId(null);
    }
    setDeleteTargetId(null);
  };

  const handleDuplicate = (id: string) => {
    const target = macros.find((m) => m.id === id);
    if (target) {
      const newMacro = {
        ...target,
        id: crypto.randomUUID(),
        name: `${target.name} (Copy)`,
      };
      saveMacros([...macros, newMacro]);
      setEditingId(newMacro.id);
    }
  };

  const selectedMacro = isAddingNew
    ? undefined
    : macros.find((m) => m.id === editingId);

  return (
    <HStack className="h-[calc(100vh-180px)] items-stretch" gap={6}>
      <Box className="w-80 overflow-y-auto border-border border-r pr-6">
        <MacroList
          macros={macros}
          onAdd={handleAddStart}
          onDelete={handleClickDelete}
          onDuplicate={handleDuplicate}
          onEdit={handleEditStart}
        />
      </Box>

      <Box className="flex-1 overflow-y-auto pl-2">
        <Ternary condition={editingId !== null || isAddingNew}>
          <Then>
            <MacroEditForm
              actionSummaryHandlers={{ onNavigate: handleEditStart }}
              initialMacro={selectedMacro}
              key={editingId || "new"}
              onCancel={handleCancel}
              onSave={handleSave}
            />
          </Then>
          <Else>
            <VStack className="h-full items-center justify-center text-muted-foreground">
              <p>左側のリストからマクロを選択するか、新規作成してください</p>
            </VStack>
          </Else>
        </Ternary>
      </Box>

      <ConfirmDialog
        description={`この操作は取り消せません。マクロ「${macros.find((m) => m.id === deleteTargetId)?.name}」を削除してもよろしいですか？`}
        onConfirm={executeDelete}
        onOpenChange={(open) => !open && setDeleteTargetId(null)}
        open={!!deleteTargetId}
        title="マクロを削除しますか？"
      />
    </HStack>
  );
}

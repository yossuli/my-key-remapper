import type { MacroAction, TriggerType } from "@shared/types/remapConfig";
import { remapRules } from "../../state/rules";
import { debugLog } from "../../utils/debugLogger";
import { executeActionInternal } from "../actionExecutor";

/**
 * マクロを実行
 */
export async function executeMacroAction(
  vkCode: number,
  trigger: TriggerType,
  action: MacroAction
): Promise<void> {
  // マクロIDから定義を検索
  const macros = remapRules.getMacros();
  const macro = macros.find((m) => m.id === action.macroId);
  if (!macro) {
    debugLog("macroExecutor.ts-executeMacroAction-not-found", {
      macroId: action.macroId,
    });
    return;
  }
  debugLog("macroExecutor.ts-executeMacroAction-start", {
    macroName: macro.name,
  });

  // マクロ内のアクションを順次実行
  for (const step of macro.actions) {
    // 再帰呼び出し
    await executeActionInternal(vkCode, trigger, step);
  }
}

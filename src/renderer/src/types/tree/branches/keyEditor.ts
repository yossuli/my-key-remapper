/**
 * キーエディタUI関連の型定義
 */

/** キーエディタのUI状態 */
export interface KeyEditorUIState {
  showVkInput: boolean;
  vkInputValue: string;
}

/** キーエディタのUIアクション */
export interface KeyEditorUIActions {
  addHoldKey: (vk: number) => void;
  removeKey: (vk: number) => void;
  resetState: () => void;
  clearTargetKeys: () => void;
}

/** キーエディタのUIハンドラー */
export interface KeyEditorUIHandlers {
  setShowVkInput: (show: boolean) => void;
  setVkInputValue: (value: string) => void;
  setIsInputFocused: (focused: boolean) => void;
}

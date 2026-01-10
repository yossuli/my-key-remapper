/**
 * マウス操作関連の型定義
 */

/** マウス座標の状態 */
export interface MousePosition {
  x: number;
  y: number;
}

/** マウスクリック設定 */
export interface MouseClickSettings {
  button: "left" | "right" | "middle";
  clickCount: number;
}

/** マウスキャプチャの状態 */
export interface MouseCaptureState {
  isCapturing: boolean;
  countdown: number;
}

/** マウス設定の全体状態 */
export interface MouseState
  extends MousePosition,
    MouseClickSettings,
    MouseCaptureState {
  cursorReturnDelayMs: number;
}

/** マウス設定のハンドラー */
export interface MouseHandlers {
  setMouseX: (x: number) => void;
  setMouseY: (y: number) => void;
  setMouseButton: (button: "left" | "right" | "middle") => void;
  setClickCount: (count: number) => void;
  setCursorReturnDelayMs: (ms: number) => void;
  onGetMousePosition: () => void;
}

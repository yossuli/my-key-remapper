/**
 * ScreenSize関連の仲介型定義
 */

/** 画面サイズ */
export interface ScreenSize {
  width: number;
  height: number;
}

/** 画面サイズ状態 (nullは読み込み中) */
export type ScreenSizeState = ScreenSize | null;

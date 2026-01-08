/**
 * 押下中のキーを追跡するモジュール
 * sendKeyでダウンしたキーを記憶し、一括でリリースできる
 */

// 押下中のキーを追跡するセット
const pressedKeys = new Set<number>();

/** キーダウンを記録 */
export function markKeyDown(vkCode: number): void {
  pressedKeys.add(vkCode);
}

/** キーアップを記録 */
export function markKeyUp(vkCode: number): void {
  pressedKeys.delete(vkCode);
}

/** 現在押下中のキーを取得 */
export function getPressedKeys(): number[] {
  return Array.from(pressedKeys);
}

/** 押下中のキーがあるか確認 */
export function hasPressedKeys(): boolean {
  return pressedKeys.size > 0;
}

/** 追跡をクリア（実際のキーアップは送信しない） */
export function clearPressedKeys(): void {
  pressedKeys.clear();
}

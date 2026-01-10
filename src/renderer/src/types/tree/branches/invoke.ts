/**
 * IPC Invoke関連の仲介型定義
 */

/** 押下キー取得関数の型 */
export type GetPressedKeys = () => Promise<number[] | undefined>;

/** 全キーリリース関数の型 */
export type ReleaseAllKeys = () => Promise<number | undefined>;

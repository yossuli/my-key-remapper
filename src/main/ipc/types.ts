/**
 * キーイベントデータ
 */
interface KeyEventData {
  vkCode: number;
  isUp: boolean;
}

/**
 * IPCチャンネルとペイロードのマッピング
 */
interface IPCChannelMap {
  "key-event": KeyEventData;
  // 将来的に追加されるチャンネル
  // "layer-changed": { layerId: string };
}

/**
 * 型安全なイベント送信関数
 * チャンネル名に応じて、適切なデータ型を強制する
 */
export type EventSender = <T extends keyof IPCChannelMap>(
  channel: T,
  data: IPCChannelMap[T]
) => void;

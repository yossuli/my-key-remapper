/**
 * キーイベントデータ
 */
interface KeyEventData {
  vkCode: number;
  isUp: boolean;
}

/**
 * レイヤースタック変更イベントデータ
 */
interface LayerStackChangedData {
  stack: string[];
}

/**
 * IPCチャンネルとペイロードのマッピング
 */
interface IPCChannelMap {
  "key-event": KeyEventData;
  "layer-stack-changed": LayerStackChangedData;
}

/**
 * 型安全なイベント送信関数
 * チャンネル名に応じて、適切なデータ型を強制する
 */
export type EventSender = <T extends keyof IPCChannelMap>(
  channel: T,
  data: IPCChannelMap[T]
) => void;

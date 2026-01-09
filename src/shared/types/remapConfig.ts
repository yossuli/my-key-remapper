// =====================================
// トリガー種別
// =====================================

/**
 * トリガーの種類
 * - tap: 単押し（短押し）
 * - hold: 長押し
 * - doubleTap: ダブルクリック
 * - tapHold: タップ後に長押し（未実装）
 */
export type TriggerType = "tap" | "hold" | "doubleTap"; // | "tapHold";

// =====================================
// 修飾キー
// =====================================

/**
 * 修飾キーの出力指定
 */
export interface ModifierOutput {
  ctrl?: boolean | "left" | "right";
  shift?: boolean | "left" | "right";
  alt?: boolean | "left" | "right";
  win?: boolean | "left" | "right";
}

// =====================================
// アクション
// =====================================

/**
 * マクロの1ステップ
 */
export interface MacroStep {
  action: "tap" | "down" | "up" | "delay" | "text";
  key?: number;
  modifiers?: ModifierOutput;
  delayMs?: number;
  text?: string;
}

/**
 * キーリマップアクション
 */
export interface RemapAction {
  type: "remap";
  keys: number[];
}

/**
 * マクロアクション
 */
export interface MacroAction {
  type: "macro";
  steps: MacroStep[];
}

/**
 * レイヤー切り替えアクション（トグル）
 */
export interface LayerToggleAction {
  type: "layerToggle";
  layerId: string;
}

/**
 * レイヤー一時切り替えアクション（モーメンタリ）
 */
export interface LayerMomentaryAction {
  type: "layerMomentary";
  layerId: string;
}

/**
 * 無効化アクション
 */
export interface NoneAction {
  type: "none";
}

/**
 * パススルーアクション（そのまま通す）
 */
export interface PassthroughAction {
  type: "passthrough";
}

/**
 * マウスカーソル移動アクション
 */
export interface MouseMoveAction {
  type: "mouseMove";
  /** 移動先X座標 (絶対ピクセル座標) */
  x: number;
  /** 移動先Y座標 (絶対ピクセル座標) */
  y: number;
}

/**
 * すべてのアクション種別
 */
export type Action =
  | RemapAction
  // | MacroAction
  | LayerToggleAction
  | LayerMomentaryAction
  | NoneAction
  | MouseMoveAction
  // | PassthroughAction;

export type ActionType = Action["type"];

// =====================================
// キーバインディング
// =====================================

/**
 * キーバインディング（1つのトリガーに対する1つのアクション）
 */
export interface KeyBinding {
  trigger: TriggerType;
  action: Action;
  /** タイミング設定(ms)。triggerに応じて意味が変わる: hold=長押し判定時間, doubleTap=タップ間隔 */
  timingMs?: number;
}

// =====================================
// レイヤー
// =====================================
/**
 * レイヤー定義
 */
export interface Layer {
  id: string;
  /** キーコード → バインディング配列 */
  bindings: Record<number, KeyBinding[]>;
  /** "layerMomentary"で有効にしている場合、ほかのキーを押したときにこのキーを送信する（未実装） */
  // passThroughKeys?: number[];
  /** レイヤーアクティブ時にデフォルトで送信する修飾キー（tap アクションが設定されているキーは除外） */
  defaultModifiers?: {
    shift?: boolean | "left" | "right";
  };
}

// =====================================
// 設定全体
// =====================================

/**
 * グローバル設定
 */
export interface GlobalSettings {
  /** 長押し判定のしきい値（ミリ秒） */
  defaultHoldThresholdMs: number;
  /** ダブルタップ判定の間隔（ミリ秒） */
  defaultTapIntervalMs: number;
}

/**
 * リマップ設定全体
 */
export interface RemapConfig {
  version: number;
  layers: Layer[];
  /** レイヤーの表示順序（レイヤーIDの配列） */
  layerOrder: string[];
  globalSettings: GlobalSettings;
}

/**
 * デフォルト設定
 */
/** VK_LSHIFT */
const VK_LSHIFT = 160;
/** VK_RSHIFT */
const VK_RSHIFT = 161;

export const DEFAULT_REMAP_CONFIG: RemapConfig = {
  version: 1,
  layers: [
    {
      id: "base",
      bindings: {
        // Shift 長押しで shift レイヤーを有効化
        [VK_LSHIFT]: [
          {
            trigger: "hold",
            action: { type: "layerMomentary", layerId: "shift" },
          },
        ],
        [VK_RSHIFT]: [
          {
            trigger: "hold",
            action: { type: "layerMomentary", layerId: "shift" },
          },
        ],
      },
    },
    {
      id: "shift",
      bindings: {},
      defaultModifiers: { shift: true },
    },
  ] satisfies RemapConfig["layers"],
  layerOrder: ["base", "shift"],
  globalSettings: {
    defaultHoldThresholdMs: 200,
    defaultTapIntervalMs: 300,
  },
};

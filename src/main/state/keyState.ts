import type { TriggerType } from "../../shared/types/remapConfig";

/**
 * 個別キーの状態
 */
interface KeyState {
  /** キーが押されているか */
  isDown: boolean;
  /** 押下開始時刻 */
  downTime: number;
  /** 最後にタップした時刻（ダブルタップ判定用） */
  lastTapTime: number;
  /** 長押しタイマーID */
  holdTimerId: ReturnType<typeof setTimeout> | null;
  /** 長押しが発火したか */
  holdFired: boolean;
  /** タップ遅延タイマーID（ダブルタップ待機用） */
  tapTimerId: ReturnType<typeof setTimeout> | null;
}

/** トリガー発火時のコールバック */
type TriggerCallback = (code: number, trigger: TriggerType) => void;

/**
 * キー状態を管理するクラス
 * タップ/ホールド/ダブルタップの判定を行う
 */
export class KeyStateManager {
  private readonly states = new Map<number, KeyState>();
  private readonly pendingHoldKeys = new Set<number>();
  private readonly pendingTapKeys = new Set<number>();

  /** 長押し判定のしきい値（ミリ秒） */
  private holdThresholdMs = 200;

  /** ダブルタップ判定の間隔（ミリ秒） */
  private tapIntervalMs = 300;

  /** トリガー発火時のコールバック */
  private onTriggerCallback: TriggerCallback | null = null;

  /**
   * トリガー発火時のコールバックを設定
   */
  setTriggerCallback(callback: TriggerCallback) {
    this.onTriggerCallback = callback;
  }

  /**
   * しきい値を設定
   */
  setThresholds(holdMs: number, tapMs: number) {
    this.holdThresholdMs = holdMs;
    this.tapIntervalMs = tapMs;
  }

  /**
   * キー状態を取得（なければ初期化）
   */
  private getState(code: number): KeyState {
    if (!this.states.has(code)) {
      this.states.set(code, {
        isDown: false,
        downTime: 0,
        lastTapTime: 0,
        holdTimerId: null,
        holdFired: false,
        tapTimerId: null,
      });
    }
    // biome-ignore lint/style/noNonNullAssertion: 上で必ずセットしている
    return this.states.get(code)!;
  }

  /**
   * トリガーを発火
   */
  private fireTrigger(code: number, trigger: TriggerType) {
    if (this.onTriggerCallback) {
      this.onTriggerCallback(code, trigger);
    }
  }

  /**
   * キーダウンイベントを処理
   * @param code キーコード
   * @param keyTiming キー別タイミング設定（省略時はグローバル設定を使用）
   */
  onKeyDown(code: number, keyTiming?: { holdThresholdMs?: number }): void {
    const state = this.getState(code);
    const now = Date.now();

    // 既に押されている場合は無視（キーリピート）
    if (state.isDown) {
      return;
    }

    state.isDown = true;
    state.downTime = now;
    state.holdFired = false;

    // タップ遅延タイマーをクリア（ダブルタップの可能性があるため）
    if (state.tapTimerId) {
      clearTimeout(state.tapTimerId);
      state.tapTimerId = null;
      this.pendingTapKeys.delete(code);
    }

    // 長押しタイマーを開始
    if (state.holdTimerId) {
      clearTimeout(state.holdTimerId);
      this.pendingHoldKeys.delete(code);
    }

    // キー別設定があればそれを使用、なければグローバル設定
    const holdMs = keyTiming?.holdThresholdMs ?? this.holdThresholdMs;

    state.holdTimerId = setTimeout(() => {
      if (state.isDown && !state.holdFired) {
        state.holdFired = true;
        this.pendingHoldKeys.delete(code); // 発火したらペンディングから削除
        this.states.set(code, state);
        console.log(`[HOOK] Hold detected for key ${code}`);
      }
    }, holdMs);
    this.pendingHoldKeys.add(code);

    return;
  }

  /**
   * キーアップイベントを処理
   * 注意: トリガーは即時ではなく、コールバック経由で遅延発火される場合がある
   * @param code キーコード
   * @param hasDoubleTapBinding ダブルタップバインディングがあるか（ない場合は遅延なしで tap を発火）
   * @param keyTiming キー別タイミング設定（省略時はグローバル設定を使用）
   * @returns 即時発火するトリガー、または null（遅延発火待ち）
   */
  onKeyUp(
    code: number,
    hasDoubleTapBinding: boolean,
    keyTiming?: { tapIntervalMs?: number }
  ): TriggerType | null {
    const state = this.getState(code);
    const now = Date.now();

    // 長押しタイマーをクリア
    if (state.holdTimerId) {
      clearTimeout(state.holdTimerId);
      state.holdTimerId = null;
      this.pendingHoldKeys.delete(code);
    }

    state.isDown = false;

    // 長押しが既に発火していた場合
    if (state.holdFired) {
      return null;
    }

    // ダブルタップバインディングがない場合は即座に tap を発火
    if (!hasDoubleTapBinding) {
      state.lastTapTime = 0;
      return "tap";
    }

    // キー別設定があればそれを使用、なければグローバル設定
    const tapMs = keyTiming?.tapIntervalMs ?? this.tapIntervalMs;

    // 短押しの場合
    const timeSinceLastTap = now - state.lastTapTime;

    // ダブルタップ判定：前回のタップから tapIntervalMs 以内
    if (timeSinceLastTap < tapMs && state.lastTapTime > 0) {
      // タップ遅延タイマーをクリア（前回のタップを取り消し）
      if (state.tapTimerId) {
        clearTimeout(state.tapTimerId);
        state.tapTimerId = null;
        this.pendingTapKeys.delete(code);
      }
      state.lastTapTime = 0; // リセット
      return "doubleTap";
    }

    // タップは遅延発火：tapIntervalMs 後に tap を発火
    state.lastTapTime = now;
    state.tapTimerId = setTimeout(() => {
      state.tapTimerId = null;
      this.pendingTapKeys.delete(code);
      state.lastTapTime = 0; // タイムアウト後リセット
      this.fireTrigger(code, "tap");
    }, tapMs);
    this.pendingTapKeys.add(code);

    // 即時発火なし（コールバックで遅延発火）
    return null;
  }

  /**
   * すべての状態をリセット
   */
  reset() {
    for (const state of this.states.values()) {
      if (state.holdTimerId) {
        clearTimeout(state.holdTimerId);
      }
      if (state.tapTimerId) {
        clearTimeout(state.tapTimerId);
      }
    }
    this.states.clear();
    this.pendingHoldKeys.clear();
    this.pendingTapKeys.clear();
  }

  /**
   * ホールド待機中（タイマー発火前）のキーコードを取得
   * 割り込みキー入力時にこれらのキーをtapとして送信するため
   */
  getPendingHoldKeys(): number[] {
    return Array.from(this.pendingHoldKeys);
  }

  /**
   * ダブルタップ判定待ち（タップ遅延待機中）のキーコードを取得
   */
  getPendingTapKeys(): number[] {
    return Array.from(this.pendingTapKeys);
  }

  /**
   * 指定されたキーのタップ遅延を強制的に解消して tap トリガーを発火させる
   * @returns 発火した場合は "tap"、待機中でなければ null
   */
  forceResolveTap(code: number): TriggerType | null {
    const state = this.getState(code);

    if (state.tapTimerId) {
      clearTimeout(state.tapTimerId);
      state.tapTimerId = null;
      this.pendingTapKeys.delete(code);
      state.lastTapTime = 0; // タイムアウト後リセット

      return "tap";
    }
    return null;
  }
}

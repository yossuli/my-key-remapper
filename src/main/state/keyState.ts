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
}

/**
 * キー状態を管理するクラス
 * タップ/ホールド/ダブルタップの判定を行う
 */
export class KeyStateManager {
  private readonly states = new Map<number, KeyState>();

  /** 長押し判定のしきい値（ミリ秒） */
  private holdThresholdMs = 200;

  /** ダブルタップ判定の間隔（ミリ秒） */
  private tapIntervalMs = 300;

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
      });
    }
    // biome-ignore lint/style/noNonNullAssertion: 上で必ずセットしている
    return this.states.get(code)!;
  }

  /**
   * キーダウンイベントを処理
   * @returns 発火すべきトリガー、またはnull（ホールド待機中）
   */
  onKeyDown(
    code: number,
    onHoldTrigger: (triggeredCode: number) => void
  ): TriggerType | null {
    const state = this.getState(code);
    const now = Date.now();

    // 既に押されている場合は無視（キーリピート）
    if (state.isDown) {
      return null;
    }

    state.isDown = true;
    state.downTime = now;
    state.holdFired = false;

    // 長押しタイマーを開始
    if (state.holdTimerId) {
      clearTimeout(state.holdTimerId);
    }

    state.holdTimerId = setTimeout(() => {
      if (state.isDown && !state.holdFired) {
        state.holdFired = true;
        onHoldTrigger(code);
      }
    }, this.holdThresholdMs);

    // キーダウン時点ではトリガーを返さない（リリース時に判定）
    return null;
  }

  /**
   * キーアップイベントを処理
   * @returns 発火すべきトリガー
   */
  onKeyUp(code: number): TriggerType {
    const state = this.getState(code);
    const now = Date.now();

    // タイマーをクリア
    if (state.holdTimerId) {
      clearTimeout(state.holdTimerId);
      state.holdTimerId = null;
    }

    state.isDown = false;

    // 長押しが既に発火していた場合
    if (state.holdFired) {
      return "hold";
    }

    // 短押しの場合
    const timeSinceLastTap = now - state.lastTapTime;

    // ダブルタップ判定
    if (timeSinceLastTap < this.tapIntervalMs) {
      state.lastTapTime = 0; // リセット
      return "doubleTap";
    }

    // タップ
    state.lastTapTime = now;
    return "tap";
  }

  /**
   * キーが押されているかどうか
   */
  isKeyDown(code: number): boolean {
    return this.getState(code).isDown;
  }

  /**
   * 長押しが発火したかどうか
   */
  isHoldFired(code: number): boolean {
    return this.getState(code).holdFired;
  }

  /**
   * すべての状態をリセット
   */
  reset() {
    for (const state of this.states.values()) {
      if (state.holdTimerId) {
        clearTimeout(state.holdTimerId);
      }
    }
    this.states.clear();
  }

  /**
   * ホールド待機中（タイマー発火前）のキーコードを取得
   * 割り込みキー入力時にこれらのキーをtapとして送信するため
   */
  getPendingHoldKeys(): number[] {
    const pending: number[] = [];
    for (const [code, state] of this.states.entries()) {
      // 押されていて、まだホールド発火していない場合
      if (state.isDown && !state.holdFired && state.holdTimerId !== null) {
        pending.push(code);
      }
    }
    return pending;
  }

  /**
   * ホールド待機中のキーを割り込みとしてマーク（タイマーをクリアし、割り込みフラグを設定）
   * これにより、リリース時にtapとして扱わないようにする
   */
  markAsInterrupted(code: number) {
    const state = this.getState(code);
    if (state.holdTimerId) {
      clearTimeout(state.holdTimerId);
      state.holdTimerId = null;
    }
    // holdFiredをtrueにして、リリース時にholdとして扱う
    // ただし実際にはすでにtapを送信済みなので、リリース時は何もしない
    state.holdFired = true;
  }
}

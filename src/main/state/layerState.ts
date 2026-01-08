/** レイヤースタック変更時のコールバック */
type LayerChangeCallback = (stack: string[]) => void;

/**
 * レイヤースタックの状態管理
 */
export class LayerState {
  /** 現在有効なレイヤーのスタック（最後が最優先） */
  private layerStack: string[] = ["base"];

  /** 変更通知コールバック */
  private onChangeCallback: LayerChangeCallback | null = null;

  /**
   * 変更通知コールバックを設定
   */
  setOnChangeCallback(callback: LayerChangeCallback) {
    this.onChangeCallback = callback;
  }

  /**
   * 変更を通知
   */
  private notifyChange() {
    if (this.onChangeCallback) {
      this.onChangeCallback([...this.layerStack]);
    }
  }

  /**
   * レイヤーをスタックにプッシュ（momentary用）
   */
  pushLayer(layerId: string) {
    if (!this.layerStack.includes(layerId)) {
      this.layerStack.push(layerId);
      console.log(`Layer pushed: ${layerId}, stack: ${this.layerStack}`);
      this.notifyChange();
    }
  }

  /**
   * レイヤーをスタックからポップ（momentary用）
   */
  popLayer(layerId: string) {
    const index = this.layerStack.indexOf(layerId);
    if (index > 0) {
      // baseレイヤーは削除しない
      this.layerStack.splice(index, 1);
      console.log(`Layer popped: ${layerId}, stack: ${this.layerStack}`);
      this.notifyChange();
    }
  }

  setLayer(layerId: string) {
    this.layerStack = [layerId];
    this.notifyChange();
  }

  /**
   * 指定レイヤーにスタックを強制リセット
   */
  resetToLayer(layerId: string) {
    this.layerStack = [layerId];
    console.log(`[LAYER] Reset to: ${layerId}`);
    this.notifyChange();
  }

  /**
   * 現在のレイヤースタックを取得
   */
  getStack(): string[] {
    return [...this.layerStack];
  }
}

export const layerState = new LayerState();

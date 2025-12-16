/**
 * レイヤースタックの状態管理
 */
export class LayerState {
  /** 現在有効なレイヤーのスタック（最後が最優先） */
  private readonly layerStack: string[] = ["base"];

  /**
   * レイヤーをスタックにプッシュ（momentary用）
   */
  pushLayer(layerId: string) {
    if (!this.layerStack.includes(layerId)) {
      this.layerStack.push(layerId);
      console.log(`Layer pushed: ${layerId}, stack: ${this.layerStack}`);
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
    }
  }

  /**
   * レイヤーをトグル
   */
  toggleLayer(layerId: string) {
    if (this.layerStack.includes(layerId)) {
      this.popLayer(layerId);
    } else {
      this.pushLayer(layerId);
    }
  }

  /**
   * 現在のレイヤースタックを取得
   */
  getStack(): string[] {
    return [...this.layerStack];
  }
}

export const layerState = new LayerState();

# my-key-remapper プロジェクト固有のナレッジ

## プロジェクト概要

- **タイプ**: Electron + React アプリケーション
- **目的**: キーリマッパー（キーボードの入力を別のキーにリマップ）
- **言語**: TypeScript

## アーキテクチャ

### ディレクトリ構造

```
src/
├── main/           # Electron メインプロセス
│   ├── config/     # 設定関連
│   ├── handler/    # キーハンドリング
│   ├── hook/       # キーボードフック
│   ├── remap/      # リマップルール
│   ├── sender/     # キー送信
│   └── state/      # 状態管理
├── preload/        # Electron プリロード
└── renderer/       # React フロントエンド (Atomic Design)
    └── src/
        ├── components/
        │   ├── atoms/
        │   ├── molecules/
        │   ├── organisms/
        │   ├── templates/
        │   └── pages/
        └── hooks/
```

### コーディング規約

- **Ultracite/Biome**: `biome.jsonc` で設定済み
  - `ultracite/core` と `ultracite/react` を継承
  - `biome-ignore` は禁止（ユーザー許可が必要）
- **コメント**: すべて日本語で記述
- **関数**: 明示的な戻り値の型を付ける
- **ファイル名**: camelCase

## 過去の学びと注意事項

### キーイベント処理

- アクションは指定されたトリガーを確認後、'tap' トリガーにフォールバック
- すべてのレイヤーを統一的に扱う（base レイヤーの特別扱いなし）
- リマップが定義されていない場合はデフォルトのキー動作を維持

### Double Tap 検出

- `onKeyUp` で即座に "tap" を返すと、ダブルタップ検出に失敗する
- `tapIntervalMs` 内での 2 回目のタップを待つ必要がある

---

_このファイルは作業中に学んだことや間違いを記録するために更新されます_

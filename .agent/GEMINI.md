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
│   ├── hook/       # キーボードフック・イベント処理
│   ├── ipc/        # IPC通信ハンドラ
│   ├── native/     # koffi FFIバインディング・キー送信
│   ├── state/      # 状態管理（RemapRules, KeyState, LayerState）
│   ├── storage/    # 設定永続化
│   └── utils/      # ユーティリティ
├── preload/        # Electron プリロード（IPC bridge）
├── renderer/       # React フロントエンド (Atomic Design)
│   └── src/
│       ├── components/
│       │   ├── atoms/      # 7コンポーネント
│       │   ├── molecules/  # 7コンポーネント
│       │   ├── organisms/  # 5コンポーネント
│       │   ├── template/   # 3コンポーネント
│       │   ├── pages/      # 1コンポーネント
│       │   └── control/    # 7コンポーネント（宣言的条件分岐用）
│       ├── hooks/          # 11カスタムフック
│       ├── utils/          # 9ユーティリティ関数
│       └── types/          # フロントエンド専用型
└── shared/         # 共有コード
    ├── constants/  # VKコード、キーボードレイアウト定義
    └── types/      # 共有型定義（TriggerType, Action, Layer等）
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

### パフォーマンス優先のリファクタリング方針

- キーイベント処理（`src/main/hook`）は速度が最優先
- 再利用しない限り、認知的複雑度を減らす目的だけでの関数分割は不要
- 再利用する場合のみ関数化を行う
- 速さ優先で `let` を使用したループ内変数書き換えも許容

### Double Tap 検出

- `onKeyUp` で即座に "tap" を返すと、ダブルタップ検出に失敗する
- `tapIntervalMs` 内での 2 回目のタップを待つ必要がある

### 動作確認

- このアプリは私（Claude）が起動しても何も起きないため、動作確認はしない
- ビルド成功のみを検証する

---

_このファイルは作業中に学んだことや間違いを記録するために更新されます_

# アトミックデザイン構造ドキュメント

## 概要

このプロジェクトは、Brad Frost のアトミックデザイン手法に従って構築されています。
コンポーネントは 5 つの階層に分類され、小さな部品から大きな構造へと組み立てられます。

## ディレクトリ構造

```
src/renderer/src/
├── components/
│   ├── atoms/          # 最小単位のコンポーネント
│   ├── molecules/      # Atomsの組み合わせ
│   ├── organisms/      # Moleculesの組み合わせ
│   ├── template/       # レイアウト構造
│   └── controle/       # 制御フローコンポーネント（アトミックデザイン外）
├── pages/              # 完全なページ
├── types/              # 型定義
├── utils/              # ユーティリティ関数
└── app.tsx             # エントリーポイント
```

## 階層別コンポーネント一覧

### Atoms（原子）

最小単位の UI コンポーネント。これ以上分割できない基本的な要素。

- **Button** - 汎用ボタン

  - Props: `variant`, `size`, `children`
  - 用途: あらゆる場所で使用可能な基本ボタン

- **Input** - 汎用入力フィールド

  - Props: `label`, `error`, その他 HTML input 属性
  - 用途: フォーム入力

- **Select** - 汎用セレクトボックス

  - Props: `label`, `options`
  - 用途: 選択肢からの選択

- **Badge** - バッジ表示

  - Props: `variant`, `children`
  - 用途: ステータス表示、ラベル表示

- **Icon** - アイコンラッパー

  - Props: `icon`, `size`
  - 用途: lucide-react アイコンの統一的な表示

- **KeyButton** - キーボードキーボタン
  - Props: `keyDef`, `bindings`, `keyboardLayout`, `onClick`
  - 用途: キーボードレイアウト上の個別キー表示

### Molecules（分子）

Atoms を組み合わせた小さな機能単位。

- **KeyDisplay** - キー表示

  - 使用 Atoms: `Badge`
  - 用途: VK コードをキーラベルとして表示

- **TriggerSelector** - トリガー選択 UI

  - 使用 Atoms: `Button`
  - 用途: Tap/Hold/DoubleTap の選択

- **ActionTypeSelector** - アクション種別選択

  - 使用 Atoms: `Select`
  - 用途: リマップ/レイヤー切替などの選択

- **LayerSelector** - レイヤー選択

  - 使用 Atoms: `Select`, `Icon`
  - 用途: 対象レイヤーの選択

- **LogEntry** - ログエントリ表示

  - 使用 Atoms: `Badge`
  - 用途: 単一のログエントリ表示

- **LayoutToggle** - レイアウト切替ボタン

  - 使用 Atoms: `Button`, `Icon`
  - 用途: JIS/US レイアウトの切替

- **LayerTabs** - レイヤータブ
  - 使用 Atoms: `Button`
  - 用途: レイヤー間の切替

### Organisms（生物）

Molecules を組み合わせた複雑な機能ブロック。

- **KeyboardGrid** - キーボードグリッド

  - 使用 Atoms: `KeyButton`
  - 使用制御: `Mapped`
  - 用途: キーボード全体のレイアウト表示

- **LogList** - ログリスト

  - 使用 Atoms: `Icon`
  - 使用 Molecules: `LogEntry`
  - 用途: キーイベントログの一覧表示

- **AppHeader** - アプリケーションヘッダー

  - 使用 Atoms: `Button`, `Icon`
  - 用途: アプリのタイトルと有効/無効トグル

- **KeyEditorForm** - キーエディタフォーム

  - 使用 Atoms: `Input`, `Button`
  - 使用 Molecules: `KeyDisplay`, `TriggerSelector`, `ActionTypeSelector`, `LayerSelector`
  - 用途: キーマッピング編集フォーム

- **KeyRemapSection** - キーリマップセクション
  - 使用 Atoms: `Icon`
  - 使用 Molecules: `LayerTabs`, `LayoutToggle`
  - 使用 Organisms: `KeyboardGrid`
  - 用途: キーボード表示とレイヤー/レイアウト管理

### Templates（テンプレート）

ページの構造を定義するレイアウトコンポーネント。

- **MainLayout** - メインレイアウト

  - Props: `header`, `mainContent`, `sideContent`
  - 用途: アプリケーションの基本レイアウト構造

- **ModalLayout** - モーダルレイアウト
  - Props: `isOpen`, `title`, `children`, `onClose`
  - 用途: モーダルダイアログの構造

### Pages（ページ）

完全なページコンポーネント。すべての層を組み合わせて実際のページを構築。

- **KeyRemapperPage** - キーリマッパーページ
  - 使用 Templates: `MainLayout`, `ModalLayout`
  - 使用 Organisms: `AppHeader`, `KeyRemapSection`, `LogList`, `KeyEditorForm`
  - 用途: アプリケーションのメインページ

## データフロー

```
Pages (状態管理)
  ↓
Templates (レイアウト構造)
  ↓
Organisms (複雑な機能ブロック)
  ↓
Molecules (小さな機能単位)
  ↓
Atoms (基本UI要素)
```

## 設計原則

1. **単一責任の原則**: 各コンポーネントは 1 つの明確な責務を持つ
2. **再利用性**: 下位層ほど汎用的で再利用可能
3. **依存関係**: 上位層は下位層に依存するが、その逆はない
4. **Props 駆動**: コンポーネントは props で制御され、副作用を最小化
5. **型安全性**: TypeScript で厳密な型定義

## メリット

- **保守性**: コンポーネントの責務が明確で、変更の影響範囲が限定的
- **再利用性**: Atoms/Molecules は様々な場所で再利用可能
- **テスト容易性**: 小さなコンポーネント単位でテスト可能
- **スケーラビリティ**: 新機能追加時も既存の部品を組み合わせて構築可能
- **一貫性**: デザインシステムとして統一された UI

## 今後の拡張

新しい機能を追加する際は、以下の手順で進めることを推奨:

1. 必要な Atoms が存在するか確認（なければ作成）
2. Atoms を組み合わせて Molecules を作成
3. Molecules を組み合わせて Organisms を作成
4. Organisms を使用してページを構築

この階層構造を維持することで、長期的な保守性とスケーラビリティが確保されます。

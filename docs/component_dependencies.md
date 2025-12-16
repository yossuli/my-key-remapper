# コンポーネント依存関係図

## 全体構造

```
┌─────────────────────────────────────────────────────────────┐
│                         Pages                                │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              KeyRemapperPage                          │  │
│  │  - 状態管理（logs, layers, editingKey, etc.）        │  │
│  │  - ビジネスロジック（saveMapping, removeMapping）    │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                       Templates                              │
│  ┌──────────────────┐         ┌──────────────────┐          │
│  │   MainLayout     │         │   ModalLayout    │          │
│  │  - header        │         │  - title         │          │
│  │  - mainContent   │         │  - children      │          │
│  │  - sideContent   │         │  - onClose       │          │
│  └──────────────────┘         └──────────────────┘          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                       Organisms                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  AppHeader   │  │KeyRemapSection│ │   LogList    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                    ┌──────────────────────────────┐          │
│                    │    KeyEditorForm             │          │
│                    │  - 複雑なフォームロジック    │          │
│                    └──────────────────────────────┘          │
│  ┌──────────────────────────────┐                            │
│  │      KeyboardGrid            │                            │
│  │  - キーボードレイアウト表示  │                            │
│  └──────────────────────────────┘                            │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                       Molecules                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  KeyDisplay  │  │TriggerSelector│ │ActionTypeSelector│   │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │LayerSelector │  │  LogEntry    │  │LayoutToggle  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐                                            │
│  │  LayerTabs   │                                            │
│  └──────────────┘                                            │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                         Atoms                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Button  │  │  Input   │  │  Select  │  │  Badge   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│  ┌──────────┐  ┌──────────────────────────────────┐        │
│  │   Icon   │  │        KeyButton                 │        │
│  └──────────┘  │  - キーボードキー専用ボタン      │        │
│                 └──────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

## 詳細な依存関係

### KeyRemapperPage の依存関係

```
KeyRemapperPage
├── MainLayout
│   ├── AppHeader
│   │   ├── Button (Atom)
│   │   └── Icon (Atom)
│   ├── KeyRemapSection
│   │   ├── LayerTabs
│   │   │   └── Button (Atom)
│   │   ├── LayoutToggle
│   │   │   ├── Button (Atom)
│   │   │   └── Icon (Atom)
│   │   └── KeyboardGrid
│   │       └── KeyButton (Atom)
│   └── LogList
│       ├── Icon (Atom)
│       └── LogEntry
│           └── Badge (Atom)
└── ModalLayout
    └── KeyEditorForm
        ├── KeyDisplay
        │   └── Badge (Atom)
        ├── TriggerSelector
        │   └── Button (Atom)
        ├── ActionTypeSelector
        │   └── Select (Atom)
        ├── LayerSelector
        │   ├── Select (Atom)
        │   └── Icon (Atom)
        ├── Input (Atom)
        └── Button (Atom)
```

## Atoms の再利用状況

### Button

- 使用箇所: AppHeader, TriggerSelector, LayerTabs, LayoutToggle, KeyEditorForm
- 再利用回数: 5 箇所以上

### Icon

- 使用箇所: AppHeader, LayoutToggle, LogList, LayerSelector
- 再利用回数: 4 箇所

### Badge

- 使用箇所: KeyDisplay, LogEntry
- 再利用回数: 2 箇所

### Select

- 使用箇所: ActionTypeSelector, LayerSelector
- 再利用回数: 2 箇所

### Input

- 使用箇所: KeyEditorForm
- 再利用回数: 1 箇所（今後拡張可能）

### KeyButton

- 使用箇所: KeyboardGrid
- 専用コンポーネント

## データフローの例

### キーマッピング保存のフロー

```
1. KeyEditorForm (Organism)
   ↓ ユーザーがフォームを入力
2. TriggerSelector, ActionTypeSelector (Molecules)
   ↓ 選択値を親に通知
3. KeyEditorForm
   ↓ onSave コールバック実行
4. KeyRemapperPage (Page)
   ↓ saveMapping 関数実行
5. IPC通信でメインプロセスに送信
   ↓
6. 状態更新（楽観的更新）
   ↓
7. KeyboardGrid に新しいbindingsが渡される
   ↓
8. KeyButton が再レンダリング
```

### ログ表示のフロー

```
1. メインプロセスからkey-eventを受信
   ↓
2. KeyRemapperPage (Page)
   ↓ logs状態を更新
3. LogList (Organism)
   ↓ logsプロップを受け取る
4. LogEntry (Molecule) × N
   ↓ 各ログエントリをレンダリング
5. Badge (Atom)
   ↓ VKコードを表示
```

## 設計のポイント

1. **一方向データフロー**: データは常に上から下へ流れる
2. **イベントの上昇**: ユーザーアクションはコールバックで上位に伝播
3. **状態の集中管理**: 主要な状態は Page レベルで管理
4. **プレゼンテーションとロジックの分離**:
   - Atoms/Molecules: プレゼンテーションのみ
   - Organisms: 一部ロジックを含む
   - Pages: ビジネスロジックと状態管理

この構造により、各コンポーネントの責務が明確になり、テストやメンテナンスが容易になります。

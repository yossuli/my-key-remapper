# Props Flow Reference

このドキュメントは、アプリケーション全体のプロップス伝播フローを可視化した設計図です。
「どこで型が定義され」「どのように渡され」「どこで使用されているか」を一目で把握できます。

## 1. 凡例 (Legend)

### フロー記号 (Symbols)

| 記号 | 英語 (English) | 日本語 (Japanese) | 説明                                                                     |
| :--: | :------------- | :---------------- | :----------------------------------------------------------------------- |
|  🆕  | **Define**     | **定義・生成**    | このコンポーネントで新しい値やインスタンスが生成されています。           |
|  📦  | **Pack**       | **グループ化**    | 個別の値をオブジェクトにまとめています。                                 |
|  🎁  | **Pass Group** | **グループ渡し**  | Group オブジェクトのまま、変更せず子コンポーネントへ渡しています。       |
|  ∈   | **In Group**   | **グループ内包**  | 親の Group オブジェクトに含まれて渡されています。                        |
|  🔨  | **Unpack**     | **解体・展開**    | Group オブジェクトから値を分割代入 (Destructure) しています。            |
|  🚌  | **Drill**      | **通過 (Drill)**  | コンポーネント自身は使用せず、そのまま子へ渡しています (Prop Drilling)。 |
|  🔥  | **Use**        | **使用**          | ロジックやレンダリングで実際に値を使用しています。                       |
|  🧩  | **Individual** | **個別扱い**      | グループ化されず、個別のプロップスとして扱われています。                 |
|  🛑  | **Stop**       | **停止**          | 子コンポーネントへは渡されず、ここでフローが終了します。                 |
|  ➖  | **None**       | **関与なし**      | このコンポーネントには渡されていません。                                 |

---

## 2. 定義参照 (Definition Reference)

`KeyRemapperPage.tsx` で定義されているすべての Prop Groups です。

| Type Name                   | Source | Included Props                                           | Status |
| :-------------------------- | :----- | :------------------------------------------------------- | :----: |
| **`LayerState`**            | Page   | `layers`, `layerId`                                      |   ✅   |
| **`LayerActions`**          | Page   | `setLayerId`, `addLayer`, `removeLayer`, `reorderLayers` |   ✅   |
| **`RemapActions`**          | Page   | `toggleActive`, `enableRemap`, `disableRemap`            |   ✅   |
| **`MappingActions`**        | Page   | `saveMapping`, `removeMapping`                           |   ✅   |
| **`GlobalSettingsControl`** | Page   | `updateGlobalSettings`                                   |   ✅   |
| **`LayerStackControl`**     | Page   | `stack`, `refresh`, `resetToLayer`                       |   ✅   |
| **`LogState`**              | Page   | `logs`                                                   |   ✅   |

---

## 3. 統合フロー特定 (Master Prop Flow Matrix)

### A. Layer Management Flow

`LayerState` と `LayerActions` の伝播状況です。
`Editor` (KeyEditorForm) でグループが活用されていない(🧩)点が目立ちます。

| Prop / Object            | KeyRemapperPage | KeyRemapSection | LayerTabs | KeyboardGrid | KeyEditorForm | LayerStatusPanel |
| :----------------------- | :-------------: | :-------------: | :-------: | :----------: | :-----------: | :--------------: |
| **[Group] LayerState**   |      🆕📦       |       🎁        |   🔨🔥    |      🎁      |      ➖       |        ➖        |
| `layerId`                |        ∈        |        ∈        |    🔥     |      ∈       |     🧩🔥      |        ➖        |
| `layers`                 |        ∈        |        ∈        |    🔥     |      ∈       |     🧩🔥      |        ➖        |
| **[Group] LayerActions** |      🆕📦       |       🎁        |   🔨🔥    |      ➖      |      ➖       |        ➖        |
| `setLayerId`             |        ∈        |        ∈        |    🔥     |      ➖      |      ➖       |        ➖        |
| `addLayer`               |        ∈        |        ∈        |    🔥     |      ➖      |      ➖       |        ➖        |
| `removeLayer`            |        ∈        |        ∈        |    🔥     |      ➖      |      ➖       |        ➖        |
| `reorderLayers`          |        ∈        |        ∈        |    🔥     |      ➖      |      ➖       |        ➖        |
| **[Derived] Layer Data** |                 |                 |           |              |               |                  |
| `availableLayers`        |       🆕        |       ➖        |    ➖     |      ➖      |      ➖       |       🧩🔥       |
| `stack`                  |       🆕        |       ➖        |    ➖     |      ➖      |      ➖       |       🧩🔥       |

### B. Mapping & Remap Actions

リマップ操作 (`MappingActions`) と リマップ機能制御 (`RemapActions`) です。

| Prop / Object              | KeyRemapperPage | KeyRemapSection | LayerTabs | KeyboardGrid | KeyEditorForm | LayerStatusPanel |
| :------------------------- | :-------------: | :-------------: | :-------: | :----------: | :-----------: | :--------------: |
| **[Group] MappingActions** |      🆕📦       |       🎁        |    ➖     |      🎁      |      ➖       |        ➖        |
| `saveMapping`              |        ∈        |        ∈        |    ➖     |      ∈       |     🧩🔥      |        ➖        |
| `removeMapping`            |        ∈        |        ∈        |    ➖     |      ∈       |     🧩🔥      |        ➖        |
| **[Group] RemapActions**   |      🆕📦       |       🎁        |    ➖     |      ➖      |      ➖       |        ➖        |
| `disableRemap`             |        ∈        |       🔥        |    ➖     |      ➖      |      ➖       |        ➖        |
| `enableRemap`              |        ∈        |       🔥        |    ➖     |      ➖      |      ➖       |        ➖        |
| `toggleActive`             |        ∈        |       ➖        |    ➖     |      ➖      |      ➖       |        ➖        |

### C. UI Configuration (Individual)

グループ化されず、バケツリレー(🚌)されている UI 状態です。
コンテキスト化(`Context`)の有力な候補です。

| Prop Name           | KeyRemapperPage | KeyRemapSection | TriggerTabs | KeyboardGrid | KeyButton | KeyEditorForm |
| :------------------ | :-------------: | :-------------: | :---------: | :----------: | :-------: | :-----------: |
| `layout`            |       🆕        |       🚌        |     ➖      |     🚌🔥     |    🔥     |     🧩🔥      |
| `keyboardLayout`    |       🆕        |       🚌        |     ➖      |     🚌🔥     |    ➖     |     🧩🔥      |
| `bindings`          |       🆕        |       🚌        |     ➖      |     🚌🔥     |    🔥     |      ➖       |
| `selectedTrigger`   |       🆕        |      🚌🔥       |     🔥      |     🚌🔥     |    🔥     |     🧩🔥      |
| `settingsModalOpen` |      🆕🔥       |       ➖        |     ➖      |      ➖      |    ➖     |      ➖       |
| `editingKey`        |      🆕🔥       |       🚌        |     ➖      |      ➖      |    ➖     |      🔥       |

### D. Event Handlers (Individual)

個別に渡されているイベントハンドラです。

| Prop Name         | KeyRemapperPage | KeyRemapSection | TriggerTabs | KeyboardGrid | LayoutToggle |
| :---------------- | :-------------: | :-------------: | :---------: | :----------: | :----------: |
| `onLayoutToggle`  |       🆕        |       🚌        |     ➖      |      ➖      |      🔥      |
| `onTriggerChange` |       🆕        |       🚌        |     🔥      |      ➖      |      ➖      |
| `setEditingKey`   |       🆕        |       🚌        |     ➖      |      🔥      |      ➖      |

### E. App Header Control

アプリケーションヘッダーに渡される状態と操作です。

| Prop Name            | KeyRemapperPage | AppHeader |
| :------------------- | :-------------: | :-------: |
| `isActive`           |       🆕        |    🔥     |
| `simpleMode`         |       🆕        |    🔥     |
| `onOpenSettings`     |       🆕        |    🔥     |
| `onToggleActive`     |       🆕        |    🔥     |
| `onToggleSimpleMode` |       🆕        |    🔥     |

### F. Pressed Keys Panel

押下中のキーを表示するパネルです。

| Prop Name | KeyRemapperPage | PressedKeysPanel |
| :-------- | :-------------: | :--------------: |
| `layout`  |       🆕        |        🔥        |

### G. Global Settings

グローバル設定の管理です。

| Prop Name                | KeyRemapperPage | GlobalSettingsForm | KeyEditorForm |
| :----------------------- | :-------------: | :----------------: | :-----------: |
| `globalSettings`         |       🆕        |         🔥         |      ➖       |
| `updateGlobalSettings`   |       🆕        |         🔥         |      ➖       |
| `defaultHoldThresholdMs` |       ➖        |         ➖         |     🧩🔥      |
| `defaultTapIntervalMs`   |       ➖        |         ➖         |     🧩🔥      |

### H. Log Management

キーイベントログの管理です。

| Prop Name | KeyRemapperPage | LogList |
| :-------- | :-------------: | :-----: |
| `logs`    |       🆕        |   🔥    |

### I. Key Editor Modal

キーエディターモーダルに渡される props です。

| Prop Name  | KeyRemapperPage | KeyEditorForm |
| :--------- | :-------------: | :-----------: |
| `onClose`  |       🆕        |      🔥       |
| `onRemove` |       🆕        |      🔥       |
| `onSave`   |       🆕        |      🔥       |
| `targetVk` |       🆕        |      🔥       |

---

## 4. 改善提案 (Refactoring Plan)

このマトリクスに基づく具体的な改善アクションです。

### 優先度高: Grouping の適用

- **Fix-005: `KeyEditorForm` への `LayerState` 適用 (Cancelled)**
  - 理由: 末端コンポーネントでの使用であり、Grouping のメリットがないため取りやめ。
- **Fix-006: `LayerStatusPanel` への `LayerStackControl` 適用**
  - 現状: `stack`, `onRefresh`, `onResetToLayer` を個別に受け取っている (🧩)。
  - 修正: `LayerStackControl` 型を Page で定義済みなので、これをそのまま渡す形にする。

### 検討事項: Context の導入

`KeyRemapSection` での `🚌` (Bus/Drill) が多いため、以下の状態は Context API での提供を検討する価値があります。

- `LayoutContext`: `layout`, `keyboardLayout`, `onLayoutToggle`
- `RemapContext`: `bindings`, `selectedTrigger`

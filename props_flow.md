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

| Type Name                   | Source          | Included Props                                           | Status |
| :-------------------------- | :-------------- | :------------------------------------------------------- | :----: |
| **`LayerState`**            | KeyRemapSection | `layers`, `layerId`                                      |   ✅   |
| **`LayerActions`**          | KeyRemapSection | `setLayerId`, `addLayer`, `removeLayer`, `reorderLayers` |   ✅   |
| **`RemapActions`**          | KeyRemapSection | `toggleActive`, `enableRemap`, `disableRemap`            |   ✅   |
| **`MappingActions`**        | KeyRemapperPage | `saveMapping`, `removeMapping`                           |   ✅   |
| **`GlobalSettingsControl`** | KeyRemapSection | `updateGlobalSettings`                                   |   ✅   |
| **`LayerStackControl`**     | KeyRemapSection | `stack`, `refresh`, `resetToLayer`                       |   ✅   |
| **`LogState`**              | KeyRemapSection | `logs`                                                   |   ✅   |

---

## 3. Master Propagation Matrix（パス別・全体伝播）

コンポーネントのツリー構造に基づき、論理的な伝播パスごとにプロップスの流れを可視化します。
直前の親から受け取り、自分は使用せず、直下の子へ渡す場合のみ **🚌 (Drill)** を使用します。

### A. Main View Path

`KeyRemapperPage` → `KeyRemapSection` → (`LayerTabs`, `KeyboardGrid` → `KeyButton`)

| Prop / Group               | Page | Section | Tabs | Grid | Button | 備考                   |
| :------------------------- | :--: | :-----: | :--: | :--: | :----: | :--------------------- |
| **[Group] LayerState**     |  🆕  |   🎁    | 🔥🔨 |  🎁  |   ➖   |                        |
| **[Group] LayerActions**   |  🆕  |   🎁    | 🔥🔨 |  ➖  |   ➖   |                        |
| **[Group] MappingActions** | 🆕📦 |   🎁    |  ➖  |  🎁  |   ➖   |                        |
| **[Group] RemapActions**   |  🆕  |   🎁    |  ➖  |  ➖  |   ➖   |                        |
| `layout`                   |  🆕  |   🚌    |  ➖  |  🚌  |   🔥   |                        |
| `keyboardLayout`           |  🆕  |   🚌    |  ➖  |  🚌  |   ➖   | Grid で使用            |
| `bindings`                 |  🆕  |   🚌    |  ➖  |  🔥  |   ➖   |                        |
| `selectedTrigger`          |  🆕  |   🔥    |  ➖  |  🔥  |   🔥   | 全階層で使用           |
| `editingKey`               |  🆕  |   🚌    |  ➖  |  ➖  |   ➖   | Editor 起動条件        |
| `onLayoutToggle`           |  🆕  |   🚌    |  ➖  |  ➖  |   ➖   | Section 内 UI で使用   |
| `onTriggerChange`          |  🆕  |   🚌    |  ➖  |  ➖  |   ➖   | Section 内 UI で使用   |
| `setEditingKey`            |  🆕  |   🚌    |  ➖  |  🔥  |   ➖   | Grid 内の Click で使用 |

### B. Editor Modal Path

`KeyRemapperPage` → `KeyEditorForm` → (`ActionSettingsSection` → `RemapKeySection`, `TimingSettingsSection`)

| Prop / Group              | Page | Editor | ActionS | RemapK | TimingS | 備考                      |
| :------------------------ | :--: | :----: | :-----: | :----: | :-----: | :------------------------ |
| `targetVk`                |  🆕  |   🔥   |   🚌    |   🔥   |   ➖    |                           |
| `layerId`                 |  🆕  |   🔥   |   🚌    |   ➖   |   ➖    |                           |
| `layout`                  |  🆕  |   🔥   |   🚌    |   🚌   |   ➖    |                           |
| `layers`                  |  🆕  |   🔥   |   🚌    |   ➖   |   ➖    |                           |
| `trigger`                 |  🆕  |   🔥   |   ➖    |   ➖   |   ➖    |                           |
| `defaultHoldThresholdMs`  |  🆕  |   🔥   |   🚌    |   ➖   |   🚌    |                           |
| `defaultTapIntervalMs`    |  🆕  |   🔥   |   🚌    |   ➖   |   🚌    |                           |
| **KeyEditorActions** (UI) |  ➖  |  🆕📦  |   🎁    |  🔥🔨  |   ➖    | Editor 内で生成           |
| **MouseState / Handlers** |  ➖  |  🆕📦  |   🎁    |   ➖   |   ➖    | MousePositionInput で使用 |

### C. Utility & Peripheral Flow

`KeyRemapperPage` → 各種独立コンポーネント

| Prop / Group                | Page | Header | StatusP | LogList | GlobalF | PressedK |
| :-------------------------- | :--: | :----: | :-----: | :-----: | :-----: | :------: |
| `isActive`                  |  🆕  |   🔥   |   ➖    |   ➖    |   ➖    |    ➖    |
| `simpleMode`                |  🆕  |   🔥   |   ➖    |   🔥    |   ➖    |    ➖    |
| **LayerStackControl**       |  🆕  |   ➖   |  🔥🔨   |   ➖    |   ➖    |    ➖    |
| **LogState**                |  🆕  |   ➖   |   ➖    |  🔥🔨   |   ➖    |    ➖    |
| **GlobalSettingsControl**   |  🆕  |   ➖   |   ➖    |   ➖    |   🎁    |    ➖    |
| `globalSettings` (Value)    |  🆕  |   ➖   |   ➖    |   ➖    |   🔥    |    ➖    |
| `availableLayers` (Derived) |  🆕  |   ➖   |   🔥    |   ➖    |   ➖    |    ➖    |
| `layout`                    |  🆕  |   ➖   |   ➖    |   ➖    |   ➖    |    🔥    |

---

## 4. Group Lifecycle Matrix（グループの変遷）

グループ・オブジェクトがどこで「箱詰め」され、どこで「解体」されるかの生涯を追跡します。

| Group Name              | 🆕📦 (生成箇所)            | 🎁 (運搬経路)                     | 🔨 (解体・展開箇所)                       |
| :---------------------- | :------------------------- | :-------------------------------- | :---------------------------------------- |
| **`LayerState`**        | `useLayerState` (Hook)     | `KeyRemapSection`, `KeyboardGrid` | `LayerTabs`, `KeyButton`, `KeyEditorForm` |
| **`LayerActions`**      | `useLayerState` (Hook)     | `KeyRemapSection`                 | `LayerTabs`                               |
| **`MappingActions`**    | `KeyRemapperPage` (Manual) | `KeyRemapSection`, `KeyboardGrid` | `KeyButton`, `KeyEditorForm`              |
| **`RemapActions`**      | `useRemapControl` (Hook)   | `KeyRemapSection`                 | `KeyRemapSection` (enable/disable)        |
| **`LayerStackControl`** | `useLayerStack` (Hook)     | (Direct)                          | `LayerStatusPanel`                        |
| **`LogState`**          | `useKeyEventLog` (Hook)    | (Direct)                          | `LogList`                                 |

---

## 5. Leaf Decomposition Flow（末端解体マトリクス）

末端コンポーネントでのプロップス受信・解体・使用の詳細です。

### LayerTabs

| Prop (Individual/Member) | Source (KeyRemapSection) | Dest (LayerTabs) |
| :----------------------- | :----------------------: | :--------------: |
| **LayerState** (Group)   |            🎁            |        🔨        |
| ∟ `layerId`              |            ∈             |        🔥        |
| ∟ `layers`               |            ∈             |        🔥        |
| **LayerActions** (Group) |            🎁            |        🔨        |
| ∟ `setLayerId`           |            ∈             |        🔥        |
| ...                      |           ...            |       ...        |

### KeyButton

| Prop (Individual/Member) |  Source (KeyboardGrid)   | Dest (KeyButton) |
| :----------------------- | :----------------------: | :--------------: |
| `layout`                 |            🚌            |        🔥        |
| `selectedTrigger`        |            🚌            |        🔥        |
| `layerId`                |   ∈ (from LayerState)    |        🔥        |
| `bindings`               | ∈ (from bindings record) |        🔥        |

---

## 6. 改善提案 (Refactoring Plan)

この詳細な追跡に基づく、今後の改善アクションです。

- **Fix-006: `LayerStatusPanel` への `LayerStackControl` 適用**
  - 現状: `stack`, `onRefresh` 等を個別に渡している。
  - 修正: `LayerStackControl` をそのまま渡して内部で解体（🔨）する。
- **検討: UI Context の導入**
  - `layout`, `selectedTrigger` など、多くのパスに登場するプロップスを Context API へ移行し、Drill（🚌）を撲滅する。

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

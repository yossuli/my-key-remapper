# Props Flow Reference: Key Editor Modal

このドキュメントは、`KeyEditorForm` をルートとするエディタモーダル内のプロップス伝播フローを可視化したものです。全てのプロップスの生成（Define）から最終消費（Use）までを網羅しています。

## 1. 凡例 (Legend)

| 記号 | 英語 (English) | 日本語 (Japanese) | 説明                                                                       |
| :--: | :------------- | :---------------- | :------------------------------------------------------------------------- |
|  🆕  | **Define**     | **定義・生成**    | このコンポーネントまたはフックで新しい値やインスタンスが生成されています。 |
|  📦  | **Pack**       | **グループ化**    | 伝搬効率や可読性のために、個別の値をオブジェクトにまとめています。         |
|  🎁  | **Pass Group** | **グループ渡し**  | Group オブジェクトのまま、変更せず子コンポーネントへ渡しています。         |
|  ∈   | **In Group**   | **グループ内包**  | 親の Group オブジェクトに含まれて渡されています。                          |
|  🔨  | **Unpack**     | **解体・展開**    | Group オブジェクトから値を分割代入 (Destructure) しています。              |
|  🧩  | **Individual** | **個別扱い**      | グループ化されず、個別のプロップスとして扱われています。                   |
|  📡  | **Context**    | **コンテキスト**  | React Context Provider/Consumer を使用して暗黙的に受け渡ししています。     |
|  🚌  | **Drill**      | **通過 (Drill)**  | コンポーネント自身は使用せず、そのまま子へ渡しています (Prop Drilling)。   |
|  🔥  | **Use**        | **使用**          | ロジックやレンダリングで実際に値を使用しています。                         |
|  ➖  | **None**       | **関与なし**      | この項目とは無関係、または内部で完結しています。                           |

---

## 2. 定義参照 (Definition Reference)

`KeyEditorForm.tsx` で定義・管理されている Prop Groups です。

| Type Name                 | Source        | Included Props                                                                                              | Status |
| :------------------------ | :------------ | :---------------------------------------------------------------------------------------------------------- | :----: |
| **`KeyEditorActions`**    | KeyEditorForm | `addHoldKey`, `removeKey`, `resetState`, `handleSave`, `handleRemove`, `clearTargetKeys`                    |   ✅   |
| **`KeyEditorUIHandlers`** | KeyEditorForm | `setShowVkInput`, `setVkInputValue`, `setIsInputFocused`                                                    |   ✅   |
| **`KeyEditorUIState`**    | KeyEditorForm | `showVkInput`, `vkInputValue`                                                                               |   ✅   |
| **`MouseHandlers`**       | KeyEditorForm | `setMouseX`, `setMouseY`, `setMouseButton`, `setClickCount`, `setCursorReturnDelayMs`, `onGetMousePosition` |   ✅   |
| **`MouseState`**          | KeyEditorForm | `x`, `y`, `button`, `clickCount`, `isCapturing`, `countdown`, `cursorReturnDelayMs`                         |   ✅   |

---

## 3. Propagation Matrix by Path

データの流れ（Path）ごとに表を分割しています。各表のプロップスは、必ずそのパス内のいずれかのコンポーネントで使用（🔥）されます。

### Path A: Timing & Modal Control Flow

`KeyEditorForm` から `TriggerTabs` および `TimingSettingsSection` へ向かうフローです。
ここには `ActionSettingsSection` にしか行かないプロップスは含みません。

| Prop / Group             | KeyEditorForm | TriggerTabs | TimingSettingsSection | 備考                                     |
| :----------------------- | :-----------: | :---------: | :-------------------: | :--------------------------------------- |
| `selectedTrigger`        |      🆕       |     🔥      |          🛑           | Tabs 制御(🔥) TimingS は受け取るが未使用 |
| `onTriggerChange`        |      🆕       |     🔥      |          ➖           | Tabs 制御用                              |
| `holdThresholdMs`        |      🆕       |     ➖      |          🔥           |                                          |
| `setHoldThresholdMs`     |      🆕       |     ➖      |          🔥           |                                          |
| `tapIntervalMs`          |      🆕       |     ➖      |          🔥           |                                          |
| `setTapIntervalMs`       |      🆕       |     ➖      |          🔥           |                                          |
| `defaultHoldThresholdMs` |      🆕       |     ➖      |          🔥           |                                          |
| `defaultTapIntervalMs`   |      🆕       |     ➖      |          🔥           |                                          |
| `setIsInputFocused`      |      🆕       |     ➖      |          🔥           | TimingS へは個別渡し                     |

### Path B: Action Configuration Flow

`KeyEditorForm` から `ActionSettingsSection` を経由して、その子孫（Settings Leafs）へ向かうフローです。
`ActionSettingsSection` はこれらのプロップスを中継（Drill）または使用します。

| Prop / Group                    | KeyEditorForm | ActionSettingsSection | ActionSelector | RemapKeySection | MousePositionInput | LayerSelector | 備考                     |
| :------------------------------ | :-----------: | :-------------------: | :------------: | :-------------: | :----------------: | :-----------: | :----------------------- |
| `actionType`                    |      🆕       |          🔥           |      🆕📡      |       ➖        |         ➖         |      ➖       | Selector へ Context 提供 |
| `setActionType`                 |      🆕       |          🔥           |       🔥       |       ➖        |         ➖         |      ➖       | Selector 切替            |
| `selectedTrigger`               |      🆕       |          🔥           |       🔥       |       ➖        |         ➖         |      ➖       | ActionS 表示制御         |
| **[Group] KeyEditorActions**    |     🆕📦      |          🎁           |       ➖       |       ∈🔥       |         ➖         |      ➖       |                          |
| **[Group] KeyEditorUIHandlers** |     🆕📦      |          🎁           |       ➖       |       ∈🔥       |        ∈🔥         |      ➖       |                          |
| **[Group] KeyEditorUIState**    |     🆕📦      |          🎁           |       ➖       |       ∈🔥       |         ➖         |      ➖       |                          |
| **[Group] MouseHandlers**       |     🆕📦      |          🎁           |       ➖       |       ➖        |        ∈🔥         |      ➖       |                          |
| **[Group] MouseState**          |     🆕📦      |         🎁🔨          |       ➖       |       ➖        |        🔨🔥        |      ➖       | MouseI へは解体・再構成  |
| `targetVk`                      |      🧩       |          🚌           |       ➖       |       🔥        |         ➖         |      ➖       |                          |
| `newTargetKeys`                 |      🆕       |          🚌           |       ➖       |       🔥        |         ➖         |      ➖       |                          |
| `layout`                        |      🧩       |          🚌           |       ➖       |       🔥        |         ➖         |      ➖       |                          |
| `layers`                        |      🧩       |          🚌           |       ➖       |       ➖        |         ➖         |      🔥       |                          |
| `selectedLayerId`               |      🆕       |          🚌           |       ➖       |       ➖        |         ➖         |      🔥       |                          |
| `setSelectedLayerId`            |      🆕       |          🚌           |       ➖       |       ➖        |         ➖         |      🔥       |                          |

---

## 4. Leaf Decomposition Detail

### RemapKeySection

- **Source**: `ActionSettingsSection`
- **Uses**:
  - `targetVk`, `newTargetKeys`, `layout` (Page/Hook 由来)
  - `KeyEditorActions` (全機能)
  - `KeyEditorUIState` (VK 入力)
  - `KeyEditorUIHandlers` (入力制御)

### MousePositionInput

- **Source**: `ActionSettingsSection`
- **Uses**:
  - `MouseHandlers` (座標更新, キャプチャ)
  - `KeyEditorUIHandlers` (フォーカス制御)
  - `captureState` (Countdown 表示)
  - `mousePosition` (座標表示)

### LayerSelector

- **Source**: `ActionSettingsSection`
- **Uses**:
  - `layers` (選択肢表示)
  - `selectedLayerId` (選択状態)
  - `onLayerChange` (as `setSelectedLayerId`)

### TimingSettingsSection

- **Source**: `KeyEditorForm` (Direct Child)
- **Uses**:
  - `holdThresholdMs`, `setHoldThresholdMs`, `defaultHoldThresholdMs`
  - `tapIntervalMs`, `setTapIntervalMs`, `defaultTapIntervalMs`
  - `setIsInputFocused` (個別受け取り)

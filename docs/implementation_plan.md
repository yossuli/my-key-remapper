# Windows Key Remapper Implementation Plan

このプロジェクトでは、Electron と TypeScript を使用して、Windows 用のキーボードリマップアプリケーションを作成します。
低レベルなキーボードフック（`WH_KEYBOARD_LL`）を実現するために、`koffi`（FFI ライブラリ）を使用して Windows API（`User32.dll`）に直接アクセスします。

## User Review Required

> [!WARNING] > **クロスプラットフォームの制限**: 開発環境は Linux ですが、このアプリケーションは**Windows 専用**です。
> `User32.dll` などの Windows 固有の API を使用するため、Linux 環境ではアプリの起動とビルド確認までしか行えません。
> 実際の動作確認は Windows 環境で行う必要があります。

## Proposed Changes

### Project Structure (Electron + Vite + React + TypeScript)

#### [NEW] [Project Config]

- `package.json`: Electron, Vite, Koffi, TailwindCSS などの依存関係定義
- `tsconfig.json`: TypeScript 設定
- `vite.config.ts`: Vite 設定
- `electron.vite.config.ts`: Electron 用の Vite 設定

### Core Logic (Main Process)

#### [NEW] [Native Hook Manager](src/main/keyboard-hook.ts)

- `koffi` を使用して `User32.dll` をロード
- `SetWindowsHookEx` でグローバルキーボードフックを設置
- キーイベントをインターセプトし、設定されたマッピングに基づいて判定
- マッピング対象の場合は元の入力をブロックし、`SendInput` で新しいキーイベントを送信
- **注**: FFI のコールバックはパフォーマンスに影響するため、最適化が必要です。

### UI (Renderer Process)

#### [NEW] [UI Components](src/renderer/App.tsx)

- マッピングリストの表示
- 新規マッピング追加画面（キー入力のキャプチャ）
- 有効/無効のトグルスイッチ
- デザインはモダンでリッチな UI（TailwindCSS + Framer Motion 想定）

## Verification Plan

### Automated Tests

- `npm run build`: ビルドが正常に通ることを確認
- `npm run type-check`: TypeScript の型チェック

### Manual Verification (User)

- Windows 環境でアプリを起動
- キーリマップ設定を追加（例: A -> B）
- メモ帳などで A を押したときに B が入力されるか確認
- アプリ終了時にフックが解除され、通常の入力に戻るか確認

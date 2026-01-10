# Windows Key Remapper (Electron + Typescript)

Windows 用のキーボードリマップアプリケーションです。`User32.dll` の API を直接利用してグローバルキーフック（`WH_KEYBOARD_LL`）を実現しています。

## 開発状況 (Development Status)

現在、**Minimal MVP** の段階です。

- [x] Electron + TypeScript + Vite プロジェクト構築
- [x] `koffi` (FFI) による `SetWindowsHookEx` の実装
- [x] キー入力を検知してレンダラープロセスに通知する仕組み
- [ ] 実際のキーブロックとリマップ送信 (`SendInput`) の実装（未着手）
- [ ] UI の実装（現在はログ表示のみ）

## Windows 環境への移行ガイド (Handover Notes)

Linux 環境での初期開発を行いましたが、クロスコンパイル（Windows バイナリ作成）に `wine` が必要であり、環境の制約上ビルドが完了しておりません。
ソースコードは Windows 環境で動作するように記述されていますが、**Windows マシン上でのビルドと動作検証が必要**です。

### 開発の始め方

1. **必須要件**:

   - Windows 10/11
   - Node.js (v16+)

2. **セットアップ**:

   ```bash
   npm install
   ```

3. **開発モード起動**:

   ```bash
   npm run dev
   ```

   アプリが起動し、キーボードを押すと画面上のリストにキーコードが表示されれば成功です。

4. **ビルド**:
   ```bash
   npm run build:win
   ```
   `dist/win-unpacked/WindowsKeyRemapper.exe` が生成されます。

### ディレクトリ構造とドキュメント

詳細なドキュメントは `docs/` ディレクトリにあります。

- [実装計画書 (Implementation Plan)](docs/implementation_plan.md): 全体のアーキテクチャと計画
- [タスクリスト (Tasks)](docs/tasks.md): 完了したタスクと残作業
- [検証ガイド (Walkthrough)](docs/walkthrough.md): 動作確認の手順

### 技術的な注意点

- **Main Process (`src/main/index.ts`)**: ここに `koffi` を使った Native Hook のロジックがあります。
- `process.platform !== 'win32'` の場合、フック処理はスキップされるようになっています。
- **管理者権限**: `SetWindowsHookEx` や `SendInput` は、一部のゲームや特権アプリに対しては管理者権限で実行しないと機能しない場合があります。開発中は通常権限で問題ありませんが、将来的に考慮が必要です。

---

Author: Antigravity Agent
Date: 2025-12-10

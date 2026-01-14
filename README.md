# Windows Key Remapper (Electron + TypeScript)

Windows 用の高度なキーボードリマップアプリケーションです。`User32.dll` の API を直接利用したグローバルキーフック（`WH_KEYBOARD_LL`）により、OS レベルでの柔軟なキーカスタマイズを実現しています。

## 開発状況 (Development Status)

現在、**Feature-rich Beta** 段階です。基本的なリマップに加え、レイヤー、マクロ、マウス自動化などの実用的な機能が実装されています。

- [x] Electron + TypeScript + Vite プロジェクト基盤
- [x] `koffi` (FFI) による低レイヤーグローバルキーフック
- [x] 高度なリマップエンジン（レイヤー、マルチトリガー対応）
- [x] シーケンシャルマクロ（キーシーケンス、ディレイ、マウス操作）
- [x] モダンな UI エディタ（React + Framer Motion + Shadcn/UI）
- [x] 設定の永続化と自動読み込み

## 主要な機能 (Core Features)

- **レイヤーベースのリマップ**: 複数のレイヤー（Base, Shift, Fn 等）を定義し、キー入力を動的に切り替え。トグル切り替えやモーメンタリ切り替え（押しっぱなしの間有効）に対応。
- **マルチトリガー**: 単押し（Tap）、長押し（Hold）、二度押し（Double Tap）の使い分け。
- **強力なマクロ**: キー入力のシーケンス、指定ミリ秒の待機、マウスクリック/移動、カーソル復帰などを組み合わせた自動化。
- **マウス自動化**: キー操作によるカーソルの絶対座標移動やクリック。操作後のカーソル位置復帰機能（Cursor Return）。
- **リピート詳細設定**: 長押し時のキーリピート開始遅延や間隔をキーごとにカスタマイズ可能。
- **モダン UI/UX**: 直感的なマクロエディタ、レイヤー管理、リアルタイムなキー入力プレビュー。

## 技術スタック (Tech Stack)

- **Runtime**: [Electron](https://www.electronjs.org/)
- **Frontend**: [React](https://react.dev/), [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/), [Shadcn/UI](https://ui.shadcn.com/)
- **Animation**: [Framer Motion](https://www.framer.com/motion/)
- **FFI**: [Koffi](https://koffi.dev/) (Native API Calling)
- **Code Quality**: [Ultracite](https://github.com/ultracite-js/ultracite) (Biome-based linter/formatter)

## クイックスタート

### 必須要件

- Windows 10/11
- Node.js (v20+)

### セットアップ

```powershell
npm install
```

### 開発モード起動

```powershell
npm run dev
```

### ビルド

```powershell
npm run build:win
```

`dist/win-unpacked/WindowsKeyRemapper.exe` が生成されます。

## 設定データの保存場所

本アプリの設定や作成したマクロは、以下のディレクトリに JSON 形式で保存されます。バックアップや設定のリセット（ファイルの削除）の際にご参照ください。

- **場所**: `%APPDATA%\my-key-remapper`
- **主要なファイル**:
  - `key-mapping-config-v2.json`: キーリマップ、レイヤー、グローバル設定
  - `key-mapping-macros-v2.json`: 作成したマクロの定義

## ドキュメント

- [AI 行動ルール (RULE.md)](.agent/RULE.md): 開発プロセスと規約

---

**Author**: Antigravity Agent & Yossuli
**License**: MIT

/**
 * 型定義の木メタファー構造
 *
 * roots/    - Pages → Templates/Organisms 接続
 * trunk/    - Organisms 内・Organisms → Molecules 接続
 * branches/ - Molecules → Atoms 接続
 * leaves/   - (必要に応じて)
 */

// branches
// biome-ignore lint/performance/noBarrelFile: 型定義のre-export用
export * from "@/types/tree/branches";

// trunk
export * from "@/types/tree/trunk";

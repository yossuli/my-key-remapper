export interface KeyDefinition {
  id: number;
  label: string;
  vk: number | [number, number];
  /** 幅（1 = 標準キー） */
  width?: number;
  /** CSSグリッドのエリア指定用 */
  code?: string;
}

export interface SimpleKeyboardProps {
  mappings: Map<number, number>;
  onKeyClick: (vk: number) => void;
}

export type LayoutType = "US" | "JIS";

export type LayerType = "base" | "custom";

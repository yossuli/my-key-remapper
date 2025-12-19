import type { ReactNode } from "react";
import { X } from "lucide-react";

interface WithRemoveBadgeProps {
  /** 削除時のコールバック */
  onRemove: () => void;
  /** ラップするコンテンツ */
  children: ReactNode;
  /** ボタンのラベル（アクセシビリティ用） */
  label?: string;
}

/**
 * 右上に削除バッジを表示するラッパーコンポーネント
 */
export function WithRemoveBadge({
  onRemove,
  children,
  label = "削除",
}: WithRemoveBadgeProps) {
  return (
    <div className="group relative">
      {children}
      <button
        aria-label={label}
        className="-top-1 -right-1 absolute hidden rounded-full bg-destructive p-0.5 text-destructive-foreground group-hover:block"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        type="button"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}

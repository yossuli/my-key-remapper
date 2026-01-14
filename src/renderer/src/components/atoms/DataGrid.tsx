import React from "react";
import { cn } from "@/utils/cn";

/**
 * [Workflow-029] に基づく型安全なグリッドリスト
 * ヘッダーの要素数とデータ行の要素数を型レベルで同期させます。
 */
interface DataGridProps<T, H extends readonly React.ReactNode[]> {
  /**
   * リストに表示するデータ配列
   */
  value: T[];
  /**
   * ヘッダー定義。
   * この配列の長さが、children が返すタプルの長さとして強制されます。
   */
  headers: H;
  /**
   * データ行のレンダラー。
   * headers と同じ長さの ReactNode のタプルを返す必要があります。
   */
  children: (item: T) => { [K in keyof H]: React.ReactNode };
  /**
   * Grid Template Columns 定義
   * 例: "[1fr_6rem]"
   */
  gridCols: string;
  className?: string;
  /**
   * 最初の子要素がホバーされたときに、行全体の背景色をハイライトするか
   */
  highlightOnFirstChildHover?: boolean;
}

export const DataGrid = <
  T extends { id: string | number },
  H extends readonly React.ReactNode[],
>({
  value,
  headers,
  children,
  gridCols,
  className,
  highlightOnFirstChildHover = false,
}: DataGridProps<T, H>) => {
  return (
    <div
      className={cn(
        "grid w-full overflow-hidden rounded-md border border-border bg-background",
        className
      )}
      style={{
        gridTemplateColumns: gridCols.startsWith("[") ? undefined : gridCols,
      }}
    >
      {/* Header */}
      <div className="col-span-full grid grid-cols-subgrid items-center border-border border-b bg-muted px-4 py-3 text-muted-foreground text-xs uppercase">
        {headers.map((header, i) => (
          // ヘッダーは静的なのでインデックスをキーにしても安全
          <React.Fragment key={i}>{header}</React.Fragment>
        ))}
      </div>

      {/* Body */}
      <div className="col-span-full grid grid-cols-subgrid divide-y divide-border">
        {value.map((item) => {
          const cells = children(item);
          return (
            <div
              className={cn(
                "col-span-full grid grid-cols-subgrid items-center px-4 py-3 transition-colors",
                highlightOnFirstChildHover &&
                  "has-[>*:first-child:hover]:bg-muted/50"
              )}
              key={item.id}
            >
              {/* Cells */}
              {Array.isArray(cells) &&
                cells.map((cell, i) => (
                  <React.Fragment key={i}>{cell}</React.Fragment>
                ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

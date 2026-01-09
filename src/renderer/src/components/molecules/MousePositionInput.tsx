import type { ReactNode } from "react";
import { useScreenSize } from "../../hooks/useScreenSize";
import { Button } from "../atoms/Button";
import { Input } from "../atoms/Input";
import { Center, VStack } from "../template/Flex";

interface MousePositionInputProps {
  mouseX: number;
  mouseY: number;
  isCapturing: boolean;
  countdown: number;
  onMouseXChange: (value: number) => void;
  onMouseYChange: (value: number) => void;
  onGetPosition: () => void;
  setFocused: (focused: boolean) => void;
  idPrefix?: string;
  children?: ReactNode;
}

/**
 * マウス座標入力コンポーネント
 * X・Y座標の入力フィールドと位置取得ボタンを提供
 */
export function MousePositionInput({
  mouseX,
  mouseY,
  isCapturing,
  countdown,
  onMouseXChange,
  onMouseYChange,
  onGetPosition,
  setFocused,
  idPrefix = "mouse",
  children,
}: MousePositionInputProps) {
  const screenSize = useScreenSize();

  // biome-ignore lint/style/noMagicNumbers: UI計算用
  const relativeX = screenSize ? (mouseX / screenSize.width) * 100 : 50;
  // biome-ignore lint/style/noMagicNumbers: UI計算用
  const relativeY = screenSize ? (mouseY / screenSize.height) * 100 : 50;
  return (
    <Center>
      <div className="grid w-fit grid-cols-[auto_1fr_auto] items-center gap-4">
        <VStack className="h-full justify-around" gap={2}>
          <Input
            horizontal
            id={`${idPrefix}-x`}
            input-className="w-16 font-mono text-center p-1"
            input-onChange={(e) => onMouseXChange(Number(e.target.value))}
            input-placeholder="0"
            input-type="number"
            input-value={mouseX.toString()}
            label="X"
            setFocused={setFocused}
          />
          <Input
            horizontal
            id={`${idPrefix}-y`}
            input-className="w-16 font-mono text-center p-1"
            input-onChange={(e) => onMouseYChange(Number(e.target.value))}
            input-placeholder="0"
            input-type="number"
            input-value={mouseY.toString()}
            label="Y"
            setFocused={setFocused}
          />
        </VStack>

        <Button
          className="relative flex h-24 flex-col items-center justify-center gap-1"
          disabled={isCapturing}
          onClick={onGetPosition}
          size="lg"
          style={
            // biome-ignore lint/nursery/noLeakedRender: styleプロパティへのundefined渡しはReactで有効
            screenSize
              ? { aspectRatio: `${screenSize.width} / ${screenSize.height}` }
              : undefined
          }
          variant="outline"
        >
          <div className="pointer-events-none absolute inset-2 flex items-center justify-center">
            <div className="relative h-full w-full rounded border border-primary/20">
              <div
                className="-translate-x-1/2 -translate-y-1/2 absolute h-3 w-3 rounded-full bg-primary transition-all duration-200"
                style={{
                  left: `${relativeX}%`,
                  top: `${relativeY}%`,
                }}
              />
            </div>
          </div>
          <span className="relative z-10 font-medium">
            {isCapturing ? `${countdown}秒後` : "位置を取得"}
          </span>
        </Button>

        {children}
      </div>
    </Center>
  );
}

import type { ReactNode } from "react";
import { Button } from "../atoms/Button";
import { Input } from "../atoms/Input";
import { Center, VStack } from "../template/Flex";
import { useScreenSize } from "../../hooks/useScreenSize";

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

  const relativeX = screenSize ? (mouseX / screenSize.width) * 100 : 50;
  const relativeY = screenSize ? (mouseY / screenSize.height) * 100 : 50;
  return (
    <Center>
      <div className="grid grid-cols-[auto_1fr_auto] gap-4 items-center w-fit">
        <VStack gap={2} className="justify-around h-full">
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
          disabled={isCapturing}
          onClick={onGetPosition}
          variant="outline"
          size="lg"
          className="h-24 relative flex flex-col items-center justify-center gap-1"
          style={
            screenSize
              ? { aspectRatio: `${screenSize.width} / ${screenSize.height}` }
              : undefined
          }
        >
          <div className="absolute inset-2 flex items-center justify-center pointer-events-none">
            <div className="relative w-full h-full border border-primary/20 rounded">
              <div
                className="absolute w-3 h-3 bg-primary rounded-full -translate-x-1/2 -translate-y-1/2 transition-all duration-200"
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

import type { ReactNode } from "react";
import { useScreenSize } from "../../../hooks/useScreenSize";
import type {
  MouseCaptureState,
  MouseHandlers,
  MousePosition,
} from "../../../types/tree/branches";
import { Button } from "../../atoms/Button";
import { Input } from "../../atoms/Input";
import { Center, VStack } from "../../template/Flex";

interface MousePositionInputProps {
  mousePosition: MousePosition; // { x, y }
  captureState: MouseCaptureState; // { isCapturing, countdown }
  mouseHandlers: MouseHandlers; // グループのまま受け取る
  setFocused: (focused: boolean) => void;
  idPrefix?: string;
  children?: ReactNode;
}

/**
 * マウス座標入力コンポーネント
 * X・Y座標の入力フィールドと位置取得ボタンを提供
 */
export function MousePositionInput({
  mousePosition,
  captureState,
  mouseHandlers,
  setFocused,
  idPrefix = "mouse",
  children,
}: MousePositionInputProps) {
  const screenSize = useScreenSize();

  const PERCENTAGE_MULTIPLIER = 100;
  const DEFAULT_POSITION_PERCENT = 50;

  const relativeX = screenSize
    ? (mousePosition.x / screenSize.width) * PERCENTAGE_MULTIPLIER
    : DEFAULT_POSITION_PERCENT;
  const relativeY = screenSize
    ? (mousePosition.y / screenSize.height) * PERCENTAGE_MULTIPLIER
    : DEFAULT_POSITION_PERCENT;
  return (
    <Center>
      <div className="grid w-fit grid-cols-[auto_1fr_auto] items-center gap-4">
        <VStack className="h-full justify-around" gap={2}>
          <Input
            horizontal
            id={`${idPrefix}-x`}
            input-className="w-16 font-mono text-center p-1"
            input-onChange={(e) =>
              mouseHandlers.setMouseX(Number(e.target.value))
            }
            input-placeholder="0"
            input-type="number"
            input-value={mousePosition.x.toString()}
            label="X"
            setFocused={setFocused}
          />
          <Input
            horizontal
            id={`${idPrefix}-y`}
            input-className="w-16 font-mono text-center p-1"
            input-onChange={(e) =>
              mouseHandlers.setMouseY(Number(e.target.value))
            }
            input-placeholder="0"
            input-type="number"
            input-value={mousePosition.y.toString()}
            label="Y"
            setFocused={setFocused}
          />
        </VStack>

        <Button
          className="relative flex h-24 flex-col items-center justify-center gap-1"
          disabled={captureState.isCapturing}
          onClick={mouseHandlers.onGetMousePosition}
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
            {captureState.isCapturing
              ? `${captureState.countdown}秒後`
              : "位置を取得"}
          </span>
        </Button>

        {children}
      </div>
    </Center>
  );
}

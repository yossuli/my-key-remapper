import { Button } from "../atoms/Button";
import { Input } from "../atoms/Input";
import { HStack } from "../template/Flex";

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
}: MousePositionInputProps) {
  return (
    <HStack className="items-end justify-center" gap={2}>
      <Input
        id={`${idPrefix}-x`}
        input-className="w-24 font-mono text-center"
        input-onChange={(e) => onMouseXChange(Number(e.target.value))}
        input-placeholder="X"
        input-type="number"
        input-value={mouseX.toString()}
        label="X座標"
        setFocused={setFocused}
      />
      <Input
        id={`${idPrefix}-y`}
        input-className="w-24 font-mono text-center"
        input-onChange={(e) => onMouseYChange(Number(e.target.value))}
        input-placeholder="Y"
        input-type="number"
        input-value={mouseY.toString()}
        label="Y座標"
        setFocused={setFocused}
      />
      <Button
        disabled={isCapturing}
        onClick={onGetPosition}
        variant="outline"
      >
        {isCapturing ? `取得中... ${countdown}秒` : "位置を取得 (3秒後)"}
      </Button>
    </HStack>
  );
}

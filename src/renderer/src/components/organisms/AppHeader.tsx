import { Eye, EyeOff, Keyboard, Power } from "lucide-react";
import { Button } from "../atoms/Button";
import { Icon } from "../atoms/Icon";
import { Text } from "../atoms/Text";
import { HStack, VStack, Box } from "../template/Flex";

interface AppHeaderProps {
  isActive: boolean;
  onToggleActive: () => void;
  /** シンプル表示モード */
  simpleMode?: boolean;
  /** シンプルモード切り替えコールバック */
  onToggleSimpleMode?: () => void;
}

export function AppHeader({
  isActive,
  onToggleActive,
  simpleMode,
  onToggleSimpleMode,
}: AppHeaderProps) {
  const icon = simpleMode ? Eye : EyeOff;
  return (
    <HStack as="header" className="mb-8 justify-between">
      <HStack gap={3}>
        <Box className="rounded-lg bg-primary/10 p-2">
          <Icon className="text-primary" icon={Keyboard} size="lg" />
        </Box>
        <VStack>
          <Text as="h1" weight="bold" size="xl" className="tracking-tight">
            Key Remapper
          </Text>
          <Text variant="muted" size="xs">
            Windows Native Hook
          </Text>
        </VStack>
      </HStack>

      <HStack gap={2}>
        {onToggleSimpleMode ? (
          <Button
            className="gap-2 rounded-full"
            onClick={onToggleSimpleMode}
            variant="ghost"
          >
            <Icon icon={icon} />
            {simpleMode ? "詳細表示" : "シンプル表示"}
          </Button>
        ) : null}
        <Button
          className="gap-2 rounded-full"
          onClick={onToggleActive}
          size="default"
          variant={isActive ? "default" : "destructive"}
        >
          <Icon icon={Power} />
          {isActive ? "Active" : "Disabled"}
        </Button>
      </HStack>
    </HStack>
  );
}

import { Eye, EyeOff, Keyboard, Power, Settings } from "lucide-react";
import { Button } from "../atoms/Button";
import { Icon } from "../atoms/Icon";
import { Text } from "../atoms/Text";
import { Box, HStack, VStack } from "../template/Flex";

interface AppHeaderProps {
  isActive: boolean;
  onToggleActive: () => void;
  /** シンプル表示モード */
  simpleMode?: boolean;
  /** シンプルモード切り替えコールバック */
  onToggleSimpleMode?: () => void;
  /** グローバル設定を開くコールバック */
  onOpenSettings?: () => void;
}

export function AppHeader({
  isActive,
  onToggleActive,
  simpleMode,
  onToggleSimpleMode,
  onOpenSettings,
}: AppHeaderProps) {
  const icon = simpleMode ? Eye : EyeOff;
  return (
    <HStack as="header" className="mb-8 justify-between">
      <HStack gap={3}>
        <Box className="rounded-lg bg-primary/10 p-2">
          <Icon className="text-primary" icon={Keyboard} size="lg" />
        </Box>
        <VStack>
          <Text as="h1" className="tracking-tight" size="xl" weight="bold">
            Key Remapper
          </Text>
          <Text size="xs" variant="muted">
            Windows Native Hook
          </Text>
        </VStack>
      </HStack>

      <HStack gap={2}>
        {onOpenSettings ? (
          <Button
            className="gap-2 rounded-full"
            onClick={onOpenSettings}
            variant="ghost"
          >
            <Icon icon={Settings} />
            グローバル設定
          </Button>
        ) : null}
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

import { Eye, EyeOff, Keyboard, Power } from "lucide-react";
import { Button } from "../atoms/Button";
import { Icon } from "../atoms/Icon";

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
    <header className="mb-8 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 p-2">
          <Icon className="text-primary" icon={Keyboard} size="lg" />
        </div>
        <div>
          <h1 className="font-bold text-xl tracking-tight">Key Remapper</h1>
          <p className="text-muted-foreground text-xs">Windows Native Hook</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {onToggleSimpleMode ? (
          <Button
            className="gap-2 rounded-full"
            onClick={onToggleSimpleMode}
            variant="ghost"
          >
            <Icon icon={icon} size="sm" />
            {simpleMode ? "詳細表示" : "シンプル表示"}
          </Button>
        ) : null}
        <Button
          className="gap-2 rounded-full"
          onClick={onToggleActive}
          variant={isActive ? "default" : "destructive"}
        >
          <Icon icon={Power} size="sm" />
          {isActive ? "Active" : "Disabled"}
        </Button>
      </div>
    </header>
  );
}

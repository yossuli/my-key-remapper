import { Keyboard, Power } from "lucide-react";
import { Button } from "../atoms/Button";
import { Icon } from "../atoms/Icon";

interface AppHeaderProps {
  isActive: boolean;
  onToggleActive: () => void;
}

export function AppHeader({ isActive, onToggleActive }: AppHeaderProps) {
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

      <Button
        className="gap-2 rounded-full"
        onClick={onToggleActive}
        variant={isActive ? "primary" : "destructive"}
      >
        <Icon icon={Power} size="sm" />
        {isActive ? "Active" : "Disabled"}
      </Button>
    </header>
  );
}

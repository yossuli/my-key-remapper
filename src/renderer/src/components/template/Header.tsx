import { Keyboard, Power } from "lucide-react";

interface HeaderProps {
  isActive: boolean;
  onToggleActive: () => void;
}

export function Header({ isActive, onToggleActive }: HeaderProps) {
  return (
    <header className="mb-8 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 p-2">
          <Keyboard className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="font-bold text-xl tracking-tight">Key Remapper</h1>
          <p className="text-muted-foreground text-xs">Windows Native Hook</p>
        </div>
      </div>

      <button
        className={`flex items-center gap-2 rounded-full px-4 py-2 font-medium text-sm transition-colors ${
          isActive
            ? "bg-primary text-primary-foreground hover:bg-primary/90"
            : "bg-destructive text-destructive-foreground hover:bg-destructive/90"
        }`}
        onClick={onToggleActive}
        type="button"
      >
        <Power className="h-4 w-4" />
        {isActive ? "Active" : "Disabled"}
      </button>
    </header>
  );
}

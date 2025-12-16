import { AlertCircle } from "lucide-react";

interface LogEntry {
  id: string;
  vkCode: number;
  time: string;
}

interface KeyLoggerProps {
  logs: LogEntry[];
}

export function KeyLogger({ logs }: KeyLoggerProps) {
  return (
    <section className="flex h-fit flex-col overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="flex items-center gap-2 border-b bg-muted/30 p-4">
        <AlertCircle className="h-4 w-4 text-accent-foreground" />
        <h2 className="font-semibold text-sm">Live Event Log</h2>
      </div>
      <div className="max-h-[400px] flex-1 space-y-2 overflow-y-auto p-4 font-mono text-sm">
        {logs.length === 0 ? (
          <p className="text-muted-foreground text-xs italic">
            Waiting for input...
          </p>
        ) : (
          logs.map((log) => (
            <div
              className="fade-in slide-in-from-left-2 flex animate-in items-center justify-between duration-200"
              key={log.id}
            >
              <span className="rounded bg-accent/50 px-2 py-0.5 text-accent-foreground">
                VK: {log.vkCode}
              </span>
              <span className="text-muted-foreground text-xs">{log.time}</span>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

import {
  AlertCircle,
  Keyboard,
  Plus,
  Power,
  Settings,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";

interface LogEntry {
  vkCode: number;
  time: string;
}

export default function App() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [mappings, setMappings] = useState<[number, number][]>([]);
  const [newFrom, setNewFrom] = useState("");
  const [newTo, setNewTo] = useState("");

  useEffect(() => {
    // Listen for key events
    const handleKeyEvent = (_event: any, data: { vkCode: number }) => {
      setLogs((prev) => [
        { vkCode: data.vkCode, time: new Date().toLocaleTimeString() },
        ...prev.slice(0, 19),
      ]);
    };

    const ipc = (window as any).electron?.ipcRenderer;
    if (ipc) {
      ipc.on("key-event", handleKeyEvent);
      // Load initial mappings
      ipc.invoke("get-mappings").then((initial: [number, number][]) => {
        setMappings(initial);
      });
    }

    return () => {
      if (ipc) ipc.off("key-event", handleKeyEvent);
    };
  }, []);

  const addMapping = () => {
    const from = Number.parseInt(newFrom);
    const to = Number.parseInt(newTo);
    if (!(isNaN(from) || isNaN(to))) {
      const ipc = (window as any).electron?.ipcRenderer;
      ipc?.send("add-mapping", { from, to });
      setMappings((prev) => [...prev.filter((m) => m[0] !== from), [from, to]]);
      setNewFrom("");
      setNewTo("");
    }
  };

  const removeMapping = (from: number) => {
    const ipc = (window as any).electron?.ipcRenderer;
    ipc?.send("remove-mapping", from);
    setMappings((prev) => prev.filter((m) => m[0] !== from));
  };

  return (
    <div className="flex min-h-screen flex-col bg-background p-6 font-sans text-foreground">
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
          onClick={() => setIsActive(!isActive)}
        >
          <Power className="h-4 w-4" />
          {isActive ? "Active" : "Disabled"}
        </button>
      </header>

      <main className="grid flex-1 grid-cols-1 gap-6 md:grid-cols-2">
        {/* Mappings Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-semibold text-lg">
              <Settings className="h-5 w-5 opacity-70" />
              Mappings
            </h2>
          </div>

          <div className="flex h-[400px] flex-col overflow-hidden rounded-xl border bg-card shadow-sm">
            {/* List Header/Add Form */}
            <div className="grid grid-cols-[1fr_auto_1fr_auto] items-center gap-2 border-b bg-muted/30 p-4">
              <input
                className="w-full rounded border bg-background px-3 py-1 text-sm"
                onChange={(e) => setNewFrom(e.target.value)}
                placeholder="From VK"
                type="number"
                value={newFrom}
              />
              <span className="text-muted-foreground">→</span>
              <input
                className="w-full rounded border bg-background px-3 py-1 text-sm"
                onChange={(e) => setNewTo(e.target.value)}
                placeholder="To VK"
                type="number"
                value={newTo}
              />
              <button
                className="rounded bg-primary p-1.5 text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                disabled={!(newFrom && newTo)}
                onClick={addMapping}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {/* Mappings List */}
            <div className="flex-1 space-y-2 overflow-y-auto p-2">
              {mappings.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center p-4 text-center text-muted-foreground text-sm">
                  <p>No mappings configured.</p>
                  <p className="mt-1 text-xs">
                    Add VK codes above (e.g., 65 → 66)
                  </p>
                </div>
              ) : (
                mappings.map(([from, to]) => (
                  <div
                    className="group flex items-center justify-between rounded-lg bg-secondary/50 p-3 transition-colors hover:bg-secondary"
                    key={from}
                  >
                    <div className="flex items-center gap-3">
                      <span className="min-w-[3rem] rounded border bg-background px-2 py-0.5 text-center font-mono text-sm shadow-sm">
                        {from}
                      </span>
                      <span className="text-muted-foreground text-xs">➔</span>
                      <span className="min-w-[3rem] rounded border border-primary/20 bg-primary/10 px-2 py-0.5 text-center font-mono text-primary text-sm shadow-sm">
                        {to}
                      </span>
                    </div>
                    <button
                      className="rounded p-1.5 text-muted-foreground opacity-0 transition-colors hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                      onClick={() => removeMapping(from)}
                      title="Remove mapping"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Live Logs Section */}
        <section className="flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm">
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
              logs.map((log, i) => (
                <div
                  className="fade-in slide-in-from-left-2 flex animate-in items-center justify-between duration-200"
                  key={i}
                >
                  <span className="rounded bg-accent/50 px-2 py-0.5 text-accent-foreground">
                    VK: {log.vkCode}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {log.time}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

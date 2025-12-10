import React, { useEffect, useState } from "react";
import {
  Keyboard,
  Settings,
  Plus,
  Trash2,
  AlertCircle,
  Power,
} from "lucide-react";

interface LogEntry {
  vkCode: number;
  time: string;
}

export default function App() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    // Listen for key events from main process
    const handleKeyEvent = (_event: any, data: { vkCode: number }) => {
      setLogs((prev) => [
        { vkCode: data.vkCode, time: new Date().toLocaleTimeString() },
        ...prev.slice(0, 19),
      ]);
    };

    // Use window.electron.ipcRenderer exposed via preload
    (window as any).electron?.ipcRenderer.on("key-event", handleKeyEvent);

    return () => {
      // Cleanup if needed (though usually handled by browser window destruction)
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans p-6">
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Keyboard className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Key Remapper</h1>
            <p className="text-xs text-muted-foreground">Windows Native Hook</p>
          </div>
        </div>

        <button
          onClick={() => setIsActive(!isActive)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            isActive
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-destructive text-destructive-foreground hover:bg-destructive/90"
          }`}
        >
          <Power className="w-4 h-4" />
          {isActive ? "Active" : "Disabled"}
        </button>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
        {/* Mappings Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Settings className="w-5 h-5 opacity-70" />
              Mappings
            </h2>
            <button className="p-1 hover:bg-muted rounded-md transition-colors">
              <Plus className="w-5 h-5 text-primary" />
            </button>
          </div>

          <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
            <div className="p-8 text-center text-muted-foreground bg-muted/30">
              <p>No mappings configured.</p>
              <button className="mt-4 text-sm text-primary hover:underline">
                Create your first remap
              </button>
            </div>
          </div>
        </section>

        {/* Live Logs Section */}
        <section className="bg-card border rounded-xl shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b bg-muted/30 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-accent-foreground" />
            <h2 className="text-sm font-semibold">Live Event Log</h2>
          </div>
          <div className="flex-1 p-4 overflow-y-auto max-h-[400px] space-y-2 font-mono text-sm">
            {logs.length === 0 ? (
              <p className="text-muted-foreground text-xs italic">
                Waiting for input...
              </p>
            ) : (
              logs.map((log, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center animate-in fade-in slide-in-from-left-2 duration-200"
                >
                  <span className="bg-accent/50 px-2 py-0.5 rounded text-accent-foreground">
                    VK: {log.vkCode}
                  </span>
                  <span className="text-xs text-muted-foreground">
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

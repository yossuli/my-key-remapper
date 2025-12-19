// キーイベントログ管理のカスタムフック

import { useCallback, useState } from "react";
import { useIpcEvent } from "./useIpc";

interface LogEntry {
  id: string;
  vkCode: number;
  time: string;
}

const MAX_LOG_ENTRIES = 19;

interface UseKeyEventLogReturn {
  logs: LogEntry[];
  clearLogs: () => void;
}

/**
 * キーイベントログを管理するカスタムフック
 */
export function useKeyEventLog(): UseKeyEventLogReturn {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const handleKeyEvent = useCallback((...args: unknown[]) => {
    const data = args[1] as { vkCode: number };
    setLogs((prev) => [
      {
        id: crypto.randomUUID(),
        vkCode: data.vkCode,
        time: new Date().toLocaleTimeString(),
      },
      ...prev.slice(0, MAX_LOG_ENTRIES),
    ]);
  }, []);

  useIpcEvent("key-event", handleKeyEvent);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  return { logs, clearLogs };
}

export type { LogEntry };

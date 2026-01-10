import { AlertCircle } from "lucide-react";
import { Icon } from "@/components/atoms/Icon";
import { HandleEmpty } from "@/components/control/HandleEmpty";
import { LogEntry } from "@/components/molecules/display/LogEntry";
import type { LogState } from "@/components/pages/KeyRemapperPage";
import { VStack } from "@/components/template/Flex";

interface LogListProps {
  logs: LogState["logs"];
}

export function LogList({ logs }: LogListProps) {
  // 🆕 → 🔥 (H. Log Management)
  return (
    <section className="flex h-fit flex-col overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="flex items-center gap-2 border-b bg-muted/30 p-4">
        <Icon className="text-accent-foreground" icon={AlertCircle} />
        <h2 className="font-semibold text-sm">Live Event Log</h2>
      </div>
      <VStack
        className="max-h-[400px] flex-1 overflow-y-auto p-4 font-mono text-sm"
        gap={2}
      >
        <HandleEmpty
          array={logs}
          empty={
            <p className="text-muted-foreground text-xs italic">
              Waiting for input...
            </p>
          }
        >
          {(log) => (
            <LogEntry key={log.id} time={log.time} vkCode={log.vkCode} />
          )}
        </HandleEmpty>
      </VStack>
    </section>
  );
}

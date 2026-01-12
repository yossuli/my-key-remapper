import { useState } from "react";
import { Else, Ternary, Then } from "@/components/control/Ternary";
import { KeyRemapperPage } from "@/components/pages/KeyRemapperPage";
import { MacroManagerPage } from "@/components/pages/MacroManagerPage";

export type ViewType = "remapper" | "macros";

export default function App() {
  const [view, setView] = useState<ViewType>("remapper");

  return (
    <Ternary condition={view === "macros"}>
      <Then>
        <MacroManagerPage onBack={() => setView("remapper")} />
      </Then>
      <Else>
        <KeyRemapperPage onNavigateMacros={() => setView("macros")} />
      </Else>
    </Ternary>
  );
}

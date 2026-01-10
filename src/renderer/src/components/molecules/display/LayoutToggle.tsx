import { Keyboard } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Icon } from "@/components/atoms/Icon";
import type { LayoutType } from "@/types";
import { SWITCH_LAYOUT_RULE } from "../../../../../shared/constants";

interface LayoutToggleProps {
  currentLayout: LayoutType;
  onToggle: () => void;
}

export function LayoutToggle({ currentLayout, onToggle }: LayoutToggleProps) {
  return (
    <Button
      className="gap-2 rounded-full border border-border hover:border-primary"
      onClick={onToggle}
      variant="ghost"
    >
      <Icon icon={Keyboard} />
      {SWITCH_LAYOUT_RULE[currentLayout]}
    </Button>
  );
}

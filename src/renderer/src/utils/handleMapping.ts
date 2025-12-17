import type {
  Action,
  Layer,
  TriggerType,
} from "../../../shared/types/remapConfig";
import { applyIf } from "./appryIf";

export const upsert =
  (layerId: string, from: number, action: Action) => (prev: Layer[]) =>
    prev.map(
      applyIf(
        (l) => l.id === layerId,
        (l) => ({
          ...l,
          bindings: {
            ...l.bindings,
            [from]: l.bindings[from].filter(
              ({ action: a }) => a.type !== action.type
            ),
          },
        })
      )
    );

export const remove =
  (layerId: string, from: number, trigger: TriggerType) => (prev: Layer[]) =>
    prev.map(
      applyIf(
        (l) => l.id === layerId,
        (l) => {
          const filtered =
            l.bindings[from]?.filter((b) => b.trigger !== trigger) ?? [];
          if (filtered.length === 0) {
            const { [from]: _, ...newBindings } = l.bindings;
            return { ...l, bindings: newBindings };
          }
          return { ...l, bindings: { ...l.bindings, [from]: filtered } };
        }
      )
    );

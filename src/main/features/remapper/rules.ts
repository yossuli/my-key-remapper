export class RemapRules {
  private rules = new Map<number, number>();

  add(from: number, to: number) {
    console.log(`Adding mapping: ${from} -> ${to}`);
    this.rules.set(from, to);
  }

  remove(from: number) {
    console.log(`Removing mapping: ${from}`);
    this.rules.delete(from);
  }

  get(from: number): number | undefined {
    return this.rules.get(from);
  }

  has(from: number): boolean {
    return this.rules.has(from);
  }

  getAll(): [number, number][] {
    return Array.from(this.rules.entries());
  }
}

export const remapRules = new RemapRules();

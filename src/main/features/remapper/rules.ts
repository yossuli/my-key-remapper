import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { app } from "electron";

export class RemapRules {
  private readonly rules = new Map<number, number>();
  private configPath = "";

  async init() {
    this.configPath = join(app.getPath("userData"), "key-mapping-config.json");
    await this.load();
  }

  private async load() {
    try {
      const data = await readFile(this.configPath, "utf-8");
      const json = JSON.parse(data);
      this.rules.clear();
      for (const [key, value] of Object.entries(json)) {
        this.rules.set(Number(key), Number(value));
      }
      console.log("Loaded mappings from:", this.configPath);
    } catch (_error) {
      console.log("No existing config found, starting with empty rules.");
    }
  }

  private async save() {
    if (!this.configPath) {
      return;
    }
    try {
      const obj = Object.fromEntries(this.rules.entries());
      await writeFile(this.configPath, JSON.stringify(obj, null, 2));
      console.log("Saved mappings.");
    } catch (error) {
      console.error("Failed to save mappings:", error);
    }
  }

  add(from: number, to: number) {
    console.log(`Adding mapping: ${from} -> ${to}`);
    this.rules.set(from, to);
    this.save();
  }

  remove(from: number) {
    console.log(`Removing mapping: ${from}`);
    this.rules.delete(from);
    this.save();
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

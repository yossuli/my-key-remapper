// electron.vite.config.ts
import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";

var __electron_vite_injected_dirname =
  "C:\\Users\\yo44a\\Documents\\my-key-remapper";
var electron_vite_config_default = defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        external: ["electron"],
      },
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
  },
  renderer: {
    plugins: [react()],
    root: "src/renderer",
    build: {
      rollupOptions: {
        input: {
          index: resolve(
            __electron_vite_injected_dirname,
            "src/renderer/index.html"
          ),
        },
      },
    },
  },
});
export { electron_vite_config_default as default };

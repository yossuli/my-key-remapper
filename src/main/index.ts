import { join } from "node:path";
import { app, BrowserWindow } from "electron";
import { setupKeyboardHook } from "./hook";
import { setupIPCHandlers } from "./ipc/handlers";
import { teardownRemapper } from "./ipc/remapper";
import { remapRules } from "./state/rules";

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false,
      contextIsolation: true,
    },
  });

  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }
}

app.whenReady().then(async () => {
  createWindow();

  // リマッパー機能を初期化
  await remapRules.init();
  setupKeyboardHook((channel, data) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send(channel, data);
    }
  });
  setupIPCHandlers();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    // 終了前にフックをクリーンアップ
    teardownRemapper();
    app.quit();
  }
});

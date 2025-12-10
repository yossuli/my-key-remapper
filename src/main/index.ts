import { app, BrowserWindow } from "electron";
import { join } from "path";
import koffi from "koffi";

let mainWindow: BrowserWindow | null = null;

// --- FFI & Hook Logic ---
let hHook: any = null;
let hookCallback: any = null; // Keep reference to prevent GC

function setupKeyboardHook() {
  if (process.platform !== "win32") {
    console.log("Not on Windows, skipping keyboard hook setup.");
    return;
  }

  try {
    const user32 = koffi.load("user32.dll");

    // Types
    // Handles are just pointers/integers in Windows. Using intptr_t is the safest/easiest way.
    const HHOOK = koffi.alias("HHOOK", "intptr_t");
    const LRESULT = koffi.alias("LRESULT", "intptr_t");
    const WPARAM = koffi.alias("WPARAM", "uintptr_t");
    const LPARAM = koffi.alias("LPARAM", "intptr_t");
    const HINSTANCE = koffi.alias("HINSTANCE", "intptr_t");

    // Constants
    const WH_KEYBOARD_LL = 13;
    const WM_KEYDOWN = 0x0100;
    const WM_SYSKEYDOWN = 0x0104;

    // Structs
    const KBDLLHOOKSTRUCT = koffi.struct("KBDLLHOOKSTRUCT", {
      vkCode: "uint32_t",
      scanCode: "uint32_t",
      flags: "uint32_t",
      time: "uint32_t",
      dwExtraInfo: "uintptr_t",
    });

    // Callback Signature
    // Callback Signature
    const HookCallbackProto = koffi.proto("HookCallbackProto", LRESULT, [
      "int",
      WPARAM,
      koffi.pointer(KBDLLHOOKSTRUCT), // Received as a pointer object (External)
    ]);
    const HookCallbackPtr = koffi.pointer(HookCallbackProto);

    // Functions
    const CallNextHookEx = user32.func("CallNextHookEx", LRESULT, [
      HHOOK,
      "int",
      WPARAM,
      LPARAM,
    ]);

    // SetWindowsHookExA expects a function pointer for the callback.
    const SetWindowsHookExA = user32.func("SetWindowsHookExA", HHOOK, [
      "int",
      HookCallbackPtr,
      HINSTANCE,
      "uint32_t",
    ]);

    const UnhookWindowsHookEx = user32.func("UnhookWindowsHookEx", "bool", [
      HHOOK,
    ]);

    const GetModuleHandleA = koffi
      .load("kernel32.dll")
      .func("GetModuleHandleA", HINSTANCE, ["str"]);

    // The Callback
    // The Callback
    hookCallback = koffi.register(
      (nCode: number, wParam: number, lParam: any) => {
        // nCode < 0 means we must pass it on
        // koffi.address(lParam) extracts the raw address from the pointer object
        if (nCode < 0) {
          return CallNextHookEx(hHook, nCode, wParam, koffi.address(lParam));
        }

        if (wParam === WM_KEYDOWN || wParam === WM_SYSKEYDOWN) {
          try {
            // Explicitly decode the pointer to get the struct data
            const info = koffi.decode(lParam, KBDLLHOOKSTRUCT);
            console.log(`[HOOK] Key Pressed: vkCode=${info.vkCode}`);

            if (mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.webContents.send("key-event", {
                vkCode: info.vkCode,
              });
            }
          } catch (err) {
            console.error("Error inside hook callback:", err);
          }
        }

        // Always call next hook -> Pass the address forward
        return CallNextHookEx(hHook, nCode, wParam, koffi.address(lParam));
      },
      HookCallbackPtr
    );

    // Hook Installation
    // 0 for threadId means global hook (requires HINSTANCE usually)
    const hMod = GetModuleHandleA(null);
    hHook = SetWindowsHookExA(WH_KEYBOARD_LL, hookCallback, hMod, 0);

    if (hHook) {
      console.log("Keyboard hook installed successfully. Handle:", hHook);
    } else {
      console.error("Failed to install keyboard hook.");
    }
  } catch (error) {
    console.error("Failed to initialize FFI or Hook:", error);
  }
}

// --- Electron App ---

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 600,
    height: 400,
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false, // Required for some IPC or FFI if done in renderer, but we do FFI in main.
      contextIsolation: true,
    },
  });

  // Load the local index.html.
  if (process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }
}

app.whenReady().then(() => {
  createWindow();
  setupKeyboardHook();

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    // Unhook before exit
    if (hHook) {
      // Since we didn't ref the fn for Unhook here we might leak if we just quit,
      // but OS cleans up hooks on process exit usually.
      // Better to be explicit if possible, but for MVP it's okay.
      console.log("Exiting...");
    }
    app.quit();
  }
});

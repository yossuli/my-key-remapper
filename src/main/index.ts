import { app, BrowserWindow, ipcMain } from "electron";
import { join } from "path";
import koffi from "koffi";
// ... (imports)

// ... (hook logic)

// Remove the test rule
// remapRules.set(65, 66);

// ... (createWindow function)

app.whenReady().then(() => {
  createWindow();
  setupKeyboardHook();

  // --- IPC Handlers for Mappings ---
  ipcMain.handle("get-mappings", () => {
    return Array.from(remapRules.entries());
  });

  ipcMain.on("add-mapping", (_event, { from, to }) => {
    console.log(`Adding mapping: ${from} -> ${to}`);
    remapRules.set(from, to);
  });

  ipcMain.on("remove-mapping", (_event, from) => {
    console.log(`Removing mapping: ${from}`);
    remapRules.delete(from);
  });

  // Also existing activate handler
  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

let mainWindow: BrowserWindow | null = null;

// --- FFI & Hook Logic ---
let hHook: any = null;
let hookCallback: any = null; // Keep reference to prevent GC
let remapRules = new Map<number, number>(); // Global rules: <FromVK, ToVK>

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
    const HookCallbackProto = koffi.proto("HookCallbackProto", LRESULT, [
      "int",
      WPARAM,
      koffi.pointer(KBDLLHOOKSTRUCT), // Received as a pointer object (External)
    ]);
    const HookCallbackPtr = koffi.pointer(HookCallbackProto);

    // --- SendInput Definitions ---
    const INPUT_KEYBOARD = 1;
    const KEYEVENTF_KEYUP = 0x0002;
    // const KEYEVENTF_SCANCODE = 0x0008; // Not used yet

    const KEYBDINPUT = koffi.struct("KEYBDINPUT", {
      wVk: "uint16_t",
      wScan: "uint16_t",
      dwFlags: "uint32_t",
      time: "uint32_t",
      dwExtraInfo: "uintptr_t",
    });

    const MOUSEINPUT = koffi.struct("MOUSEINPUT", {
      dx: "long",
      dy: "long",
      mouseData: "uint32_t",
      dwFlags: "uint32_t",
      time: "uint32_t",
      dwExtraInfo: "uintptr_t",
    });

    const HARDWAREINPUT = koffi.struct("HARDWAREINPUT", {
      uMsg: "uint32_t",
      wParamL: "uint16_t",
      wParamH: "uint16_t",
    });

    const InputUnion = koffi.union("InputUnion", {
      ki: KEYBDINPUT,
      mi: MOUSEINPUT,
      hi: HARDWAREINPUT,
    });

    const INPUT = koffi.struct("INPUT", {
      type: "uint32_t",
      // On x64, there is 4 bytes padding after type to align union to 8 bytes.
      // Koffi should handle natural alignment, but being explicit is safer if needed.
      // However, C struct is usually: DWORD type; UNION u;
      u: InputUnion,
    });

    const SendInput = user32.func("SendInput", "uint32_t", [
      "uint32_t",
      koffi.pointer(INPUT),
      "int",
    ]);

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

    // Test Rule: A (65) -> B (66)
    remapRules.set(65, 66);

    // Helper to send key input
    const sendKey = (vk: number, up: boolean) => {
      try {
        const input = {
          type: INPUT_KEYBOARD,
          u: {
            ki: {
              wVk: vk,
              wScan: 0,
              dwFlags: up ? KEYEVENTF_KEYUP : 0,
              time: 0,
              dwExtraInfo: 0,
            },
          },
        };

        // SendInput returns number of events inserted
        const sent = SendInput(1, [input], koffi.sizeof(INPUT));
        if (sent !== 1) {
          console.error(`SendInput failed. Sent: ${sent}`);
        }
      } catch (e) {
        console.error("SendInput Error:", e);
      }
    };

    // The Callback
    hookCallback = koffi.register(
      (nCode: number, wParam: number, lParam: any) => {
        if (nCode < 0) {
          return CallNextHookEx(hHook, nCode, wParam, koffi.address(lParam));
        }

        if (
          wParam === WM_KEYDOWN ||
          wParam === WM_SYSKEYDOWN ||
          wParam === 0x0101 /* WM_KEYUP */ ||
          wParam === 0x0105 /* WM_SYSKEYUP */
        ) {
          try {
            const info = koffi.decode(lParam, KBDLLHOOKSTRUCT);

            // Ignore injected events to prevent infinite loops
            // LLKHF_INJECTED = 0x00000010
            if ((info.flags & 0x10) !== 0) {
              // console.log("Ignoring injected key");
              return CallNextHookEx(
                hHook,
                nCode,
                wParam,
                koffi.address(lParam)
              );
            }

            const vkCode = info.vkCode;
            const isUp = wParam === 0x0101 || wParam === 0x0105;

            // Logging
            if (!isUp) {
              console.log(`[HOOK] Key Down: ${vkCode}`);
              if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.webContents.send("key-event", { vkCode });
              }
            }

            // Remap Logic
            if (remapRules.has(vkCode)) {
              const targetVk = remapRules.get(vkCode)!;
              console.log(
                `Remapping ${vkCode} -> ${targetVk} (${isUp ? "UP" : "DOWN"})`
              );
              sendKey(targetVk, isUp);
              return 1; // Block original
            }
          } catch (err) {
            console.error("Error inside hook callback:", err);
          }
        }

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

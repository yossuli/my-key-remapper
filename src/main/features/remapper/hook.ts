import koffi from "koffi";
import {
  CallNextHookEx,
  GetModuleHandleA,
  HookCallbackProto,
  SetWindowsHookExA,
  UnhookWindowsHookEx,
} from "./native";
import { remapRules } from "./rules";
import { sendKey } from "./sender";
import {
  KBDLLHOOKSTRUCT,
  WH_KEYBOARD_LL,
  WM_KEYDOWN,
  WM_KEYUP,
  WM_SYSKEYDOWN,
  WM_SYSKEYUP,
} from "./types";

let hHook: any = null;
let hookCallback: any = null;
let eventSender: ((channel: string, data: any) => void) | null = null;

export function setupKeyboardHook(
  sender: (channel: string, data: any) => void
) {
  if (process.platform !== "win32") {
    console.log("Not on Windows, skipping keyboard hook setup.");
    return;
  }

  eventSender = sender;

  try {
    hookCallback = koffi.register(
      (nCode: number, wParam: number, lParam: any) => {
        if (nCode < 0) {
          return CallNextHookEx(hHook, nCode, wParam, koffi.address(lParam));
        }

        if (
          wParam === WM_KEYDOWN ||
          wParam === WM_SYSKEYDOWN ||
          wParam === WM_KEYUP ||
          wParam === WM_SYSKEYUP
        ) {
          try {
            const info = koffi.decode(lParam, KBDLLHOOKSTRUCT);

            // Ignore injected events to prevent infinite loops
            if ((info.flags & 0x10) !== 0) {
              return CallNextHookEx(
                hHook,
                nCode,
                wParam,
                koffi.address(lParam)
              );
            }

            const vkCode = info.vkCode;
            const isUp = wParam === WM_KEYUP || wParam === WM_SYSKEYUP;

            // Logging
            if (!isUp) {
              console.log(`[HOOK] Key Down: ${vkCode}`);
              if (eventSender) {
                eventSender("key-event", { vkCode });
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
      koffi.pointer(HookCallbackProto)
    );

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

export function teardownKeyboardHook() {
  if (hHook) {
    UnhookWindowsHookEx(hHook);
    hHook = null;
    hookCallback = null;
    console.log("Keyboard hook uninstalled.");
  }
}

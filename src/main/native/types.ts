import koffi from "koffi";

// 定数
export const WH_KEYBOARD_LL = 13;
export const WM_KEYDOWN = 0x01_00;
export const WM_KEYUP = 0x01_01;
export const WM_SYSKEYDOWN = 0x01_04;
export const WM_SYSKEYUP = 0x01_05;

export const INPUT_KEYBOARD = 1;
export const KEYEVENTF_KEYUP = 0x00_02;
export const KEYEVENTF_SCANCODE = 0x00_08;

// 基本型のエイリアス（関数シグネチャの可読性向上のため）
export const HHOOK = koffi.alias("HHOOK", "intptr_t");
export const LRESULT = koffi.alias("LRESULT", "intptr_t");
export const WPARAM = koffi.alias("WPARAM", "uintptr_t");
export const LPARAM = koffi.alias("LPARAM", "intptr_t");
export const HINSTANCE = koffi.alias("HINSTANCE", "intptr_t");

// 構造体定義
export const KBDLLHOOKSTRUCT = koffi.struct("KBDLLHOOKSTRUCT", {
  vkCode: "uint32_t",
  scanCode: "uint32_t",
  flags: "uint32_t",
  time: "uint32_t",
  dwExtraInfo: "uintptr_t",
});

export const KEYBDINPUT = koffi.struct("KEYBDINPUT", {
  wVk: "uint16_t",
  wScan: "uint16_t",
  dwFlags: "uint32_t",
  time: "uint32_t",
  dwExtraInfo: "uintptr_t",
});

export const MOUSEINPUT = koffi.struct("MOUSEINPUT", {
  dx: "long",
  dy: "long",
  mouseData: "uint32_t",
  dwFlags: "uint32_t",
  time: "uint32_t",
  dwExtraInfo: "uintptr_t",
});

export const HARDWAREINPUT = koffi.struct("HARDWAREINPUT", {
  uMsg: "uint32_t",
  wParamL: "uint16_t",
  wParamH: "uint16_t",
});

export const InputUnion = koffi.union("InputUnion", {
  ki: KEYBDINPUT,
  mi: MOUSEINPUT,
  hi: HARDWAREINPUT,
});

export const INPUT = koffi.struct("INPUT", {
  type: "uint32_t",
  u: InputUnion,
});

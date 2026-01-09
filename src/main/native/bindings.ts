import koffi from "koffi";
import {
  HHOOK,
  HINSTANCE,
  INPUT,
  KBDLLHOOKSTRUCT,
  LPARAM,
  LRESULT,
  WPARAM,
} from "./types";

const user32 = koffi.load("user32.dll");
const kernel32 = koffi.load("kernel32.dll");

// マウス座標用の構造体
const POINT = koffi.struct("POINT", {
  x: "long",
  y: "long",
});

// コールバックのシグネチャ
export const HookCallbackProto = koffi.proto("HookCallbackProto", LRESULT, [
  "int",
  WPARAM,
  koffi.pointer(KBDLLHOOKSTRUCT),
]);

export const SendInput = user32.func("SendInput", "uint32_t", [
  "uint32_t",
  koffi.pointer(INPUT),
  "int",
]);

export const CallNextHookEx = user32.func("CallNextHookEx", LRESULT, [
  HHOOK,
  "int",
  WPARAM,
  LPARAM,
]);

export const SetWindowsHookExA = user32.func("SetWindowsHookExA", HHOOK, [
  "int",
  koffi.pointer(HookCallbackProto),
  HINSTANCE,
  "uint32_t",
]);

export const UnhookWindowsHookEx = user32.func("UnhookWindowsHookEx", "bool", [
  HHOOK,
]);

export const GetModuleHandleA = kernel32.func("GetModuleHandleA", HINSTANCE, [
  "str",
]);

export const SetCursorPos = user32.func("SetCursorPos", "bool", [
  "int", // x
  "int", // y
]);

export const GetCursorPos = user32.func("GetCursorPos", "bool", [
  koffi.out(koffi.pointer(POINT)),
]);

export const GetSystemMetrics = user32.func("GetSystemMetrics", "int", [
  "int", // nIndex
]);

// GetSystemMetrics用の定数
export const SM_CXSCREEN = 0; // プライマリモニターの幅
export const SM_CYSCREEN = 1; // プライマリモニターの高さ
export const SM_CXVIRTUALSCREEN = 78; // 仮想スクリーン全体の幅（マルチモニター）
export const SM_CYVIRTUALSCREEN = 79; // 仮想スクリーン全体の高さ（マルチモニター）

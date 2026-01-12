export type CallbackFns<T, U extends keyof T, V> = {
  [K in T[U] extends string ? T[U] : never]: (
    k: T extends { [_K in U]: K } ? T : never
  ) => V;
};

export const objectiveDiscriminantSwitch = <
  // biome-ignore lint/suspicious/noExplicitAny: 汎用的な関数であるため
  T extends Record<string, any>,
  U extends keyof T,
  V,
>(
  callbackFns: CallbackFns<T, U, V>,
  value: T,
  key: U
): V => {
  // biome-ignore lint/suspicious/noExplicitAny: 型の怪しい部分をutilに押し込む
  return callbackFns[value[key]](value as any);
};

export const objectiveDiscriminantPartialSwitch = <
  // biome-ignore lint/suspicious/noExplicitAny: 汎用的な関数であるため
  T extends Record<string, any>,
  U extends keyof T,
  V,
>(
  callbackFns: Partial<CallbackFns<T, U, V>>,
  value: T,
  key: U
): V | undefined => {
  const handler = callbackFns[value[key]];
  if (handler) {
    // biome-ignore lint/suspicious/noExplicitAny: 型の怪しい部分をutilに押し込む
    return handler(value as any);
  }
  return;
};

export const objectiveSwitch = <T extends string, V>(
  callbackFns: Record<T, () => V>,
  value: T
): V => callbackFns[value]();

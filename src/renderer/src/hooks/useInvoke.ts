// IPC invokeの型安全ラッパー

import { useCallback } from "react";
import { useIpc } from "./useIpc";

/**
 * IPC invokeの型安全ラッパー
 * 特定のチャンネルに対する呼び出しを提供
 */
export function useInvoke<TResult, TArgs extends unknown[] = []>(
  channel: string
) {
  const { invoke } = useIpc();

  const invokeChannel = useCallback(
    async (...args: TArgs): Promise<TResult | undefined> =>
      invoke<TResult>(channel, ...args),
    [invoke, channel]
  );

  return invokeChannel;
}

/**
 * get-mappings専用のinvokeフック
 */
export function useGetMappings() {
  return useInvoke<import("../../../shared/types/remapConfig").Layer[]>(
    "get-mappings"
  );
}

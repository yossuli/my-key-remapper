// IPC invokeの型安全ラッパー

import { useCallback } from "react";
import { useIpc } from "./useIpc";
import { Layer } from "../../../shared/types/remapConfig";
/**
 * IPC invokeの型安全ラッパー
 * 特定のチャンネルに対する呼び出しを提供
 */
export function useInvoke<TResult, TArgs extends unknown[] = []>(
  channel: string
): (...args: TArgs) => Promise<TResult | undefined> {
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
export function useGetMappings(): () => Promise<Layer[] | undefined> {
  return useInvoke<Layer[]>(
    "get-mappings"
  );
}

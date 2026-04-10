import { useCallback, useEffect, useState } from "react";

export type AsyncState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; message: string };

export function useAsyncResource<T>(
  load: () => Promise<T>,
): AsyncState<T> & { reload: () => void } {
  const [state, setState] = useState<AsyncState<T>>({ status: "idle" });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });
    void load()
      .then((data) => {
        if (!cancelled) setState({ status: "success", data });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message =
          err instanceof Error ? err.message : "Error desconocido de red o API.";
        setState({ status: "error", message });
      });
    return () => {
      cancelled = true;
    };
  }, [load, tick]);

  const reload = useCallback(() => {
    setTick((t) => t + 1);
  }, []);

  return {
    ...state,
    reload,
  };
}

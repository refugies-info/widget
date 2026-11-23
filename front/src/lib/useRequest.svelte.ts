import { WidgetNotFoundError } from "./api.js";

export type RequestState<T> =
  | { status: "loading" }
  | { status: "error"; error: unknown }
  | { status: "ready"; data: T };

export const useRequest = <T>(request: (signal: AbortSignal) => Promise<T>) => {
  let state = $state.raw<RequestState<T>>({ status: "loading" });
  let busy = $state(true);

  $effect(() => {
    const controller = new AbortController();
    busy = true;
    request(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) state = { status: "ready", data };
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        if (!(error instanceof WidgetNotFoundError)) console.error(error);
        state = { status: "error", error };
      })
      .finally(() => {
        if (!controller.signal.aborted) busy = false;
      });
    return () => controller.abort();
  });

  return {
    get state() {
      return state;
    },
    get busy() {
      return busy;
    },
  };
};

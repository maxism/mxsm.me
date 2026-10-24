import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** False in the server HTML and during hydration, true afterwards, without an effect-and-setState hop. */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}

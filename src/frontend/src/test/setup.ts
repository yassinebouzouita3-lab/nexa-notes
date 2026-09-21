import "@testing-library/jest-dom/vitest";
import { cleanup, configure } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// The generated components expose stable hooks as `data-ocid`; use that as the
// test-id attribute so `getByTestId`/`findByTestId` resolve them.
configure({ testIdAttribute: "data-ocid" });

/**
 * jsdom does not implement `window.matchMedia`, which `next-themes` calls while
 * resolving the system theme. A minimal, controllable stub keeps the theme
 * provider mountable and lets a test drive the system preference.
 */
if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = (query: string): MediaQueryList => {
    const listeners = new Set<(event: MediaQueryListEvent) => void>();
    const mql = {
      matches: false,
      media: query,
      onchange: null,
      addEventListener: (
        _type: string,
        listener: (event: MediaQueryListEvent) => void,
      ) => {
        listeners.add(listener);
      },
      removeEventListener: (
        _type: string,
        listener: (event: MediaQueryListEvent) => void,
      ) => {
        listeners.delete(listener);
      },
      addListener: (listener: (event: MediaQueryListEvent) => void) => {
        listeners.add(listener);
      },
      removeListener: (listener: (event: MediaQueryListEvent) => void) => {
        listeners.delete(listener);
      },
      dispatchEvent: () => false,
    } as unknown as MediaQueryList;
    return mql;
  };
}

/**
 * The app reads its backend actor through `useActor` from
 * `@caffeineai/core-infrastructure`, which normally builds an HTTP agent and
 * talks to a real canister. Tests never touch the network: this module mock
 * replaces the provider and the hook with a local, typed actor holder that each
 * test populates with a `NotesBackend` mock.
 *
 * `setTestActor` is the only seam tests use; `resetTestActor` runs after every
 * test so one test's actor can never leak into the next.
 */
export const testActorRef: { current: unknown } = { current: null };

export function setTestActor(actor: unknown): void {
  testActorRef.current = actor;
}

export function resetTestActor(): void {
  testActorRef.current = null;
}

vi.mock("@caffeineai/core-infrastructure", () => ({
  useActor: () => ({ actor: testActorRef.current, isFetching: false }),
  InternetIdentityProvider: ({ children }: { children: React.ReactNode }) =>
    children,
}));

afterEach(() => {
  cleanup();
  resetTestActor();
  window.localStorage.clear();
});

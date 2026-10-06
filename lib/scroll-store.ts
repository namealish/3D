export type ScrollSnapshot = { progress: number; velocity: number };

let snapshot: ScrollSnapshot = { progress: 0, velocity: 0 };
const serverSnapshot: ScrollSnapshot = { progress: 0, velocity: 0 };
const listeners = new Set<() => void>();

export const scrollStore = {
  getSnapshot: () => snapshot,
  getServerSnapshot: () => serverSnapshot,
  set(next: ScrollSnapshot) {
    snapshot = next;
    listeners.forEach((listener) => listener());
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

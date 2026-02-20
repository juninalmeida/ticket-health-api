function clone(value) {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value));
}

export function createStore(initial) {
  let state = clone(initial);
  const listeners = new Set();

  function getState() {
    return clone(state);
  }

  function setState(updater) {
    const next =
      typeof updater === "function" ? updater(clone(state)) : clone(updater);

    if (!next || typeof next !== "object") {
      throw new TypeError("store.setState requires an object state");
    }

    state = next;

    listeners.forEach((listener) => {
      listener(clone(state));
    });
  }

  function subscribe(listener) {
    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  }

  return {
    getState,
    setState,
    subscribe,
  };
}

export interface StateHistory<T> {
  past: T[];
  present: T;
  future: T[];
}

export interface HistoryOptions {
  undoable: boolean;
  limit?: number;
}

export function jump<T>(state: StateHistory<T>, n: number): StateHistory<T> {
  if (!isStateHistory(state)) {
    throw Error("Provided state is not of type StateHistory");
  }

  if (n > 0) return jumpToFuture<T>(state, n - 1);
  if (n < 0) return jumpToPast<T>(state, state.past.length + n);

  return state;
}

function jumpToFuture<T>(state: StateHistory<T>, index: number): StateHistory<T> {
  if (index < 0 || index >= state.future.length) {
    return state;
  }

  const { past, future, present } = state;

  const newPast = [...past, present, ...future.slice(0, index)];
  const newPresent = future[index];
  const newFuture = future.slice(index + 1);

  return { past: newPast, present: newPresent, future: newFuture };
}

function jumpToPast<T>(state: StateHistory<T>, index: number): StateHistory<T> {
  if (index < 0 || index >= state.past.length) {
    return state;
  }

  const { past, future, present } = state;

  const newPast = past.slice(0, index);
  const newFuture = [...past.slice(index + 1), present, ...future];
  const newPresent = past[index];

  return { past: newPast, present: newPresent, future: newFuture };
}

export function nextStateHistory<T>(presentStateHistory: StateHistory<T>, nextPresent: T): StateHistory<T> {
  return {
    ...presentStateHistory,
    ...{
      past: [...presentStateHistory.past, presentStateHistory.present],
      present: nextPresent,
      future: []
    }
  };
}

export function applyLimits<T>(state: T, limit: number): T {
  if (isStateHistory(state)) {
    if (state.past.length > limit) {
      state.past = state.past.slice(state.past.length - limit);
    }

    if (state.future.length > limit) {
      state.future = state.future.slice(0, limit);
    }
  }

  return state;
}

export function isStateHistory<T>(history: Partial<StateHistory<T>>): history is StateHistory<T> {
  return typeof history.present !== 'undefined' &&
    typeof history.future !== 'undefined' &&
    typeof history.past !== 'undefined' &&
    Array.isArray(history.future) &&
    Array.isArray(history.past);
}

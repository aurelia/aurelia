export function jump(state, n) {
    if (!isStateHistory(state)) {
        throw Error("Provided state is not of type StateHistory");
    }
    if (n > 0)
        return jumpToFuture(state, n - 1);
    if (n < 0)
        return jumpToPast(state, state.past.length + n);
    return state;
}
function jumpToFuture(state, index) {
    if (index < 0 || index >= state.future.length) {
        return state;
    }
    const { past, future, present } = state;
    const newPast = [...past, present, ...future.slice(0, index)];
    const newPresent = future[index];
    const newFuture = future.slice(index + 1);
    return { past: newPast, present: newPresent, future: newFuture };
}
function jumpToPast(state, index) {
    if (index < 0 || index >= state.past.length) {
        return state;
    }
    const { past, future, present } = state;
    const newPast = past.slice(0, index);
    const newFuture = [...past.slice(index + 1), present, ...future];
    const newPresent = past[index];
    return { past: newPast, present: newPresent, future: newFuture };
}
export function nextStateHistory(presentStateHistory, nextPresent) {
    return {
        ...presentStateHistory,
        ...{
            past: [...presentStateHistory.past, presentStateHistory.present],
            present: nextPresent,
            future: []
        }
    };
}
export function applyLimits(state, limit) {
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
export function isStateHistory(history) {
    return typeof history.present !== 'undefined' &&
        typeof history.future !== 'undefined' &&
        typeof history.past !== 'undefined' &&
        Array.isArray(history.future) &&
        Array.isArray(history.past);
}
//# sourceMappingURL=history.js.map
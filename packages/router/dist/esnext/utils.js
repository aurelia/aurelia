export function closestCustomElement(element) {
    let el = element;
    while (el) {
        if (el.$controller) {
            break;
        }
        el = el.parentElement;
    }
    return el;
}
export function arrayRemove(arr, func) {
    const removed = [];
    let arrIndex = arr.findIndex(func);
    while (arrIndex >= 0) {
        removed.push(arr.splice(arrIndex, 1)[0]);
        arrIndex = arr.findIndex(func);
    }
    return removed;
}
//# sourceMappingURL=utils.js.map
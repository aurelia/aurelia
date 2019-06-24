export function closestCustomElement(element) {
    while (element) {
        if ((element).$controller) {
            break;
        }
        element = element.parentElement;
    }
    return element;
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
export function startTickLogging(window, callback) {
    const nextTickMessageName = 'nextTick';
    let tick = 0;
    const handleTick = (event) => {
        console.log(nextTickMessageName, tick);
        if (event !== null && event.source === window && event.data === nextTickMessageName) {
            event.stopPropagation();
            callback(tick++);
            window.postMessage(nextTickMessageName, '*');
        }
    };
    window.addEventListener('message', handleTick, false);
    window.postMessage(nextTickMessageName, '*');
    // let doTick = true;
    // let promiseTick = 0;
    // const handlePromiseTick = (tick: number) => {
    //   console.log('promise tick', promiseTick++);
    //   if (doTick) {
    //     Promise.resolve(promiseTick).then(handlePromiseTick).catch(err => { throw err; });
    //   }
    // };
    // Promise.resolve(promiseTick).then(handlePromiseTick).catch(err => { throw err; });
    return () => {
        window.removeEventListener('message', handleTick, false);
        // doTick = false;
    };
}
//# sourceMappingURL=tick-logger.js.map
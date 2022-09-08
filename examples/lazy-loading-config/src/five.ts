export class Five {
  canLoad(...args) {
    console.log('In Five canLoad hook', ...args);
    return true;
  }

  canUnload(...args) {
    console.log('In Five canUnload hook', ...args);
    return true;
  }

  loading(...args) {
    console.log('In Five load hook', ...args);
  }

  unloading(...args) {
    console.log('In Five unloading hook', ...args);
  }
}

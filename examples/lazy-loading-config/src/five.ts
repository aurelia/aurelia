export class Five {
  canLoad(...args) {
    console.log('In Five canLoad hook', ...args);
    return true;
  }

  canUnload(...args) {
    console.log('In Five canUnload hook', ...args);
    return true;
  }

  load(...args) {
    console.log('In Five load hook', ...args);
  }

  unload(...args) {
    console.log('In Five unload hook', ...args);
  }
}

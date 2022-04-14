export class Four {
  canLoad(...args) {
    console.log('In Four canLoad hook', ...args);
    return true;
  }

}

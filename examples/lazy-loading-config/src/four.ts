export class Four {
  canLoad(params, next, current) {
    console.log('In Four canLoad hook', ...arguments);
    return true;
  }

}

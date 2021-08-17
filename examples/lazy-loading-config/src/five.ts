export class Five {
  canLoad(params, instruction, navigation) {
    console.log('In Five canLoad hook', ...arguments);
    return true;
  }

  canUnload(params, instruction, navigation) {
    console.log('In Five canUnload hook', ...arguments);
    return true;
  }

  load(params, instruction, navigation) {
    console.log('In Five load hook', ...arguments);
  }

  unload(instruction, navigation) {
    console.log('In Five unload hook', ...arguments);
  }
}

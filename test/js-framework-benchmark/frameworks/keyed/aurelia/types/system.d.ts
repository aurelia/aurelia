declare module 'system' {
  import fetch = require('isomorphic-fetch');
  import * as Aurelia from 'aurelia-framework';

  /*
   * List your dynamically imported modules to get typing support
   */
  interface System {
    import(name: string): Promise<any>;
    import(name: 'aurelia-framework'): Promise<typeof Aurelia>;
    import(name: 'isomorphic-fetch'): Promise<typeof fetch>;
  }

  global {
    var System: System;
  }
}

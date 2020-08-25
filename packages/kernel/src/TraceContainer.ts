import { Container, ContainerConfiguration, Key, Resolved } from './di';

import { ILogger } from './logger';

export class TraceContainer extends Container {
  public constructor(parent: Container | null, config: ContainerConfiguration) {
    super(parent, config);
  }
  public get<K extends Key>(key: K | Key): Resolved<K> {
    if (key !== ILogger) {
      this.get(ILogger).trace('getting ', key);
    }
    return this.get(key);
  }
}

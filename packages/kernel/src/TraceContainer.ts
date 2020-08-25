import { Container, ContainerConfiguration, Key, Resolved } from './di';

import { ILogger } from './logger';

export class TraceContainer extends Container {
  public constructor(parent: Container | null, config: ContainerConfiguration) {
    super(parent, config);
  }

  private _logger: ILogger | null = null;

  private get logger(): ILogger | null {
    if (this._logger === null && super.has(ILogger, true)) {
      this._logger = super.get(ILogger);
    }
    return this._logger;
  }

  public get<K extends Key>(key: K | Key): Resolved<K> {
    this.logger?.trace('getting ', key);

    return this.get(key);
  }
}

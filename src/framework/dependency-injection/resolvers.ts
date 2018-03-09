import { Container } from './container';

export class StrategyResolver {
  public strategy: StrategyResolver | number;
  public state: any;

  /**
   * Creates an instance of the StrategyResolver class.
   * @param strategy The type of resolution strategy.
   * @param state The state associated with the resolution strategy.
   */
  constructor(strategy: StrategyResolver | number, state: any) {
    this.strategy = strategy;
    this.state = state;
  }

  /**
   * Called by the container to allow custom resolution of dependencies for a function/class.
   * @param container The container to resolve from.
   * @param key The key that the resolver was registered as.
   * @return Returns the resolved object.
   */
  public get(container: Container, key: any): any {
    switch (this.strategy) {
      case 0: //instance
        return this.state;
      case 1: //singleton
        let singleton = container.invoke(this.state);
        this.state = singleton;
        this.strategy = 0;
        return singleton;
      case 2: //transient
        return container.invoke(this.state);
      case 3: //function
        return this.state(container, key, this);
      case 4: //array
        return this.state[0].get(container, key);
      case 5: //alias
        return container.get(this.state);
      default:
        throw new Error('Invalid strategy: ' + this.strategy);
    }
  }
}

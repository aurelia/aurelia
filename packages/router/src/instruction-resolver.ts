export interface IInstructionResolverOptions {
  separators?: IRouteSeparators;
}

export interface IRouteSeparators {
  viewport: string;
  sibling: string;
  scope: string;
  ownsScope: string;
  parameters: string;
  add: string;
  clear: string;
  action: string;
}

export class InstructionResolver {

  public separators: IRouteSeparators;

  public activate(options?: IInstructionResolverOptions): void {
    this.separators = {
      ... {
        viewport: '@', // ':',
        sibling: '+', // '/',
        scope: '/', // '+',
        ownsScope: '!',
        parameters: '=',
        add: '+',
        clear: '-',
        action: '.',
      }, ...options.separators
    };
  }
}

import { customElement } from '@aurelia/runtime-html';
import { ILogger } from '@aurelia/kernel';

@customElement({
  name: 'about',
  template: `ABOUT [\${id}] <input>`,
})
export class About {
  public static parameters: string[] = ['id'];

  public id: string = 'no id provided';

  public constructor(
    @ILogger private readonly logger: ILogger,
  ) {
    this.logger = logger.scopeTo(this.constructor.name);
  }

  public enter(parameters, instruction) {
    this.logger.debug('enter', parameters, instruction);
    if (parameters.id) {
      this.id = parameters.id;
    }
  }
}

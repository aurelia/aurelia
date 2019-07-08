import { DI, IContainer, IRegistry } from '@aurelia/kernel';
import { TCustomAttribute } from './t-custom-attribute';

const TCustomAttributeRegistration = TCustomAttribute as IRegistry;
export const I18nConfiguration = {
  register(container: IContainer): IContainer {
    return container.register(TCustomAttributeRegistration);
  },
  /**
   * Create a new container with this configuration applied to it.
   */
  createContainer(): IContainer {
    return this.register(DI.createContainer());
  }
}

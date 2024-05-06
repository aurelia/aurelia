import { I18nConfiguration, I18nInitOptions, II18nextWrapper } from '@aurelia/i18n';
import { DI, EventAggregator, IContainer, IEventAggregator, Registration } from '@aurelia/kernel';
import { ISignaler } from '@aurelia/runtime-html';
import { MockSignaler } from '@aurelia/testing';

export interface I18nConfiguration {
  ea: IEventAggregator;
  initOptions: I18nInitOptions;
  i18nextWrapper: II18nextWrapper;
}
export function createI18NContainer({
  ea = new EventAggregator(),
  initOptions,
  i18nextWrapper,
}: Partial<I18nConfiguration> = {}): IContainer {
  const container = DI.createContainer();
  container.register(
    Registration.singleton(ISignaler, MockSignaler),
    Registration.instance(IEventAggregator, ea),
    I18nConfiguration.customize((x) => {
      x.initOptions = initOptions ?? x.initOptions;
      x.i18nextWrapper = i18nextWrapper;
    }),
  );
  return container;
}

import {
  ITemplateCompilerRegistration,
  ITargetAccessorLocatorRegistration,
  ITargetObserverLocatorRegistration,

  RepeatRegistration,
  OneTimeBindingBehaviorRegistration,
  DotSeparatedAttributePatternRegistration,

  DefaultBindingCommandRegistration,
  ForBindingCommandRegistration,

  PropertyBindingRendererRegistration,
  IteratorBindingRendererRegistration,

  CustomElementRendererRegistration,
  TemplateControllerRendererRegistration,
  DelegateBindingCommandRegistration,

  TextBindingRendererRegistration,
  ListenerBindingRendererRegistration,

  Aurelia,
} from '@aurelia/runtime-html';
import { AddressViewer } from './address-viewer';

import { App, FormatDate } from './app';
import { iar, ipr } from './registrations';

(global as any)['Aurelia'] = new Aurelia()
  .register(
    ITemplateCompilerRegistration,
    ITargetAccessorLocatorRegistration,
    ITargetObserverLocatorRegistration,

    DotSeparatedAttributePatternRegistration,

    RepeatRegistration,
    OneTimeBindingBehaviorRegistration,

    DefaultBindingCommandRegistration,
    DelegateBindingCommandRegistration,
    ForBindingCommandRegistration,

    TextBindingRendererRegistration,
    ListenerBindingRendererRegistration,
    PropertyBindingRendererRegistration,
    IteratorBindingRendererRegistration,
    CustomElementRendererRegistration,
    TemplateControllerRendererRegistration,
    ipr,
    iar,
    FormatDate,
    AddressViewer,
  )
  .app({
    host: document.querySelector('app') as HTMLElement,
    component: App
  })
  .start();

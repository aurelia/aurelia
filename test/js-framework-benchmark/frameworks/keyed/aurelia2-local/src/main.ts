import {
  ITemplateCompilerRegistration,
  DefaultNodeObserverLocatorRegistration,

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

import { App } from './app';

global['Aurelia'] = new Aurelia()
  .register(
    ITemplateCompilerRegistration,
    DefaultNodeObserverLocatorRegistration,

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
  )
  .app({
    host: document.querySelector('app'),
    component: App
  })
  .start();

import {
  ITemplateCompilerRegistration,
  ITargetAccessorLocatorRegistration,
  ITargetObserverLocatorRegistration,

  RepeatRegistration,
  OneTimeBindingBehaviorRegistration,
  DotSeparatedAttributePatternRegistration,

  DefaultBindingCommandRegistration,
  ForBindingCommandRegistration,

  PropertyBindingComposerRegistration,
  IteratorBindingComposerRegistration,

  CustomElementComposerRegistration,
  TemplateControllerComposerRegistration,
  DelegateBindingCommandRegistration,

  TextBindingComposerRegistration,
  ListenerBindingComposerRegistration,

  Aurelia,
} from '@aurelia/runtime-html';

import { App } from './app';

global['Aurelia'] = new Aurelia()
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

    TextBindingComposerRegistration,
    ListenerBindingComposerRegistration,
    PropertyBindingComposerRegistration,
    IteratorBindingComposerRegistration,
    CustomElementComposerRegistration,
    TemplateControllerComposerRegistration,
  )
  .app({
    host: document.querySelector('app'),
    component: App
  })
  .start();

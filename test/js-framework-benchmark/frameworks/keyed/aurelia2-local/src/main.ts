import {
  RepeatRegistration,
  OneTimeBindingBehaviorRegistration,
} from '@aurelia/runtime';
import {
  ITemplateCompilerRegistration,
  IProjectorLocatorRegistration,
  ITargetAccessorLocatorRegistration,
  ITargetObserverLocatorRegistration,

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
    IProjectorLocatorRegistration,
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

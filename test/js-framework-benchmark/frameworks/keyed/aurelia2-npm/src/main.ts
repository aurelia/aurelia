import {
  DotSeparatedAttributePatternRegistration,

  DefaultBindingCommandRegistration,
  ForBindingCommandRegistration,

  PropertyBindingComposerRegistration,
  IteratorBindingComposerRegistration,

  CustomElementComposerRegistration,
  TemplateControllerComposerRegistration,

  RepeatRegistration,
  OneTimeBindingBehaviorRegistration,

  Aurelia,
} from '@aurelia/runtime';
import {
  ITemplateCompilerRegistration,
  ITemplateElementFactoryRegistration,
  IAttrSyntaxTransformerRegistation,
  IProjectorLocatorRegistration,
  ITargetAccessorLocatorRegistration,
  ITargetObserverLocatorRegistration,

  DelegateBindingCommandRegistration,

  TextBindingComposerRegistration,
  ListenerBindingComposerRegistration,
} from '@aurelia/runtime-html';
import {
  IDOMInitializerRegistration,
} from '@aurelia/runtime-html';

import { App } from './app';

global['Aurelia'] = new Aurelia()
  .register(

    ITemplateCompilerRegistration,
    ITemplateElementFactoryRegistration,
    IAttrSyntaxTransformerRegistation,
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

    IDOMInitializerRegistration,
  )
  .app({
    host: document.querySelector('app'),
    component: App
  })
  .start();

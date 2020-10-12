import {
  IStartTaskManagerRegistration,

  DotSeparatedAttributePatternRegistration,

  DefaultBindingCommandRegistration,
  ForBindingCommandRegistration,

  PropertyBindingRendererRegistration,
  IteratorBindingRendererRegistration,

  CustomElementRendererRegistration,
  TemplateControllerRendererRegistration,

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

  TextBindingRendererRegistration,
  ListenerBindingRendererRegistration,
} from '@aurelia/runtime-html';
import {
  IDOMInitializerRegistration,
} from '@aurelia/runtime-html-browser';

import { App } from './app';

global['Aurelia'] = new Aurelia()
  .register(
    IStartTaskManagerRegistration,

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

    TextBindingRendererRegistration,
    ListenerBindingRendererRegistration,
    PropertyBindingRendererRegistration,
    IteratorBindingRendererRegistration,
    CustomElementRendererRegistration,
    TemplateControllerRendererRegistration,

    IDOMInitializerRegistration,
  )
  .app({
    host: document.querySelector('app'),
    component: App
  })
  .start();

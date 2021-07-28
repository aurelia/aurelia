import {
  Aurelia,
  CustomElementRendererRegistration,
  DefaultBindingCommandRegistration,
  DelegateBindingCommandRegistration,
  DotSeparatedAttributePatternRegistration,
  ForBindingCommandRegistration,
  INodeObserverLocatorRegistration,
  ITemplateCompilerRegistration,
  InterpolationBindingRendererRegistration,
  IteratorBindingRendererRegistration,
  ListenerBindingRendererRegistration,
  OneTimeBindingBehaviorRegistration,
  PropertyBindingRendererRegistration,
  RepeatRegistration,
  TemplateControllerRendererRegistration,
  TextBindingRendererRegistration
} from '@aurelia/runtime-html';

import { App } from './app';

global['Aurelia'] = new Aurelia()
  .register(
    ITemplateCompilerRegistration,
    INodeObserverLocatorRegistration,
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
    InterpolationBindingRendererRegistration,
  )
  .app({
    host: document.querySelector('app'),
    component: App
  })
  .start();

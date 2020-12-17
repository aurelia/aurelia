import * as faker from 'faker';
import {
  Aurelia,
  IfRegistration,
  ElseRegistration,
  RepeatRegistration,
  OneTimeBindingBehaviorRegistration,
  TwoWayBindingBehaviorRegistration,
  CustomElementRendererRegistration,
  InterpolationBindingRendererRegistration,
  IteratorBindingRendererRegistration,
  PropertyBindingRendererRegistration,
  SetPropertyRendererRegistration,
  TemplateControllerRendererRegistration,
  ValueConverter,
  AtPrefixedTriggerAttributePatternRegistration,
  ColonPrefixedBindAttributePatternRegistration,
  DotSeparatedAttributePatternRegistration,
  DefaultBindingCommandRegistration,
  ForBindingCommandRegistration,
  OneTimeBindingCommandRegistration,
  TwoWayBindingCommandRegistration,
  ITargetAccessorLocatorRegistration,
  ComposeRegistration,
  ListenerBindingRendererRegistration,
  SetAttributeRendererRegistration,
  TextBindingRendererRegistration,
  ITargetObserverLocatorRegistration,
  ITemplateCompilerRegistration,
  TriggerBindingCommandRegistration,
} from '@aurelia/runtime-html';
import {
  ViewportCustomElement,
  Router
} from '@aurelia/router';
import { App } from './app';
import { DI, camelCase } from '@aurelia/kernel';

window['faker'] = faker;

// manually compose the app from individual registrations, leaving out some stuff that we're not going
// to use (yet)
const container = DI.createContainer().register(
  // runtime resources
  IfRegistration,
  ElseRegistration,
  RepeatRegistration,

  OneTimeBindingBehaviorRegistration,
  TwoWayBindingBehaviorRegistration,

  // runtime renderers
  CustomElementRendererRegistration,
  InterpolationBindingRendererRegistration,
  IteratorBindingRendererRegistration,
  PropertyBindingRendererRegistration,
  SetPropertyRendererRegistration,
  TemplateControllerRendererRegistration,

  // runtime-html components
  ITargetObserverLocatorRegistration,
  ITargetAccessorLocatorRegistration,

  // runtime-html resources
  ComposeRegistration,

  // runtime-html renderers
  ListenerBindingRendererRegistration,
  SetAttributeRendererRegistration,
  TextBindingRendererRegistration,

  // jit attribute patterns
  DotSeparatedAttributePatternRegistration,
  AtPrefixedTriggerAttributePatternRegistration,
  ColonPrefixedBindAttributePatternRegistration,

  // jit binding commands
  DefaultBindingCommandRegistration,
  ForBindingCommandRegistration,
  OneTimeBindingCommandRegistration,
  TwoWayBindingCommandRegistration,

  // jit-html components
  ITemplateCompilerRegistration,

  // jit-html binding commands
  TriggerBindingCommandRegistration,

  // router registrations
  ViewportCustomElement as any,
  Router as any,

  // custom inline registrations
  ValueConverter.define('pascal', class {
    public toView(input: string): string {
      const camel = camelCase(input);
      return camel.slice(0, 1).toUpperCase() + camel.slice(1);
    }
  }),
  ValueConverter.define('sort', class {
    public toView(arr: unknown[], prop?: string, dir: 'asc' | 'desc' = 'asc'): unknown[] {
      if (Array.isArray(arr)) {
        const factor = dir === 'asc' ? 1 : -1;
        if (prop && prop.length) {
          arr.sort((a, b) => a[prop] - b[prop] * factor);
        } else {
          arr.sort((a, b) => a - b * factor);
        }
      }
      return arr;
    }
  })
);

const au = window['au'] = new Aurelia(container);
au.app({ host: document.querySelector('app'), component: App });
void au.start();

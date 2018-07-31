import { IContainer, Registration } from '@aurelia/kernel';
import * as ExpressionParser from './binding/expression-parser';
import { If } from '@aurelia/runtime';
import { Else } from '@aurelia/runtime';
import { Repeat } from '@aurelia/runtime';
import { Compose } from '@aurelia/runtime';
import { AttrBindingBehavior } from '@aurelia/runtime';
import { OneTimeBindingBehavior, TwoWayBindingBehavior, ToViewBindingBehavior } from '@aurelia/runtime';
import { DebounceBindingBehavior } from '@aurelia/runtime';
import { Replaceable } from '@aurelia/runtime';
import { With } from '@aurelia/runtime';
import { SanitizeValueConverter } from '@aurelia/runtime';
import { SelfBindingBehavior } from '@aurelia/runtime';
import { SignalBindingBehavior } from '@aurelia/runtime';
import { ThrottleBindingBehavior } from '@aurelia/runtime';
import { UpdateTriggerBindingBehavior } from '@aurelia/runtime';
import { ITemplateCompiler } from '@aurelia/runtime';
import { TemplateCompiler } from "./templating/template-compiler";

const globalResources: any[] = [
  Compose,
  If,
  Else,
  Repeat,
  Replaceable,
  With,
  SanitizeValueConverter,
  AttrBindingBehavior,
  DebounceBindingBehavior,
  OneTimeBindingBehavior,
  ToViewBindingBehavior,
  SelfBindingBehavior,
  SignalBindingBehavior,
  ThrottleBindingBehavior,
  TwoWayBindingBehavior,
  UpdateTriggerBindingBehavior
];

export const BasicConfiguration = {
  register(container: IContainer) { 
    container.register(
      ExpressionParser,
      Registration.singleton(ITemplateCompiler, TemplateCompiler),
      ...globalResources
    );
  }
}

import { IContainer, Registration } from "../kernel/di";
import * as ExpressionParser from './binding/expression-parser';
import { If } from "../runtime/templating/resources/if";
import { Else } from "../runtime/templating/resources/else";
import { Repeat } from "../runtime/templating/resources/repeat/repeat";
import { Compose } from "../runtime/templating/resources/compose";
import { AttrBindingBehavior } from "../runtime/binding/resources/attr-binding-behavior";
import { OneTimeBindingBehavior, TwoWayBindingBehavior, ToViewBindingBehavior } from "../runtime/binding/resources/binding-mode-behaviors";
import { DebounceBindingBehavior } from "../runtime/binding/resources/debounce-binding-behavior";
import { Replaceable } from "../runtime/templating/resources/replaceable";
import { With } from "../runtime/templating/resources/with";
import { SanitizeValueConverter } from "../runtime/binding/resources/sanitize";
import { SelfBindingBehavior } from "../runtime/binding/resources/self-binding-behavior";
import { SignalBindingBehavior } from "../runtime/binding/resources/signals";
import { ThrottleBindingBehavior } from "../runtime/binding/resources/throttle-binding-behavior";
import { UpdateTriggerBindingBehavior } from "../runtime/binding/resources/update-trigger-binding-behavior";
import { ITemplateCompiler } from "../runtime/templating/template-compiler";
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

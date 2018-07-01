import { IContainer, Registration } from "../kernel/di";
import * as ExpressionParser from './binding/expression-parser';
import { If } from "../runtime/resources/if";
import { Else } from "../runtime/resources/else";
import { Repeat } from "../runtime/resources/repeat/repeat";
import { Compose } from "../runtime/resources/compose";
import { AttrBindingBehavior } from "../runtime/resources/attr-binding-behavior";
import { OneTimeBindingBehavior, TwoWayBindingBehavior, OneWayBindingBehavior } from "../runtime/resources/binding-mode-behaviors";
import { DebounceBindingBehavior } from "../runtime/resources/debounce-binding-behavior";
import { Replaceable } from "../runtime/resources/replaceable";
import { With } from "../runtime/resources/with";
import { SanitizeValueConverter } from "../runtime/resources/sanitize";
import { SelfBindingBehavior } from "../runtime/resources/self-binding-behavior";
import { SignalBindingBehavior } from "../runtime/resources/signals";
import { ThrottleBindingBehavior } from "../runtime/resources/throttle-binding-behavior";
import { UpdateTriggerBindingBehavior } from "../runtime/resources/update-trigger-binding-behavior";
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
  OneWayBindingBehavior,
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

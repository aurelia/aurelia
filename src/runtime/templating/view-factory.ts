import { Visual, IVisual } from "./visual";
import { Template, CompiledViewSource, ITemplate } from "./template";
import { IShadowSlot } from "./shadow-dom";

export const ViewFactory = {
  fromCompiledSource(source: CompiledViewSource): () => IVisual {
    const template = Template.fromCompiledSource(source);

    const CompiledVisual = class extends Visual {
      static template: ITemplate = template;
      static source: CompiledViewSource = source;

      $slots: Record<string, IShadowSlot> = source.hasSlots ? {} : null;

      createView() {
        return template.createFor(this);
      }
    }

    return function() { return new CompiledVisual(); }
  }
};

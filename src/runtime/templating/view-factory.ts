import { Visual, IVisual } from "./visual";
import { Template, CompiledViewSource } from "./template";

export const ViewFactory = {
  fromCompiledSource(source: CompiledViewSource): () => IVisual {
    let template = Template.fromCompiledSource(source);
    return function() { return new Visual(template); }
  }
};

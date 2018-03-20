import { CompiledElementConfiguration } from "./compiled-element";
import { Template } from "./framework/templating/template";

export const config: CompiledElementConfiguration = {
  template: new Template(`
    <div>
      <au-marker class="au"></au-marker> <br>
      <input type="text" class="au">
    </div>
  `)
};

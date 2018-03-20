import { CompiledElementConfiguration } from "./compiled-element";
import { Template } from "./framework/templating/template";

//this object is built up during compilation
export const config: CompiledElementConfiguration = {
  name: 'app',
  template: new Template(`
    <div>
      <au-marker class="au"></au-marker> <br>
      <input type="text" class="au">
    </div>
  `)
};

import { IRouter, RouterConfiguration, RoutingInstruction } from 'aurelia-direct-router';
import { customElement } from '@aurelia/runtime-html';
import { Auth } from "./main/auth";
import template from './my-app.html';
import './my-app.css';

@customElement({
  name: 'my-app',
  template,
})
export class MyApp {
  public constructor(@IRouter private router: IRouter, private auth: Auth) {
  }

  public bound() {
    RouterConfiguration.addHook(async (instructions: RoutingInstruction[]) => {
      if (this.auth.checkAccess() || instructions.length === 0) {
        return true;
      }
      this.auth.redirectInstructions = instructions;
      return [RoutingInstruction.create('login', instructions[0].viewport.instance)];
    }, { exclude: ['welcome', 'about', 'login'] });
  }
}

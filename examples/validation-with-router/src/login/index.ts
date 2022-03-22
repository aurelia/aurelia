import { newInstanceForScope } from '@aurelia/kernel';
import { IValidationRules } from '@aurelia/validation';
import { IValidationController } from '@aurelia/validation-html';
import { IRouter, IRouteViewModel } from '@aurelia/router-lite';
import { customElement, IPlatform } from '@aurelia/runtime-html';
import { IAuthenticationService, UserLogin } from '../services/AuthenticationService';
import template from './index.html';

@customElement({ name: 'auth-view', template })
export class AuthViewCustomElement implements IRouteViewModel {
  private readonly user: UserLogin;

  public constructor(
    @IPlatform public readonly platform: IPlatform,
    @IRouter public readonly router: IRouter,
    @newInstanceForScope(IValidationController) private readonly validationController: IValidationController,
    @IValidationRules private readonly validationRules: IValidationRules,
    @IAuthenticationService private readonly authService: IAuthenticationService,
  ) {
    this.user = new UserLogin('', '');
  }

  public load(): void {
    this.authService.logout();

    this.validationRules
      .on(this.user)
        .ensure('username')
          .required()
        .ensure(o => o.password)
          .required();
  }

  public unload(): void | Promise<void> {
    this.validationRules.off(this.user);
  }

  public async submit(event: Event): Promise<void> {
    event.preventDefault();
    event.stopPropagation();

    if (!(await this.validationController.validate()).valid) { return; }

    await this.platform.taskQueue.queueTask(async () => {
      await this.authService.login({
        username: this.user.username,
        password: this.user.password,
      });
      await this.router.load('');
    }).result;
  }
}

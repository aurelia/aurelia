import { IRouter, IRouteViewModel } from '@aurelia/router';
import { customElement, IPlatform } from '@aurelia/runtime-html';
import { IAuthenticationService } from '../services/AuthenticationService';
import template from './index.html';

@customElement({ name: 'home-view', template })
export class HomeViewCustomElement implements IRouteViewModel {

  public constructor(
    @IPlatform private readonly platform: IPlatform,
    @IRouter private readonly router: IRouter,
    @IAuthenticationService private readonly authService: IAuthenticationService,
  ) { }

  private async goToLogin(): Promise<void> {
    this.authService.logout();
    await this.platform
      .taskQueue
      .queueTask(async () => {
        await this.router.load('login');
      }).result;
  }
}

import { customElement } from '@aurelia/runtime-html';
import template from './validate-workspace-page.html';
import { IRouteableComponent, IRouter } from '@aurelia/router';
import { inject } from 'aurelia';

@customElement({
  name: 'validate-workspace-page',
  template,
})
@inject(IRouter)
export class ValidateWorkspacePage implements IRouteableComponent {
    public constructor(
        private readonly router: IRouter //
    ) {}

    public async attached(): Promise<void> {
        // Ment to validate some things here.
        setTimeout(async () => {
            await this.router.load(`/abstergo`);
        }, 1000);
    }
}

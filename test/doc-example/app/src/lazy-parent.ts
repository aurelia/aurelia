import { IRouter } from '@aurelia/router';
import { customElement } from '@aurelia/runtime-html';
import { Slow } from './slow';
import { Fast } from './fast';

@customElement({
  name: 'lazy-parent',
  template: `
LazyParent \${seconds}
<div>
  <div class="links">
    <a load="fast">Fast</a>
    <a load="lazy-child">Lazy child</a>
    <button click.trigger="loadSibling()">Lazy sibling</button>
    <div load="fast">Fast div</div>
    <a load.bind="LazySibling">LazySibling</a>
    <a load.bind="Slow">Slow</a>
    <a load="-" class="clear">X</a>
  </div>
  <au-viewport name="lazy-parent"></au-viewport>
</div>
`})
export class LazyParent {
  public static routes = [
    { path: 'lazy-child', component: import('./lazy-child'), },
  ];
  public seconds = 0;

  public LazySibling = import('./lazy-sibling');
  public Slow = Slow;

  public constructor(@IRouter private readonly router: IRouter) { }

  public created(): void {
    const _this = this;
    setInterval(() => { _this.seconds++; }, 1000);
  }

  public loadSibling() {
    void this.router.load(import('./lazy-sibling'), { context: this });
  }
}

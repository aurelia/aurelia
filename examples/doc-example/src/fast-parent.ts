import { customElement } from '@aurelia/runtime-html';

@customElement({
  name: 'fast-parent',
  template: `
FastParent \${seconds}
<div>
  <div class="links">
    <a load="fast">Fast</a>
    <a load="slow">Slow</a>
    <a load="fast-parent">FastParent</a>
    <a load="langsam">Långsam</a>
    <a load="langsam/abc">Långsam abc</a>
    <a load="-" class="clear">X</a>
  </div>
  <au-viewport name="fast-parent"></au-viewport>
</div>
`})
export class FastParent {
  public static routes = [
    { path: 'langsam/:id?', component: 'slow', title: 'Långsam' },
  ];
  // public detaching() {
  //   return new Promise(r => setTimeout(r, 1000));
  // }
  public seconds = 0;

  public created(): void {
    const _this = this;
    setInterval(() => { _this.seconds++; }, 1000);
  }
}

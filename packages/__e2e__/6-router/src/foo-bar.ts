import { customElement, INode, resolve, watch } from 'aurelia';

@customElement({
  name: 'foo-bar',
  template: 'Foo Bar'
})
export class FooBar {
  /** @internal */ private readonly _el: INode<HTMLElement> = resolve<INode<HTMLElement>>(INode as unknown as INode<HTMLElement>);

  // eslint-disable-next-line @typescript-eslint/prefer-readonly
  private href: string | null = null;

  @watch('href')
  private hrefChanged() {
    if (this.href === null) {
      this._el.removeAttribute('href');
    } else {
      this._el.setAttribute('href', this.href);
    }
  }
}

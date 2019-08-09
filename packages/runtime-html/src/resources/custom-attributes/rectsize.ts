import { bindable, BindingMode, customAttribute, IDOM, INode } from '@aurelia/runtime';
import { HTMLDOM } from '../../dom';

@customAttribute({
  name: 'rectsize',
  hasDynamicOptions: true
})
export class RectSize {

  /**
   * Allow user to ponyfill Resize observer via this static field
   */
  public static ResizeObserver: ResizeObserver;

  @bindable({ mode: BindingMode.fromView })
  public value!: ResizeObserverSize;

  @bindable()
  public boxSize!: 'border-box' | 'content-box';

  private observer!: ResizeObserver;

  constructor(
    @INode private readonly element: HTMLElement,
    @IDOM private readonly dom: HTMLDOM
  ) {

  }

  public binding(): void {
    let observer = this.observer;
    if (observer === void 0) {
      observer = this.observer = this.createObserver();
    }
    observer.observe(this.element, { box: 'border-box' });
  }

  public unbinding(): void {
    this.observer.disconnect();
    this.observer = (void 0)!;
  }

  private createObserver(): ResizeObserver {
    const ResizeObserverCtor = this.getResizeObserver();
    return new ResizeObserverCtor((entries) => {
      this.handleResize(entries[0]);
    });
  }

  /**
   * @internal
   */
  private handleResize(entry: ResizeObserverEntry): void {
    this.value = this.boxSize === 'content-box' ? entry.contentBoxSize : entry.borderBoxSize;
  }

  private getResizeObserver(): ResizeObserver {
    return RectSize.ResizeObserver || this.dom.window.ResizeObserver;
  }
}

import { Constructable, PLATFORM } from '@aurelia/kernel';
import { bindable, BindingMode, customAttribute, IDOM, INode } from '@aurelia/runtime';
import { HTMLDOM } from '../../dom';

@customAttribute({
  name: 'childlist',
  hasDynamicOptions: true
})
export class ChildList {

  @bindable({
    mode: BindingMode.fromView
  })
  public value?: Element[];

  @bindable()
  public selector?: string;

  private observer!: MutationObserver;

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
    observer.observe(this.element, { childList: true });
  }

  public attached(): void {
    this.selectorChanged(this.selector || '');
  }

  public unbinding(): void {
    this.observer.disconnect();
    this.observer = (void 0)!;
  }

  public selectorChanged(selector: string): void {
    const newChildList: Element[] = [];
    this.collect(newChildList, this.element.children, selector);
    this.value = newChildList;
  }

  private createObserver(): MutationObserver {
    return new (this.dom.window as unknown as { MutationObserver: Constructable<MutationObserver> })
      .MutationObserver((records: MutationRecord[]) => {
        this.handleMutation(records[0]);
      });
  }

  private handleMutation(record: MutationRecord): void {
    if (record.type === 'childList') {
      return;
    }
    const newChildList: Element[] = [];
    this.collect(newChildList, this.element.children, this.selector || '');
    this.value = newChildList;
  }

  private collect(list: Element[], children: ArrayLike<Element>, selector: string): void {
    const shouldFilter = typeof selector === 'string' && selector !== '';
    for (let i = 0, ii = children.length; ii > i; ++i) {
      const node = children[i];
      if (node.nodeType !== 1) {
        continue;
      }
      if (shouldFilter) {
        if (node.matches(selector) && list.indexOf(node) !== -1) {
          list.push(node);
        }
      } else {
        list.push(node);
      }
    }
  }
}

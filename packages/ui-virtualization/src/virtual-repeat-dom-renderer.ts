import { IPlatform, IRenderLocation } from '@aurelia/runtime-html';
import { IContainer, Registration } from '@aurelia/kernel';
import { IVirtualRepeatDom, IDomRenderer } from './interfaces';
import { getScrollerElement } from './utilities-dom';

export class DefaultDomRenderer implements IDomRenderer {
  /** @internal */
  protected static get inject() { return [IPlatform]; }

  public static register(container: IContainer) {
    return Registration.singleton(IDomRenderer, this).register(container);
  }

  public constructor(
    protected p: IPlatform,
  ) { }

  public render(target: HTMLElement | IRenderLocation): IVirtualRepeatDom {
    const doc = this.p.document;
    const parent = target.parentNode as Element;
    // Todo: should this ever happen?
    if (parent === null) {
      throw new Error('Invalid render target');
    }
    let bufferEls: [HTMLElement, HTMLElement];
    switch (parent.tagName) {
      case 'TBODY':
      case 'THEAD':
      case 'TFOOT':
      case 'TABLE':
        bufferEls = insertBefore(doc, 'tr', target);
        return new TableDom(parent.closest('table')!, target, bufferEls[0], bufferEls[1]);
      case 'UL':
      case 'OL':
        // less chance of disturbing CSS of UL/OL
        bufferEls = insertBefore(doc, 'div', target);
        return new ListDom(parent as HTMLOListElement, target, bufferEls[0], bufferEls[1]);
      default:
        bufferEls = insertBefore(doc, 'div', target);
        return new DefaultDom(target, bufferEls[0], bufferEls[1]);
    }
  }
}

class DefaultDom implements IVirtualRepeatDom {
  public tH: number = 0;
  public bH: number = 0;
  public constructor(
    public readonly anchor: HTMLElement | IRenderLocation,
    public readonly top: HTMLElement,
    public readonly bottom: HTMLElement,
  ) { }

  public get scroller(): HTMLElement {
    return getScrollerElement(this.anchor);
  }

  public get distances(): [number, number] {
    return [this.tH, this.bH];
  }

  public update(top: number, bot: number): void {
    this.top.style.height = `${this.tH = top}px`;
    this.bottom.style.height = `${this.bH = bot}px`;
  }

  public dispose(): void {
    this.top.remove();
    this.bottom.remove();
  }
}

class ListDom extends DefaultDom {
  public constructor(
    public readonly list: HTMLUListElement | HTMLOListElement,
    anchor: HTMLElement | IRenderLocation,
    top: HTMLElement,
    bottom: HTMLElement,
  ) {
    super(anchor, top, bottom);
  }

  public get scroller(): HTMLElement {
    return getScrollerElement(this.list);
  }
}

class TableDom extends DefaultDom {
  public constructor(
    public readonly table: HTMLTableElement,
    anchor: HTMLElement | IRenderLocation,
    top: HTMLElement,
    bottom: HTMLElement,
  ) {
    super(anchor, top, bottom);
  }

  public get scroller(): HTMLElement {
    return getScrollerElement(this.table);
  }
}

function insertBefore(doc: Document, el: string, target: HTMLElement | IRenderLocation): [HTMLElement, HTMLElement] {
  const parent = target.parentNode!;
  return [
    parent.insertBefore(doc.createElement(el), target),
    parent.insertBefore(doc.createElement(el), target),
  ];
}

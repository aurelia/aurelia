import { IPlatform, IRenderLocation } from '@aurelia/runtime-html';
import { IContainer, Registration } from '@aurelia/kernel';
import { IVirtualRepeatDom, IDomRenderer } from './interfaces';
import { getScrollerElement } from './utilities-dom';
import { createMappedError, ErrorNames } from './errors';

export class DefaultDomRenderer implements IDomRenderer {
  /** @internal */
  protected static get inject() { return [IPlatform]; }

  public static register(container: IContainer) {
    return Registration.singleton(IDomRenderer, this).register(container);
  }

  public constructor(
    protected p: IPlatform,
  ) { }

  public render(target: HTMLElement | IRenderLocation, layout: 'vertical' | 'horizontal' = 'vertical'): IVirtualRepeatDom {
    const doc = this.p.document;
    const parent = target.parentNode as Element;
    // Todo: should this ever happen?
    if (parent === null) {
      throw createMappedError(ErrorNames.invalid_render_target);
    }
    let bufferEls: [HTMLElement, HTMLElement];
    switch (parent.tagName) {
      case 'TBODY':
      case 'THEAD':
      case 'TFOOT':
      case 'TABLE':
        bufferEls = insertBefore(doc, 'tr', target);
        return new TableDom(parent.closest('table')!, target, bufferEls[0], bufferEls[1], layout);
      case 'UL':
      case 'OL':
        // less chance of disturbing CSS of UL/OL
        bufferEls = insertBefore(doc, 'div', target);
        return new ListDom(parent as HTMLOListElement, target, bufferEls[0], bufferEls[1], layout);
      default:
        bufferEls = insertBefore(doc, 'div', target);
        return new DefaultDom(target, bufferEls[0], bufferEls[1], layout);
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
    public readonly layout: 'vertical' | 'horizontal',
  ) { }

  public get scroller(): HTMLElement {
    return getScrollerElement(this.anchor, this.layout);
  }

  public get distances(): [number, number] {
    return [this.tH, this.bH];
  }

  public update(top: number, bot: number): void {
    if (this.layout === 'horizontal') {
      this.top.style.width = `${this.tH = top}px`;
      this.bottom.style.width = `${this.bH = bot}px`;
      // Reset height and set display to inline-block for horizontal layout
      this.top.style.height = '100%';
      this.bottom.style.height = '100%';
      this.top.style.display = 'inline-block';
      this.bottom.style.display = 'inline-block';
    } else {
      this.top.style.height = `${this.tH = top}px`;
      this.bottom.style.height = `${this.bH = bot}px`;
      // Reset width for vertical layout
      this.top.style.width = '';
      this.bottom.style.width = '';
      this.top.style.display = '';
      this.bottom.style.display = '';
    }
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
    layout: 'vertical' | 'horizontal',
  ) {
    super(anchor, top, bottom, layout);
  }

  public get scroller(): HTMLElement {
    return getScrollerElement(this.list, this.layout);
  }
}

class TableDom extends DefaultDom {
  public constructor(
    public readonly table: HTMLTableElement,
    anchor: HTMLElement | IRenderLocation,
    top: HTMLElement,
    bottom: HTMLElement,
    layout: 'vertical' | 'horizontal',
  ) {
    super(anchor, top, bottom, layout);
  }

  public get scroller(): HTMLElement {
    return getScrollerElement(this.table, this.layout);
  }
}

function insertBefore(doc: Document, el: string, target: HTMLElement | IRenderLocation): [HTMLElement, HTMLElement] {
  const parent = target.parentNode!;
  return [
    parent.insertBefore(doc.createElement(el), target),
    parent.insertBefore(doc.createElement(el), target),
  ];
}

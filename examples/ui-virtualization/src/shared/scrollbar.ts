import { customAttribute, bindable, IPlatform } from '@aurelia/runtime-html';

const scrollbarStyle = `
.sb {
  scrollbar-width: thin;
  scrollbar-color: royalblue;
}
.sb.sb-x, .scrollbar-x {
  overflow-x: auto;
  overflow-y: hidden;
}
.sb.sb-y, .scrollbar-y {
  overflow-x: hidden;
  overflow-y: auto;
}
.sb::-webkit-scrollbar {
  width: 6px;
  background-color: rgba(224, 224, 224, 0.5);
}
.sb::-webkit-scrollbar:vertical {
  width: 6px;
  scrollbar-width: 6px;
}
.sb::-webkit-scrollbar:horizontal {
  height: 6px;
  scrollbar-width: 6px;
}

.sb::-webkit-scrollbar-thumb {
  background-color: royalblue;
}`;

@customAttribute('scrollbar')
export class Scrollbar {

  public static inject = [Element, IPlatform];

  @bindable
  value: 'vertical' | 'horizontal' | 'y' | 'x';

  constructor(private element: Element, p: IPlatform) {
    const doc = p.document;
    if (!('hasSb' in doc)) {
      const style = doc.createElement('style');
      style.textContent = scrollbarStyle;
      document.head.appendChild(style);
      doc['hasSb'] = true;
    }
    element.classList.add('sb');
  }

  binding() {
    const element = this.element;
    const direction = this.value;
    const classList = element.classList;
    if (direction === 'horizontal' || direction === 'x') {
      classList.add('sb-x');
      classList.add('text-nowrap');
      element.addEventListener('wheel', this, true);
    } else {
      classList.add('sb-y');
    }
  }

  unbinding() {
    this.element.removeEventListener('wheel', this, true);
  }

  handleEvent(e: Event) {
    this.handleWheel(e as WheelEvent);
  }

  handleWheel(e: WheelEvent) {
    if (!e.shiftKey && e.deltaY !== 0) {
      (e.currentTarget as HTMLElement).scrollLeft += e.deltaY;
      e.stopImmediatePropagation();
      e.preventDefault();
    }
  }
}

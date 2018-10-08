import { State } from './state';
import { customElement, ICustomElement } from '@aurelia/runtime';
import view from './app.html';

export interface App extends ICustomElement {}

@customElement({
  name: 'app',
  templateOrNode: view,
  build: {
    required: true,
    compiler: 'default'
  },
  instructions: []
})
export class App {

  static inject = [State];

  baseTransform: string;
  base: number;

  root: SVGGElement;
  totalNodes: number;

  constructor(
    public state: State
  ) {
    let base = this.state.baseSize;
    // this.base = state.baseSize;
    // 'translate(50%, 100%) translate(-50px, 0) scale(100, -100)';
    this.baseTransform = `translate(50%, 100%) translate(-${base / 2}px, 0) scale(${base}, ${-base})`;
    // console.log(this.baseTransform = `translate(0.5, 1) (-${base / 2}px  0) scale(${base}, ${-base})`);
    window['app'] = this;
  }

  bound() {
    this.totalNodes = 2 ** (10 + 1);
    // this.root.style.transform = this.baseTransform;
    // tslint:disable-next-line:max-line-length
    // console.log('Same ??', this.baseTransform === 'translate(50%, 100%) translate(-50px, 0) scale(100, -100)', { base: this.baseTransform });
    // this.root.style.transform = 'translate(50%, 100%) translate(-50px, 0) scale(100, -100)';
  }

  attached() {
    const root = document.querySelector('svg').firstElementChild as SVGSVGElement;
    root.style.transform = this.baseTransform;
  }

  onMouseMove({ clientX, clientY }: MouseEvent) {
    this.state.mouseMoved(clientX, clientY);
  }
}

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
  totalNodes: number;

  constructor(
    public state: State,
  ) {
    const base = this.state.baseSize;
    this.totalNodes = 2 ** (10 + 1);
    this.baseTransform = `translate(50%, 100%) translate(-${base / 2}px, 0) scale(${base}, ${-base})`;
  }

  onMouseMove({ clientX, clientY }: MouseEvent) {
    this.state.mouseMoved(clientX, clientY);
  }
}

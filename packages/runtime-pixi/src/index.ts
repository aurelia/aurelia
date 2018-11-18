import { IContainer, Registration } from '@aurelia/kernel';
import { IRenderingEngine } from '@aurelia/runtime';
import { PixiRenderingEngine } from './pixi-renderering-engine';

export const PixiConfiguration = {
  register(container: IContainer): void {
    container.register(
      Registration.singleton(IRenderingEngine, PixiRenderingEngine),
    );
  }
};

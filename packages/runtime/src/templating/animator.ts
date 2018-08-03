import { DI } from '@aurelia/kernel';
import { INode } from '../dom';

export interface IAnimator {
  /**
   * Execute an 'enter' animation on an element
   * @param element Element to animate
   * @returns Resolved when the animation is done
   */
  enter(element: INode): Promise<boolean>;

  /**
   * Execute a 'leave' animation on an element
   * @param element Element to animate
   * @returns Resolved when the animation is done
   */
  leave(element: INode): Promise<boolean>;

  /**
   * Add a class to an element to trigger an animation.
   * @param element Element to animate
   * @param className Properties to animate or name of the effect to use
   * @returns Resolved when the animation is done
   */
  removeClass(element: INode, className: string): Promise<boolean>;

  /**
   * Add a class to an element to trigger an animation.
   * @param element Element to animate
   * @param className Properties to animate or name of the effect to use
   * @returns Resolved when the animation is done
   */
  addClass(element: INode, className: string): Promise<boolean>;
}

export const IAnimator = DI.createInterface<IAnimator>()
  .withDefault(x => x.singleton(class {
    public enter(node: INode): Promise<boolean> {
      return Promise.resolve(false);
    }

    public leave(node: INode): Promise<boolean> {
      return Promise.resolve(false);
    }

    public removeClass(node: INode, className: string): Promise<boolean> {
      (<Element>node).classList.remove(className);
      return Promise.resolve(false);
    }

    public addClass(node: INode, className: string): Promise<boolean> {
      (<Element>node).classList.add(className);
      return Promise.resolve(false);
    }
  })
);

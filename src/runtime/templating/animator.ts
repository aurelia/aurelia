import { DI } from "../di";

export const IAnimator = DI.createInterface('IAnimator');

export interface IAnimator {
  /**
   * Execute an 'enter' animation on an element
   * @param element Element to animate
   * @returns Resolved when the animation is done
   */
  enter(element: Element): Promise<boolean>;

  /**
   * Execute a 'leave' animation on an element
   * @param element Element to animate
   * @returns Resolved when the animation is done
   */
  leave(element: Element): Promise<boolean>;

  /**
   * Add a class to an element to trigger an animation.
   * @param element Element to animate
   * @param className Properties to animate or name of the effect to use
   * @returns Resolved when the animation is done
   */
  removeClass(element: Element, className: string): Promise<boolean>;

  /**
   * Add a class to an element to trigger an animation.
   * @param element Element to animate
   * @param className Properties to animate or name of the effect to use
   * @returns Resolved when the animation is done
   */
  addClass(element: Element, className: string): Promise<boolean>;
}

/**
 * An abstract class representing a mechanism for animating the DOM during various DOM state transitions.
 */
export const Animator: IAnimator = {
  enter(element: Element): Promise<boolean> {
    return Promise.resolve(false);
  },

  leave(element: Element): Promise<boolean> {
    return Promise.resolve(false);
  },

  removeClass(element: Element, className: string): Promise<boolean> {
    element.classList.remove(className);
    return Promise.resolve(false);
  },
  
  addClass(element: Element, className: string): Promise<boolean> {
    element.classList.add(className);
    return Promise.resolve(false);
  }
}

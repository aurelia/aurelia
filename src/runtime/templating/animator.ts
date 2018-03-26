/**
 * An abstract class representing a mechanism for animating the DOM during various DOM state transitions.
 */
export class Animator {
  static instance = new Animator();

  /**
   * Execute an 'enter' animation on an element
   * @param element Element to animate
   * @returns Resolved when the animation is done
   */
  enter(element: HTMLElement): Promise<boolean> {
    return Promise.resolve(false);
  }

  /**
   * Execute a 'leave' animation on an element
   * @param element Element to animate
   * @returns Resolved when the animation is done
   */
  leave(element: HTMLElement): Promise<boolean> {
    return Promise.resolve(false);
  }

  /**
   * Add a class to an element to trigger an animation.
   * @param element Element to animate
   * @param className Properties to animate or name of the effect to use
   * @returns Resolved when the animation is done
   */
  removeClass(element: HTMLElement, className: string): Promise<boolean> {
    element.classList.remove(className);
    return Promise.resolve(false);
  }

  /**
   * Add a class to an element to trigger an animation.
   * @param element Element to animate
   * @param className Properties to animate or name of the effect to use
   * @returns Resolved when the animation is done
   */
  addClass(element: HTMLElement, className: string): Promise<boolean> {
    element.classList.add(className);
    return Promise.resolve(false);
  }

  /**
   * Execute a single animation.
   * @param element Element to animate
   * @param className Properties to animate or name of the effect to use. For css animators this represents the className to be added and removed right after the animation is done.
   * @param options options for the animation (duration, easing, ...)
   * @returns Resolved when the animation is done
   */
  animate(element: HTMLElement | Array<HTMLElement>, className: string): Promise<boolean> {
    return Promise.resolve(false);
  }

  /**
   * Run a sequence of animations one after the other.
   * for example: animator.runSequence("fadeIn","callout")
   * @param sequence An array of effectNames or classNames
   * @returns Resolved when all animations are done
   */
  runSequence(animations:Array<any>): Promise<boolean> {
    return Promise.resolve(true);
  }

  /**
   * Register an effect (for JS based animators)
   * @param effectName identifier of the effect
   * @param properties Object with properties for the effect
   */
  registerEffect(effectName: string, properties: Object): void {}

  /**
   * Unregister an effect (for JS based animators)
   * @param effectName identifier of the effect
   */
  unregisterEffect(effectName: string): void {}
}

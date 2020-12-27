import { FoundRoute } from './found-route';
import { RoutingInstruction } from './instructions/routing-instruction';
import { Navigation } from './navigation';
import { IRouter } from './router';
import { RouterOptions } from './router-options';

/**
 *
 * NOTE: This file is still WIP and will go through at least one more iteration of refactoring, commenting and clean up!
 * In its current state, it is NOT a good source for learning about the inner workings and design of the router.
 *
 */

 export class Title {
  public static async getTitle(router: IRouter, instructions: RoutingInstruction[], instruction: Navigation): Promise<string | null> {
    // First invoke with viewport instructions
    let title: string | RoutingInstruction[] = await router.hookManager.invokeSetTitle(instructions, instruction);
    if (typeof title !== 'string') {
      // Hook didn't return a title, so run title logic
      const componentTitles = Title.stringifyTitles(router, title, instruction);

      title = RouterOptions.title.appTitle;
      title = title.replace("${componentTitles}", componentTitles);
      title = title.replace("${appTitleSeparator}",
        componentTitles !== ''
          ? RouterOptions.title.appTitleSeparator
          : '');
    }
    // Invoke again with complete string
    title = await router.hookManager.invokeSetTitle(title, instruction);

    return title as string;
  }

  private static stringifyTitles(router: IRouter, instructions: RoutingInstruction[], navigationInstruction: Navigation): string {
    const titles = instructions
      .map(instruction => Title.stringifyTitle(router, instruction, navigationInstruction))
      .filter(instruction => (instruction?.length ?? 0) > 0);

    return titles.join(' + ');
  }

  private static stringifyTitle(router: IRouter, instruction: RoutingInstruction | string, navigationInstruction: Navigation): string {
    if (typeof instruction === 'string') {
      return Title.resolveTitle(router, instruction, navigationInstruction);
    }
    const route = instruction.route ?? null;
    const nextInstructions: RoutingInstruction[] | null = instruction.nextScopeInstructions;
    let stringified: string = '';
    // It's a configured route
    if (route !== null) {
      // Already added as part of a configuration, skip to next scope
      if (route === '') {
        return Array.isArray(nextInstructions)
          ? Title.stringifyTitles(router, nextInstructions, navigationInstruction)
          : '';
      } else {
        stringified += Title.resolveTitle(router, route, navigationInstruction);
      }
    } else {
      stringified += Title.resolveTitle(router, instruction, navigationInstruction);
    }
    if (Array.isArray(nextInstructions) && nextInstructions.length > 0) {
      let nextStringified: string = Title.stringifyTitles(router, nextInstructions, navigationInstruction);
      if (nextStringified.length > 0) {
        if (nextInstructions.length !== 1) { // TODO: This should really also check that the instructions have value
          nextStringified = "[ " + nextStringified + " ]";
        }
        if (stringified.length > 0) {
          stringified = RouterOptions.title.componentTitleOrder === 'top-down'
            ? stringified + RouterOptions.title.componentTitleSeparator + nextStringified
            : nextStringified + RouterOptions.title.componentTitleSeparator + stringified;
        } else {
          stringified = nextStringified;
        }
      }
    }
    return stringified;
  }

  private static resolveTitle(router: IRouter, instruction: string | RoutingInstruction | FoundRoute, navigationInstruction: Navigation): string {
    let title = '';
    if (typeof instruction === 'string') {
      title = instruction;
    } else if (instruction instanceof RoutingInstruction) {
      return instruction.viewport.instance!.getTitle(navigationInstruction);
    } else if (instruction instanceof FoundRoute) {
      const routeTitle = instruction.match?.title;
      if ((routeTitle ?? null) !== null) {
        if (typeof routeTitle === 'string') {
          title = routeTitle;
        } else {
          title = routeTitle.call(instruction, instruction, navigationInstruction);
        }
      }
    }
    if ((RouterOptions.title.transformTitle ?? null) !== null) {
      title = RouterOptions.title.transformTitle!.call(router, title, instruction);
    }
    return title;
  }
}

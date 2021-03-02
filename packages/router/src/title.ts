import { RouterConfiguration } from './index.js';
import { RoutingInstruction } from './instructions/routing-instruction';
import { Navigation } from './navigation';
import { IRouter } from './router';
import { RoutingHook } from './routing-hook.js';

export class Title {
  public static async getTitle(router: IRouter, instructions: RoutingInstruction[], navigation: Navigation): Promise<string | null> {
    // First invoke with viewport instructions
    let title: string | RoutingInstruction[] = await RoutingHook.invokeTransformTitle(instructions, navigation);
    if (typeof title !== 'string') {
      // Hook didn't return a title, so run title logic
      const componentTitles = Title.stringifyTitles(title, navigation);

      title = RouterConfiguration.options.title.appTitle;
      title = title.replace(/\${componentTitles}/g, componentTitles);
      title = title.replace(/\${appTitleSeparator}/g,
        componentTitles !== ''
          ? RouterConfiguration.options.title.appTitleSeparator
          : '');
    }
    // Invoke again with complete string
    title = await RoutingHook.invokeTransformTitle(title, navigation);

    return title as string;
  }

  private static stringifyTitles(instructions: RoutingInstruction[], navigation: Navigation): string {
    const titles = instructions
      .map(instruction => Title.stringifyTitle(instruction, navigation))
      .filter(instruction => (instruction?.length ?? 0) > 0);

    return titles.join(' + ');
  }

  private static stringifyTitle(instruction: RoutingInstruction, navigation: Navigation): string {
    const nextInstructions: RoutingInstruction[] | null = instruction.nextScopeInstructions;
    let stringified = Title.resolveTitle(instruction, navigation);
    if (Array.isArray(nextInstructions) && nextInstructions.length > 0) {
      let nextStringified: string = Title.stringifyTitles(nextInstructions, navigation);
      if (nextStringified.length > 0) {
        if (nextInstructions.length !== 1) { // TODO: This should really also check that the instructions have value
          nextStringified = "[ " + nextStringified + " ]";
        }
        if (stringified.length > 0) {
          stringified = RouterConfiguration.options.title.componentTitleOrder === 'top-down'
            ? stringified + RouterConfiguration.options.title.componentTitleSeparator + nextStringified
            : nextStringified + RouterConfiguration.options.title.componentTitleSeparator + stringified;
        } else {
          stringified = nextStringified;
        }
      }
    }
    return stringified;
  }

  private static resolveTitle(instruction: RoutingInstruction, navigation: Navigation): string {
    let title = instruction.getTitle(navigation);
    if (RouterConfiguration.options.title.transformTitle != null) {
      title = RouterConfiguration.options.title.transformTitle!(title, instruction, navigation);
    }
    return title;
  }
}

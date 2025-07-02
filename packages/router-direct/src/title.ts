import { TitleOptions } from './router-options';
import { RoutingInstruction } from './instructions/routing-instruction';
import { Navigation } from './navigation';
import { RoutingHook } from './routing-hook';

export class Title {
  public static async getTitle(instructions: RoutingInstruction[], navigation: Navigation, titleOptions: TitleOptions): Promise<string | null> {
    // First invoke with viewport instructions
    let title: string | RoutingInstruction[] = await RoutingHook.invokeTransformTitle(instructions, navigation);
    if (typeof title !== 'string') {
      // Hook didn't return a title, so run title logic
      const componentTitles = Title.stringifyTitles(title, navigation, titleOptions);

      title = titleOptions.appTitle;
      title = title.replace(/\${componentTitles}/g, componentTitles);
      title = title.replace(/\${appTitleSeparator}/g,
        componentTitles !== '' ? titleOptions.appTitleSeparator : '');
    }
    // Invoke again with complete string
    title = await RoutingHook.invokeTransformTitle(title, navigation);

    return title as string;
  }

  private static stringifyTitles(instructions: RoutingInstruction[], navigation: Navigation, titleOptions: TitleOptions): string {
    const titles = instructions
      .map(instruction => Title.stringifyTitle(instruction, navigation, titleOptions))
      .filter(instruction => (instruction?.length ?? 0) > 0);

    return titles.join(' + ');
  }

  private static stringifyTitle(instruction: RoutingInstruction, navigation: Navigation, titleOptions: TitleOptions): string {
    const nextInstructions: RoutingInstruction[] | null = instruction.nextScopeInstructions;
    let stringified = Title.resolveTitle(instruction, navigation, titleOptions);
    if (Array.isArray(nextInstructions) && nextInstructions.length > 0) {
      let nextStringified: string = Title.stringifyTitles(nextInstructions, navigation, titleOptions);
      if (nextStringified.length > 0) {
        if (nextInstructions.length !== 1) { // TODO: This should really also check that the instructions have value
          nextStringified = `[ ${nextStringified} ]`;
        }
        if (stringified.length > 0) {
          stringified = titleOptions.componentTitleOrder === 'top-down'
            ? stringified + titleOptions.componentTitleSeparator + nextStringified
            : nextStringified + titleOptions.componentTitleSeparator + stringified;
        } else {
          stringified = nextStringified;
        }
      }
    }
    return stringified;
  }

  private static resolveTitle(instruction: RoutingInstruction, navigation: Navigation, titleOptions: TitleOptions): string {
    let title = instruction.getTitle(navigation);
    if (titleOptions.transformTitle != null) {
      title = titleOptions.transformTitle(title, instruction, navigation);
    }
    return title;
  }
}

import { InstructionParser } from './instruction-parser';
import { RouterOptions } from './../router-options.js';
import { InstructionViewportScope } from './instruction-viewport-scope';
import { InstructionParameters } from './instruction-parameters.js';
import { InstructionViewport } from './instruction-viewport.js';
import { InstructionComponent } from './instruction-component.js';
import { ComponentAppellation, ComponentParameters, ViewportHandle } from '../interfaces.js';
import { RoutingScope } from '../routing-scope.js';
import { ViewportScope } from '../viewport-scope.js';
import { FoundRoute } from '../found-route.js';
import { IEndpoint } from '../endpoints/endpoint';

/**
 * The routing instructions are the core of the router's navigations. All
 * navigation instructions to the router are translated to a set of
 * routing instructions. The routing instructions are resolved "non-early"
 * to support dynamic, local resolutions.
 *
 * Routing instructions are used to represent the full navigation state
 * and is serialized when storing and restoring the navigation state. (But
 * not full component state with component instance state. ViewportContent
 * is used for that.)
 */
export class RoutingInstruction {
  /**
   * The component part of the routing instruction.
   */
  public component: InstructionComponent;
  /**
   * The viewport part of the routing instruction.
   */
  public viewport: InstructionViewport;
  /**
   * The parameters part of the routing instruction.
   */
  public parameters: InstructionParameters;

  /**
   * Whether the routing instruction owns its scope.
   */
  public ownsScope: boolean = true;
  /**
   * The routing instructions in the next scope ("children").
   */
  public nextScopeInstructions: RoutingInstruction[] | null = null;

  /**
   * The scope the the routing instruction belongs to.
   */
  public scope: RoutingScope | null = null;
  /**
   * The context of the routing instruction.
   */
  public context: string = '';
  /**
   * The viewport scope part of the routing instruction.
   */
  public viewportScope: ViewportScope | null = null; // TODO: Add InstructionViewportScope
  /**
   * Whether the routing instruction can be resolved within the scope without having
   * viewport specified. Used when creating string instructions/links/url.
   */
  public needsViewportDescribed: boolean = false;
  /**
   * The configured route, if any, that the routing instruction is part of.
   */
  public route: FoundRoute | string | null = null;

  /**
   * Whether the routing instruction is the result of a viewport default (meaning it has
   * lower priority when processing instructions).
   */
  public default: boolean = false;

  /**
   * Whether the routing instruction is the top instruction in its routing instruction
   * hierarchy.
   */
  public topInstruction: boolean = false;

  public constructor(
    component?: ComponentAppellation,
    viewport?: ViewportHandle,
    parameters?: ComponentParameters,
  ) {
    this.component = InstructionComponent.create(component);
    this.viewport = InstructionViewport.create(viewport);
    this.parameters = InstructionParameters.create(parameters);

    // TODO: Implement viewport scope as instruction
    // Viewport scopes are only added to instructions internally so
    // it's excluded from ordinary creation.
    // this.viewportScope = InstructionViewportScope.create();
  }

  public static separators = RouterOptions.separators;

  /**
   * Create a new routing instruction.
   *
   * @param component - The component (appelation) part of the instruction. Can be a promise
   * @param viewport - The viewport (handle) part of the instruction
   * @param parameters - The parameters part of the instruction
   * @param ownScope - Whether the routing instruction owns its scope
   * @param nextScopeInstructions - The routing instructions in the next scope ("children")
   */
  public static create(component?: ComponentAppellation | Promise<ComponentAppellation>, viewport?: ViewportHandle, parameters?: ComponentParameters, ownsScope: boolean = true, nextScopeInstructions: RoutingInstruction[] | null = null): RoutingInstruction | Promise<RoutingInstruction> {
    if (component instanceof Promise) {
      return component.then((resolvedComponent) => {
        return RoutingInstruction.create(resolvedComponent, viewport, parameters, ownsScope, nextScopeInstructions);
      });
    }

    const instruction: RoutingInstruction = new RoutingInstruction(component, viewport, parameters);
    instruction.ownsScope = ownsScope;
    instruction.nextScopeInstructions = nextScopeInstructions;

    return instruction;
  }

  public static clear(): string {
    return RoutingInstruction.separators.clear;
  }
  public static add(): string {
    return RoutingInstruction.separators.add;
  }

  public static parse(instructions: string): RoutingInstruction[] {
    let context = '';
    // Context is a start with .. or / and any combination thereof
    const match = /^[./]+/.exec(instructions);
    // If it starts with a context...
    if (Array.isArray(match) && match.length > 0) {
      // ...save and...
      context = match[0];
      // ...extract it.
      instructions = instructions.slice(context.length);
    }
    // Parse the instructions...
    const parsedInstructions: RoutingInstruction[] = InstructionParser.parse(instructions, true).instructions;
    for (const instruction of parsedInstructions) {
      // ...and set the context on each of them.
      instruction.context = context;
    }
    return parsedInstructions;
  }

  /**
   * Stringify a list of routing instructions, recursively down next scope/child instructions.
   *
   * @param instructions - The instructions to stringify
   * @param excludeViewport - Whether to exclude viewport names in the string
   * @param viewportContext - Whether to include viewport context in the string
   */
  public static stringify(instructions: RoutingInstruction[] | string, excludeViewport: boolean = false, viewportContext: boolean = false): string {
    return typeof (instructions) === 'string'
      ? instructions
      : instructions
        .map(instruction => instruction.stringify(excludeViewport, viewportContext))
        .filter(instruction => instruction.length > 0)
        .join(this.separators.sibling);
  }

  /**
   * Whether the instructions, on any level, contains siblings
   *
   * @param instructions - The instructions to check
   */
  public static containsSiblings(instructions: RoutingInstruction[] | null): boolean {
    if (instructions === null) {
      return false;
    }
    if (instructions.length > 1) {
      return true;
    }
    return instructions.some(instruction => RoutingInstruction.containsSiblings(instruction.nextScopeInstructions));
  }

  /**
   * Get all routing instructions, recursively down next scope/child instructions, as
   * a "flat" list.
   *
   * @param instructions - The instructions to flatten
   */
  public static flat(instructions: RoutingInstruction[]): RoutingInstruction[] {
    const flat: RoutingInstruction[] = [];
    for (const instruction of instructions) {
      flat.push(instruction);
      if (instruction.hasNextScopeInstructions) {
        flat.push(...RoutingInstruction.flat(instruction.nextScopeInstructions!));
      }
    }
    return flat;
  }

  /**
   * Clone a list of routing instructions.
   *
   * @param instructions - The instructions to clone
   * @param keepInstances - Whether actual instances should be transfered
   * @param context - Whether the context should be transfered
   */
  public static clone(instructions: RoutingInstruction[], keepInstances: boolean = false, context: boolean = false): RoutingInstruction[] {
    return instructions.map(instruction => instruction.clone(keepInstances, context));
  }

  /**
   * Whether a list of routing instructions contains another list of routing
   * instructions. If deep, all next scope instructions needs to be contained
   * in containing next scope instructions as well.
   *
   * @param instructionsToSearch - Instructions that should contain (superset)
   * @param instructionsToFind - Instructions that should be contained (subset)
   * @param deep - Whether next scope instructions also need to be contained (recurively)
   */
  public static contains(instructionsToSearch: RoutingInstruction[], instructionsToFind: RoutingInstruction[], deep: boolean): boolean {
    // All instructions to find need to exist in instructions to search
    return instructionsToFind.every(find => find.isIn(instructionsToSearch, deep));
    // // // If there's nothing to find, it's a success
    // if (instructionsToFind.length === 0) {
    //   return true;
    // }
    // for (const find of instructionsToFind) {
    //   // If at least one of the instructions to search in matches _recursively_
    //   // it's a succesfull match.
    //   if (find.isIn(instructionsToSearch, deep)) {
    //     return true;
    //   }
    // }
    // // Otherwise it's a failure to match.
    // return false;
  }

  /**
   * The endpoint of the routing instruction.
   */
  public get endpoint(): IEndpoint | null {
    return this.viewport?.instance ?? this.viewportScope ?? null;
  }

  public get isAdd(): boolean {
    return this.component.name === RouterOptions.separators.add;
  }
  public get isClear(): boolean {
    return this.component.name === RoutingInstruction.separators.clear;
  }
  public get isAddAll(): boolean {
    return this.isAdd && ((this.viewport.name?.length ?? 0) === 0);
  }
  public get isClearAll(): boolean {
    return this.isClear && ((this.viewport.name?.length ?? 0) === 0);
  }

  public get hasNextScopeInstructions(): boolean {
    return (this.nextScopeInstructions?.length ?? 0) > 0;
  }

  /**
   * Compare the routing instruction's component with the component of another routing
   * instruction. Compares on name unless `compareType` is `true`.
   *
   * @param other - The routing instruction to compare to
   * @param compareParameters - Whether parameters should also be compared
   * @param compareType - Whether comparision should be made on type only (and not name)
   */
  public sameComponent(other: RoutingInstruction, compareParameters: boolean = false, compareType: boolean = false): boolean {
    if (compareParameters && !this.sameParameters(other, compareType)) {
      return false;
    }
    return this.component.same(other.component, compareType);
  }

  /**
   * Compare the routing instruction's viewport with the viewport of another routing
   * instruction. Compares on viewport instance if possible, otherwise name.
   *
   * @param other - The routing instruction to compare to
   */
  public sameViewport(other: RoutingInstruction): boolean {
    return this.viewport.same(other.viewport);
  }

  /**
   * Compare the routing instruction's parameters with the parameters of another routing
   * instruction. Compares on actual values.
   *
   * @param other - The routing instruction to compare to
   * @param compareType - Whether comparision should be made on type as well
   */
  public sameParameters(other: RoutingInstruction, compareType: boolean = false): boolean {
    // TODO: Somewhere we need to check for format such as spaces etc
    if (!this.component.same(other.component, compareType)) {
      return false;
    }
    return this.parameters.same(other.parameters, this.component.type);
  }

  /**
   * Stringify the routing instruction, recursively down next scope/child instructions.
   *
   * @param excludeViewport - Whether to exclude viewport names in the string
   * @param viewportContext - Whether to include viewport context in the string
   */
  public stringify(excludeViewport: boolean = false, viewportContext: boolean = false): string {
    let excludeCurrentViewport = excludeViewport;
    let excludeCurrentComponent = false;

    // If viewport context is specified...
    if (viewportContext) {
      // ()...it's still skipped if no link option is set on viewport)
      if (this.viewport.instance?.options.noLink ?? false) {
        return '';
      }
      // ...viewport can still be excluded if it's not necessary...
      if (!this.needsViewportDescribed &&
        (!(this.viewport.instance?.options.forceDescription ?? false) // ...and not forced...
          || (this.viewportScope !== null)) // ...or it has a viewport scope
      ) {
        excludeCurrentViewport = true;
      }
      // ...or if it's the fallback component...
      if (this.viewport.instance?.options.fallback === this.component.name) {
        excludeCurrentComponent = true;
      }
    }
    let route = this.route ?? null;
    const nextInstructions: RoutingInstruction[] | null = this.nextScopeInstructions;
    // Start with the context (if any)
    let stringified: string = this.context;
    // It's a configured route...
    if (route !== null) {
      // ...that's already added as part of a configuration, so skip to next scope!
      if (route === '') {
        return Array.isArray(nextInstructions)
          ? RoutingInstruction.stringify(nextInstructions, excludeViewport, viewportContext)
          : '';
      }
      // ...that's the first instruction of a route...
      route = (route as FoundRoute).matching;
      // ...so add the route.
      stringified += route.endsWith(RoutingInstruction.separators.scope)
        ? route.slice(0, -RoutingInstruction.separators.scope.length)
        : route;
    } else { // Not (part of) a route so add it
      stringified += this.stringifyShallow(excludeCurrentViewport, excludeCurrentComponent);
    }
    // If any next scope/child instructions...
    if (Array.isArray(nextInstructions) && nextInstructions.length > 0) {
      // ...get them as string...
      const nextStringified = RoutingInstruction.stringify(nextInstructions, excludeViewport, viewportContext);
      if (nextStringified.length > 0) {
        // ...and add with scope separator and...
        stringified += RoutingInstruction.separators.scope;
        // ...check if scope grouping separators are needed:
        stringified += nextInstructions.length === 1 // TODO: This should really also check that the instructions have value
          // only one child, add as-is
          ? nextStringified
          // more than one child, add within scope (between () )
          : `${RoutingInstruction.separators.scopeStart}${nextStringified}${RoutingInstruction.separators.scopeEnd}`;
      }
    }
    return stringified;
  }

  /**
   * Stringify the routing instruction shallowly, NOT recursively down next scope/child instructions.
   *
   * @param excludeViewport - Whether to exclude viewport names in the string
   * @param viewportContext - Whether to include viewport context in the string
   */
  private stringifyShallow(excludeViewport: boolean = false, excludeComponent: boolean = false): string {
    // Start with component (unless excluded)
    let instructionString = !excludeComponent ? this.component.name ?? '' : '';

    // Get parameters specification (names, sort order) from component type
    // TODO(alpha): Use Metadata!
    const specification = this.component.type ? this.component.type.parameters : null;
    // Get parameters according to specification
    const parameters = InstructionParameters.stringify(this.parameters.toSortedParameters(specification));
    if (parameters.length > 0) {
      // Add to component or use standalone
      instructionString += !excludeComponent
        ? `${RoutingInstruction.separators.parameters}${parameters}${RoutingInstruction.separators.parametersEnd}`
        : parameters;
    }
    // Add viewport name (unless excluded)
    if (this.viewport.name !== null && !excludeViewport) {
      instructionString += `${RoutingInstruction.separators.viewport}${this.viewport.name}`;
    }
    // And add no (owned) scope indicator
    if (!this.ownsScope) {
      instructionString += RoutingInstruction.separators.noScope;
    }
    return instructionString || '';
  }

  /**
   * Clone the routing instruction.
   *
   * @param keepInstances - Whether actual instances should be transfered
   * @param context - Whether the context should be transfered
   */
  public clone(keepInstances: boolean = false, context: boolean = false): RoutingInstruction {
    // Create a clone without instances...
    const clone = RoutingInstruction.create(
      this.component.type ?? this.component.name!,
      this.viewport.name!,
      this.parameters.typedParameters !== null ? this.parameters.typedParameters : void 0,
    ) as RoutingInstruction;
    // ...and then set them if they should be transfered.
    if (keepInstances) {
      clone.component.set(this.component.instance ?? this.component.type ?? this.component.name!);
      clone.viewport.set(this.viewport.instance ?? this.viewport.name!);
    }
    clone.needsViewportDescribed = this.needsViewportDescribed;
    clone.route = this.route;
    // Only transfer context if specified
    if (context) {
      clone.context = this.context;
    }
    clone.viewportScope = keepInstances ? this.viewportScope : null;
    clone.scope = keepInstances ? this.scope : null;
    // Clone all next scope/child instructions
    if (this.hasNextScopeInstructions) {
      clone.nextScopeInstructions = RoutingInstruction.clone(this.nextScopeInstructions!, keepInstances, context);
    }
    return clone;
  }

  public isIn(searchIn: RoutingInstruction[], deep: boolean): boolean {
    // Get all instructions with matching component.
    const matching = searchIn.filter(instruction => instruction.sameComponent(this));
    // If no one matches, it's a failure.
    if (matching.length === 0) {
      return false;
    }

    // If no deep match or no next scope instructions...
    if (!deep || !this.hasNextScopeInstructions) {
      // ...it's a successful match.
      return true;
    }

    // Match the next scope instructions to the next scope instructions of each
    // of the matching instructions and if at least one match (recursively)...
    if (matching.some(matched => RoutingInstruction.contains(
      matched.nextScopeInstructions ?? [],
      this.nextScopeInstructions!,
      deep))
    ) {
      // ...it's a success...
      return true;
    }
    // ...otherwise it's a failure to match.
    return false;
  }
}

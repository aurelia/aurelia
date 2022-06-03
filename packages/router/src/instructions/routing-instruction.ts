import { InstructionParser } from './instruction-parser';
import { InstructionParameters, Parameters } from './instruction-parameters';
import { InstructionComponent } from './instruction-component';
import { ComponentAppellation, ComponentParameters, LoadInstruction } from '../interfaces';
import { RoutingScope } from '../routing-scope';
import { ViewportScope } from '../endpoints/viewport-scope';
import { FoundRoute } from '../found-route';
import { Endpoint, EndpointType } from '../endpoints/endpoint';
import { Viewport } from '../endpoints/viewport';
import { CustomElement } from '@aurelia/runtime-html';
import { IRouter, IRouterConfiguration, Navigation } from '../index';
import { EndpointHandle, InstructionEndpoint } from './instruction-endpoint';
import { Separators } from '../router-options';
import { IContainer } from '@aurelia/kernel';

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
   * The endpoint part of the routing instruction.
   */
  public endpoint: InstructionEndpoint;

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
   * The scope modifier of the routing instruction.
   */
  public scopeModifier: string = '';

  /**
   * Whether the routing instruction can be resolved within the scope without having
   * endpoint specified. Used when creating string instructions/links/url.
   */
  public needsEndpointDescribed: boolean = false;

  /**
   * The configured route, if any, that the routing instruction is part of.
   */
  public route: FoundRoute | null = null;

  /**
   * The instruction is the start/first instruction of a configured route.
   */
  public routeStart: boolean = false;

  /**
   * Whether the routing instruction is the result of a (viewport) default (meaning it
   * has lower priority when processing instructions).
   */
  public default: boolean = false;

  /**
   * Whether the routing instruction is the top instruction in its routing instruction
   * hierarchy. Used when syncing swap of all (top) instructions.
   */
  public topInstruction: boolean = false;

  public constructor(
    component?: ComponentAppellation | Promise<ComponentAppellation>,
    endpoint?: EndpointHandle,
    parameters?: ComponentParameters,
  ) {
    this.component = InstructionComponent.create(component);
    this.endpoint = InstructionEndpoint.create(endpoint);
    this.parameters = InstructionParameters.create(parameters);
  }

  /**
   * Create a new routing instruction.
   *
   * @param component - The component (appelation) part of the instruction. Can be a promise
   * @param endpoint - The endpoint (handle) part of the instruction
   * @param parameters - The parameters part of the instruction
   * @param ownScope - Whether the routing instruction owns its scope
   * @param nextScopeInstructions - The routing instructions in the next scope ("children")
   */
  public static create(component?: ComponentAppellation | Promise<ComponentAppellation>, endpoint?: EndpointHandle, parameters?: ComponentParameters, ownsScope: boolean = true, nextScopeInstructions: RoutingInstruction[] | null = null): RoutingInstruction | Promise<RoutingInstruction> {
    const instruction: RoutingInstruction = new RoutingInstruction(component, endpoint, parameters);
    instruction.ownsScope = ownsScope;
    instruction.nextScopeInstructions = nextScopeInstructions;

    return instruction;
  }

  /**
   * Create a clear endpoint routing instruction.
   *
   * @param endpoint - The endpoint to create the clear instruction for
   */
  public static createClear(context: IRouterConfiguration | IRouter, endpoint: EndpointType | Endpoint): RoutingInstruction {
    return RoutingInstruction.create(RoutingInstruction.clear(context), endpoint) as RoutingInstruction;
  }

  /**
   * Get routing instructions based on load instructions.
   *
   * @param context - The context (used for syntax) within to parse the instructions
   * @param loadInstructions - The load instructions to get the routing
   * instructions from.
   */
  public static from(context: IRouterConfiguration | IRouter | IContainer, loadInstructions: LoadInstruction | LoadInstruction[]): RoutingInstruction[] {
    if (!Array.isArray(loadInstructions)) {
      loadInstructions = [loadInstructions];
    }
    const instructions: RoutingInstruction[] = [];
    for (const instruction of loadInstructions as LoadInstruction[]) {
      if (typeof instruction === 'string') {
        instructions.push(...RoutingInstruction.parse(context, instruction));
      } else if (instruction instanceof RoutingInstruction) {
        instructions.push(instruction);
      } else if (instruction instanceof Promise) {
        instructions.push(RoutingInstruction.create(instruction) as RoutingInstruction);
      } else if (InstructionComponent.isAppelation(instruction)) {
        instructions.push(RoutingInstruction.create(instruction) as RoutingInstruction);
      } else if (InstructionComponent.isDefinition(instruction)) {
        instructions.push(RoutingInstruction.create(instruction.Type) as RoutingInstruction);
      } else if ('component' in instruction) {
        const viewportComponent = instruction;
        const newInstruction = RoutingInstruction.create(viewportComponent.component, viewportComponent.viewport, viewportComponent.parameters) as RoutingInstruction;
        if (viewportComponent.children !== void 0 && viewportComponent.children !== null) {
          newInstruction.nextScopeInstructions = RoutingInstruction.from(context, viewportComponent.children);
        }
        instructions.push(newInstruction);
      } else if (typeof instruction === 'object' && instruction !== null) {
        const type = CustomElement.define(instruction);
        instructions.push(RoutingInstruction.create(type) as RoutingInstruction);
      } else {
        instructions.push(RoutingInstruction.create(instruction as ComponentAppellation) as RoutingInstruction);
      }
    }
    return instructions;
  }

  /**
   * The routing instruction component that represents "clear".
   */
  public static clear(context: IRouterConfiguration | IRouter): string {
    return Separators.for(context).clear;
  }

  /**
   * The routing instruction component that represents "add".
   */
  public static add(context: IRouterConfiguration | IRouter): string {
    return Separators.for(context).add;
  }

  /**
   * Parse an instruction string into a list of routing instructions.
   *
   * @param context - The context (used for syntax) within to parse the instructions
   * @param instructions - The instruction string to parse
   */
  public static parse(context: IRouterConfiguration | IRouter | IContainer, instructions: string): RoutingInstruction[] {
    const seps = Separators.for(context);
    let scopeModifier = '';
    // Scope modifier is a start with .. or / and any combination thereof
    const match = /^[./]+/.exec(instructions);
    // If it starts with a scope modifier...
    if (Array.isArray(match) && match.length > 0) {
      // ...save and...
      scopeModifier = match[0];
      // ...extract it.
      instructions = instructions.slice(scopeModifier.length);
    }
    // Parse the instructions...
    const parsedInstructions: RoutingInstruction[] = InstructionParser.parse(seps, instructions, true, true).instructions;
    for (const instruction of parsedInstructions) {
      // ...and set the scope modifier on each of them.
      instruction.scopeModifier = scopeModifier;
    }
    return parsedInstructions;
  }

  /**
   * Stringify a list of routing instructions, recursively down next scope/child instructions.
   *
   * @param context - The context (used for syntax) within to stringify the instructions
   * @param instructions - The instructions to stringify
   * @param excludeEndpoint - Whether to exclude endpoint names in the string
   * @param endpointContext - Whether to include endpoint context in the string
   */
  public static stringify(context: IRouterConfiguration | IRouter | IContainer, instructions: RoutingInstruction[] | string, excludeEndpoint: boolean = false, endpointContext: boolean = false): string {
    return typeof (instructions) === 'string'
      ? instructions
      : instructions
        .map(instruction => instruction.stringify(context, excludeEndpoint, endpointContext))
        .filter(instruction => instruction.length > 0)
        .join(Separators.for(context).sibling);
  }

  /**
   * Whether the instructions, on any level, contains siblings
   *
   * @param instructions - The instructions to check
   */
  public static containsSiblings(context: IRouterConfiguration | IRouter, instructions: RoutingInstruction[] | null): boolean {
    if (instructions === null) {
      return false;
    }
    if (instructions
      .filter(instruction => !instruction.isClear(context) && !instruction.isClearAll(context))
      .length > 1) {
      return true;
    }
    return instructions.some(instruction => RoutingInstruction.containsSiblings(context, instruction.nextScopeInstructions));
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
   * @param scopeModifier - Whether the scope modifier should be transfered
   */
  public static clone(instructions: RoutingInstruction[], keepInstances: boolean = false, scopeModifier: boolean = false): RoutingInstruction[] {
    return instructions.map(instruction => instruction.clone(keepInstances, scopeModifier));
  }

  /**
   * Whether a list of routing instructions contains another list of routing
   * instructions. If deep, all next scope instructions needs to be contained
   * in containing next scope instructions as well.
   *
   * @param context - The context (used for parameter syntax) to compare within
   * @param instructionsToSearch - Instructions that should contain (superset)
   * @param instructionsToFind - Instructions that should be contained (subset)
   * @param deep - Whether next scope instructions also need to be contained (recursively)
   */
  public static contains(context: IRouterConfiguration | IRouter | IContainer, instructionsToSearch: RoutingInstruction[], instructionsToFind: RoutingInstruction[], deep: boolean): boolean {
    // All instructions to find need to exist in instructions to search
    return instructionsToFind.every(find => find.isIn(context, instructionsToSearch, deep));
  }

  /**
   * The endpoint of the routing instruction if it's a viewport OR if
   * it can't be decided (no instance, just a name).
   */
  public get viewport(): InstructionEndpoint | null {
    return this.endpoint.instance instanceof Viewport ||
      this.endpoint.endpointType === null
      ? this.endpoint
      : null;
  }

  /**
   * The endpoint of the routing instruction if it's a viewport scope OR if
   * it can't be decided (no instance, just a name).
   */
  public get viewportScope(): InstructionEndpoint | null {
    return this.endpoint.instance instanceof ViewportScope ||
      this.endpoint.endpointType === null
      ? this.endpoint
      : null;
  }

  /**
   * The previous instruction for the specific endpoint. This can only evaluate
   * to a value when the instruction has an assigned endpoint. This is a
   * convenience property in the API.
   */
   public get previous(): RoutingInstruction | null | undefined {
    return this.endpoint.instance?.getContent()?.instruction;
  }

  /**
   * Whether the routing instruction is an "add" instruction.
   */
  public isAdd(context: IRouterConfiguration | IRouter): boolean {
    return this.component.name === Separators.for(context).add;
  }
  /**
   * Whether the routing instruction is a "clear" instruction.
   */
  public isClear(context: IRouterConfiguration | IRouter): boolean {
    return this.component.name === Separators.for(context).clear;
  }
  /**
   * Whether the routing instruction is an "add all" instruction.
   */
  public isAddAll(context: IRouterConfiguration | IRouter): boolean {
    return this.isAdd(context) && ((this.endpoint.name?.length ?? 0) === 0);
  }
  /**
   * Whether the routing instruction is an "clear all" instruction.
   */
  public isClearAll(context: IRouterConfiguration | IRouter): boolean {
    return this.isClear(context) && ((this.endpoint.name?.length ?? 0) === 0);
  }

  /**
   * Whether the routing instruction next scope/"children" instructions.
   */
  public get hasNextScopeInstructions(): boolean {
    return (this.nextScopeInstructions?.length ?? 0) > 0;
  }

  /**
   * Get the instruction parameters with type specification applied.
   */
  public typeParameters(context: IRouterConfiguration | IRouter | IContainer): Parameters {
    return this.parameters.toSpecifiedParameters(context, this.component.type?.parameters ?? []);
  }

  /**
   * Compare the routing instruction's component with the component of another routing
   * instruction. Compares on name unless `compareType` is `true`.
   *
   * @param context - The context (used for parameter syntax) to compare within
   * @param other - The routing instruction to compare to
   * @param compareParameters - Whether parameters should also be compared
   * @param compareType - Whether comparision should be made on type only (and not name)
   */
  public sameComponent(context: IRouterConfiguration | IRouter | IContainer, other: RoutingInstruction, compareParameters: boolean = false, compareType: boolean = false): boolean {
    if (compareParameters && !this.sameParameters(context, other, compareType)) {
      return false;
    }
    return this.component.same(other.component, compareType);
  }

  /**
   * Compare the routing instruction's endpoint with the endpoint of another routing
   * instruction. Compares on endpoint instance if possible, otherwise name.
   *
   * @param other - The routing instruction to compare to
   * @param compareScope - Whether comparision should be made on scope as well (and not
   * only instance/name)
   */
  public sameEndpoint(other: RoutingInstruction, compareScope: boolean): boolean {
    return this.endpoint.same(other.endpoint, compareScope);
  }

  /**
   * Compare the routing instruction's parameters with the parameters of another routing
   * instruction. Compares on actual values.
   *
   * @param other - The routing instruction to compare to
   * @param compareType - Whether comparision should be made on type as well
   */
  public sameParameters(context: IRouterConfiguration | IRouter | IContainer, other: RoutingInstruction, compareType: boolean = false): boolean {
    // TODO: Somewhere we need to check for format such as spaces etc
    if (!this.component.same(other.component, compareType)) {
      return false;
    }
    return this.parameters.same(context, other.parameters, this.component.type);
  }

  /**
   * Stringify the routing instruction, recursively down next scope/child instructions.
   *
   * @param context - The context (used for syntax) within to stringify the instructions
   * @param excludeEndpoint - Whether to exclude endpoint names in the string
   * @param endpointContext - Whether to include endpoint context in the string
   */
  public stringify(context: IRouterConfiguration | IRouter | IContainer, excludeEndpoint: boolean = false, endpointContext: boolean = false): string {
    const seps = Separators.for(context);
    let excludeCurrentEndpoint = excludeEndpoint;
    let excludeCurrentComponent = false;

    // If viewport context is specified...
    if (endpointContext) {
      const viewport = this.viewport?.instance as Viewport ?? null;
      // (...it's still skipped if no link option is set on viewport)
      if (viewport?.options.noLink ?? false) {
        return '';
      }
      // ...viewport can still be excluded if it's not necessary...
      if (!this.needsEndpointDescribed &&
        (!(viewport?.options.forceDescription ?? false) // ...and not forced...
          || (this.viewportScope?.instance != null)) // ...or it has a viewport scope
      ) {
        excludeCurrentEndpoint = true;
      }
      // ...or if it's the fallback component...
      if (viewport?.options.fallback === this.component.name) {
        excludeCurrentComponent = true;
      }
      // ...or the default component /* without next scope instructions/children */.
      if (viewport?.options.default === this.component.name /* && !this.hasNextScopeInstructions */) {
        excludeCurrentComponent = true;
      }
    }
    const nextInstructions: RoutingInstruction[] | null = this.nextScopeInstructions;
    // Start with the scope modifier (if any)
    let stringified: string = this.scopeModifier;
    // It's a configured route...
    if (this.route !== null) {
      // ...that's already added as part of a configuration, so skip to next scope!
      if (!this.routeStart) {
        return Array.isArray(nextInstructions)
          ? RoutingInstruction.stringify(context, nextInstructions, excludeEndpoint, endpointContext)
          : '';
      }
      // ...that's the first instruction of a route...
      const path = this.route.matching;
      // ...so add the route.
      stringified += path.endsWith(seps.scope)
        ? path.slice(0, -seps.scope.length)
        : path;
    } else { // Not (part of) a route so add it
      stringified += this.stringifyShallow(context, excludeCurrentEndpoint, excludeCurrentComponent);
    }
    // If any next scope/child instructions...
    if (Array.isArray(nextInstructions) && nextInstructions.length > 0) {
      // ...get them as string...
      const nextStringified = RoutingInstruction.stringify(context, nextInstructions, excludeEndpoint, endpointContext);
      if (nextStringified.length > 0) {
        // ...and add with scope separator and...
        stringified += seps.scope;
        // ...check if scope grouping separators are needed:
        stringified += nextInstructions.length === 1 // TODO: This should really also check that the instructions have value
          // only one child, add as-is
          ? nextStringified
          // more than one child, add within scope (between () )
          : `${seps.groupStart}${nextStringified}${seps.groupEnd}`;
      }
    }
    return stringified;
  }

  /**
   * Clone the routing instruction.
   *
   * @param keepInstances - Whether actual instances should be transfered
   * @param scopeModifier - Whether the scope modifier should be transfered
   * @param shallow - Whether it should be a shallow clone only
   */
  public clone(keepInstances: boolean = false, scopeModifier: boolean = false, shallow: boolean = false): RoutingInstruction {
    // Create a clone without instances...
    const clone = RoutingInstruction.create(
      this.component.func ?? this.component.promise ?? this.component.type ?? this.component.name!,
      this.endpoint.name!,
      this.parameters.typedParameters !== null ? this.parameters.typedParameters : void 0,
    ) as RoutingInstruction;
    // ...and then set them if they should be transfered.
    if (keepInstances) {
      clone.component.set(this.component.instance ?? this.component.type ?? this.component.name!);
      clone.endpoint.set(this.endpoint.instance ?? this.endpoint.name!);
    }
    // And transfer the component name afterwards to make sure aliases are kept
    clone.component.name = this.component.name;

    clone.needsEndpointDescribed = this.needsEndpointDescribed;
    clone.route = this.route;
    clone.routeStart = this.routeStart;
    clone.default = this.default;

    // Only transfer scope modifier if specified
    if (scopeModifier) {
      clone.scopeModifier = this.scopeModifier;
    }
    clone.scope = keepInstances ? this.scope : null;
    // Clone all next scope/child instructions
    if (this.hasNextScopeInstructions && !shallow) {
      clone.nextScopeInstructions = RoutingInstruction.clone(this.nextScopeInstructions!, keepInstances, scopeModifier);
    }
    return clone;
  }

  /**
   * Whether the routing instruction is in a list of routing instructions. If
   * deep, all next scope instructions needs to be contained in containing
   * next scope instructions as well.
   *
   * @param context - The context (used for parameter syntax) to compare within
   * @param searchIn - Instructions that should contain (superset)
   * @param deep - Whether next scope instructions also need to be contained (recursively)
   */
  public isIn(context: IRouterConfiguration | IRouter | IContainer, searchIn: RoutingInstruction[], deep: boolean): boolean {
    // Get all instructions with matching component.
    const matching = searchIn.filter(instruction => {
      if (!instruction.sameComponent(context, this)) {
        return false;
      }
      // Use own type if we have it, the other's type if not
      const instructionType = instruction.component.type ?? this.component.type;
      const thisType = this.component.type ?? instruction.component.type;
      const instructionParameters = instruction.parameters.toSpecifiedParameters(context, instructionType?.parameters);
      const thisParameters = this.parameters.toSpecifiedParameters(context, thisType?.parameters);

      if (!InstructionParameters.contains(instructionParameters, thisParameters)) {
        return false;
      }
      return (this.endpoint.none || instruction.sameEndpoint(this, false));
    });
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
      context,
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

  /**
   * Get the title for the routing instruction.
   *
   * @param navigation - The navigation that requests the content change
   */
  public getTitle(navigation: Navigation): string {
    // If it's a configured route...
    if (this.route !== null) {
      // ...get the configured route title.
      const routeTitle = this.route.match?.title;
      // If there's a configured title, use it. Otherwise fallback to
      // titles based on endpoint's component.
      if (routeTitle != null) {
        // Only add the title (once) if it's the first instruction
        if (this.routeStart) {
          return typeof routeTitle === 'string' ? routeTitle : routeTitle(this, navigation);
        } else {
          return '';
        }
      }
    }
    return this.endpoint.instance!.getTitle(navigation);
  }

  public toJSON(): unknown {
    return {
      component: this.component.name ?? undefined,
      viewport: this.endpoint.name ?? undefined,
      parameters: this.parameters.parametersRecord ?? undefined,
      children: this.hasNextScopeInstructions
        ? this.nextScopeInstructions
        : undefined,
    };
  }
  /**
   * Stringify the routing instruction shallowly, NOT recursively down next scope/child instructions.
   *
   * @param context - The context (used for syntax) within to stringify the instructions
   * @param excludeEndpoint - Whether to exclude endpoint names in the string
   * @param excludeComponent - Whether to exclude component names in the string
   */
  private stringifyShallow(context: IRouterConfiguration | IRouter | IContainer, excludeEndpoint: boolean = false, excludeComponent: boolean = false): string {
    const seps = Separators.for(context);
    // Start with component (unless excluded)
    let instructionString = !excludeComponent ? this.component.name ?? '' : '';

    // Get parameters specification (names, sort order) from component type
    // TODO(alpha): Use Metadata!
    const specification = this.component.type ? this.component.type.parameters : null;
    // Get parameters according to specification
    const parameters = InstructionParameters.stringify(context, this.parameters.toSortedParameters(context, specification));
    if (parameters.length > 0) {
      // Add to component or use standalone
      instructionString += !excludeComponent
        ? `${seps.parameters}${parameters}${seps.parametersEnd}`
        : parameters;
    }
    // Add endpoint name (unless excluded)
    if (this.endpoint.name != null && !excludeEndpoint) {
      instructionString += `${seps.viewport}${this.endpoint.name}`;
    }
    // And add no (owned) scope indicator
    if (!this.ownsScope) {
      instructionString += seps.noScope;
    }
    return instructionString || '';
  }
}

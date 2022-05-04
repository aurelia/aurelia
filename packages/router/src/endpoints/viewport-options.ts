import { IEndpointOptions } from './endpoint';

export interface IViewportOptions extends Omit<Partial<ViewportOptions>, 'usedBy'> {
  usedBy?: string | string[];
}

export class ViewportOptions implements IEndpointOptions {
  /**
   * The default component that's loaded if the viewport is created
   * without having a component specified (in that navigation).
   * (Declared here because of name conflict.)
   */
  public default: string | undefined = undefined;

  public constructor(
    /**
     * Whether the viewport has its own scope (owns other endpoints)
     */
    public scope: boolean = true,

    /**
     * A list of components that is using the viewport. These components
     * can only be loaded into this viewport and this viewport can't
     * load any other components.
     */
    public usedBy: string[] = [],

    /**
     * The default component that's loaded if the viewport is created
     * without having a component specified (in that navigation).
     */
    _default: string = '',

    /**
     * The component loaded if the viewport can't load the specified
     * component. The component is passed as a parameter to the fallback.
     */
    public fallback: string = '',

    /**
     * The viewport doesn't add its content to the Location URL.
     */
    public noLink: boolean = false,

    /**
     * The viewport doesn't add a title to the browser window title.
     */
    public noTitle: boolean = false,

    /**
     * The viewport's content is stateful.
     */
    public stateful: boolean = false,

    /**
     * The viewport is always added to the routing instruction.
     */
    public forceDescription: boolean = false,

    /**
     * The transitions in the endpoint shouldn't be added to the navigation history
     */
    public noHistory: boolean = false,
  ) {
    this.default = _default;
  }

  public static create(options?: IViewportOptions): ViewportOptions {
    const created = new ViewportOptions();
    if (options !== void 0) {
      created.apply(options);
    }
    return created;
  }

  public apply(options: ViewportOptions | IViewportOptions): void {
    this.scope = options.scope ?? this.scope;
    this.usedBy = (typeof options.usedBy === 'string'
      ? options.usedBy.split(',').filter(str => str.length > 0)
      : options.usedBy
    )
      ?? this.usedBy;
    this.default = options.default ?? this.default;
    this.fallback = options.fallback ?? this.fallback;
    this.noLink = options.noLink ?? this.noLink;
    this.noTitle = options.noTitle ?? this.noTitle;
    this.stateful = options.stateful ?? this.stateful;
    this.forceDescription = options.forceDescription ?? this.forceDescription;
    this.noHistory = options.noHistory ?? this.noHistory;
  }
}

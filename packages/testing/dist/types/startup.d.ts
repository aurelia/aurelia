import { Constructable, IContainer, ILogger } from '@aurelia/kernel';
import { IObserverLocator } from '@aurelia/runtime';
import { Aurelia, IPlatform, type ICustomElementViewModel, IAppRootConfig, PartialCustomElementDefinition } from '@aurelia/runtime-html';
import { TestContext } from './test-context';
export declare const onFixtureCreated: <T extends object>(callback: (fixture: IFixture<T>) => unknown) => import("@aurelia/kernel").IDisposable;
export type ObjectType<T> = T extends Constructable<infer U extends object> ? U : T;
export declare function createFixture<T extends object>(template: string | Node, $class?: T | Constructable<T>, registrations?: unknown[], autoStart?: boolean, ctx?: TestContext, appConfig?: IFixtureConfig, rootElementDef?: Partial<PartialCustomElementDefinition>): IFixture<ICustomElementViewModel & ObjectType<T>>;
export declare namespace createFixture {
    var html: <T = Record<PropertyKey, any>>(html: string | TemplateStringsArray, ...values: TemplateValues<T>[]) => CreateBuilder<T, "component" | "deps" | "config">;
    var component: <T, K extends ObjectType<T>>(component: T) => {
        html: {
            (html: string): CreateBuilder<K, Exclude<"html" | "deps" | "config", "html">>;
            (html: TemplateStringsArray, ...values: TemplateValues<K>[]): CreateBuilder<K, Exclude<"html" | "deps" | "config", "html">>;
        };
        deps: (...args: unknown[]) => CreateBuilder<K, Exclude<"html" | "deps" | "config", "deps">>;
        config: (config: IFixtureConfig) => CreateBuilder<K, Exclude<"html" | "deps" | "config", "config">>;
    };
    var deps: <T = Record<PropertyKey, any>>(...deps: unknown[]) => {
        html: {
            (html: string): CreateBuilder<T, Exclude<"html" | "component" | "config", "html">>;
            (html: TemplateStringsArray, ...values: TemplateValues<T>[]): CreateBuilder<T, Exclude<"html" | "component" | "config", "html">>;
        };
        component: <K>(comp: K | Constructable<K>, def?: Partial<PartialCustomElementDefinition>) => CreateBuilder<K, Exclude<"html" | "component" | "config", "component">>;
        config: (config: IFixtureConfig) => CreateBuilder<T, Exclude<"html" | "component" | "config", "config">>;
    };
    var config: <T = Record<PropertyKey, any>>(config: IFixtureConfig) => {
        html: {
            (html: string): CreateBuilder<T, Exclude<"html" | "component" | "deps", "html">>;
            (html: TemplateStringsArray, ...values: TemplateValues<T>[]): CreateBuilder<T, Exclude<"html" | "component" | "deps", "html">>;
        };
        component: <K>(comp: K | Constructable<K>, def?: Partial<PartialCustomElementDefinition>) => CreateBuilder<K, Exclude<"html" | "component" | "deps", "component">>;
        deps: (...args: unknown[]) => CreateBuilder<T, Exclude<"html" | "component" | "deps", "deps">>;
    };
}
export interface ITextAssertOptions {
    /**
     * Describe the text in a way similar like how the browser renders whitespace
     * Multiple consecutive whitespaces are collapsed into one, and leading/trailing whitespaces are removed
     */
    compact?: boolean;
}
export interface IHtmlAssertOptions {
    /**
     * Describe the html in a way similar like how the browser renders whitespace
     * Multiple consecutive whitespaces are collapsed into one, and leading/trailing whitespaces are removed
     */
    compact?: boolean;
}
export interface IFixture<T> {
    readonly startPromise: void | Promise<void>;
    readonly ctx: TestContext;
    readonly container: IContainer;
    readonly platform: IPlatform;
    readonly testHost: HTMLElement;
    readonly appHost: HTMLElement;
    readonly au: Aurelia;
    readonly component: ICustomElementViewModel & T;
    readonly observerLocator: IObserverLocator;
    readonly logger: ILogger;
    readonly torn: boolean;
    start(): void | Promise<void>;
    /**
     * @deprecated use `stop(true)` instead
     */
    tearDown(): void | Promise<void>;
    stop(dispose?: boolean): void | Promise<void>;
    readonly started: Promise<IFixture<T>>;
    /**
     * Print to console and return the innerHTML of the current application
     */
    printHtml(): string;
    /**
     * Returns the first element that is a descendant of node that matches selectors, and throw if there is more than one, or none found
     */
    getBy<K extends keyof HTMLElementTagNameMap>(selectors: K): HTMLElementTagNameMap[K];
    getBy<K extends keyof SVGElementTagNameMap>(selectors: K): SVGElementTagNameMap[K];
    getBy<E extends HTMLElement = HTMLElement>(selectors: string): E | null;
    /**
     * Returns all element descendants of node that match selectors.
     */
    getAllBy<K extends keyof HTMLElementTagNameMap>(selectors: K): HTMLElementTagNameMap[K][];
    getAllBy<K extends keyof SVGElementTagNameMap>(selectors: K): SVGElementTagNameMap[K][];
    getAllBy<E extends HTMLElement = HTMLElement>(selectors: string): E[];
    /**
     * Returns the first element that is a descendant of node that matches selectors, and null if none found
     */
    queryBy<K extends keyof HTMLElementTagNameMap>(selectors: K): HTMLElementTagNameMap[K] | null;
    queryBy<K extends keyof SVGElementTagNameMap>(selectors: K): SVGElementTagNameMap[K] | null;
    queryBy<E extends HTMLElement = HTMLElement>(selectors: string): E | null;
    /**
     * Assert the text content of the current application host equals to a given string
     */
    assertText(text: string, options?: ITextAssertOptions): void;
    /**
     * Assert the text content of an element matching the given selector inside the application host equals to a given string.
     *
     * Will throw if there' more than one elements with matching selector
     */
    assertText(selector: string, text: string, options?: ITextAssertOptions): void;
    /**
     * Assert the text content of the current application host equals to a given string
     */
    assertTextContain(text: string): void;
    /**
     * Assert the text content of an element matching the given selector inside the application host equals to a given string.
     *
     * Will throw if there' more than one elements with matching selector
     */
    assertTextContain(selector: string, text: string): void;
    /**
     * Assert the inner html of the current application host equals to the given html string
     */
    assertHtml(html: string, options?: IHtmlAssertOptions): void;
    /**
     * Assert the inner html of an element matching the selector inside the current application host equals to the given html string.
     *
     * Will throw if there' more than one elements with matching selector
     */
    assertHtml(selector: string, html: string, options?: IHtmlAssertOptions): void;
    /**
     * Assert an element based on the given selector has the given css classes
     */
    assertClass(selector: string, ...classes: string[]): void;
    /**
     * Assert the attribute value of an element matching the given selector inside the application host equals to a given string.
     *
     * Will throw if there' more than one elements with matching selector
     */
    assertAttr(selector: string, name: string, value: string): void;
    /**
     * Assert the attribute value of an element matching the given selector inside the application host equals to a given string.
     *
     * Will throw if there' more than one elements with matching selector
     */
    assertAttrNS(selector: string, namespace: string, name: string, value: string): void;
    /**
     * Assert the style values of an element matching the given record (kebab-case properties as in the style attributes),
     * rather than the camelCase as in the property of `element.style`
     */
    assertStyles(selector: string, styles: Partial<CSSStyleDeclaration>): void;
    /**
     * Assert the value of an element matching the given selector inside the application host equals to a given value.
     *
     * Will throw if there' more than one elements with matching selector
     */
    assertValue(selector: string, value: unknown): void;
    /**
     * Assert whether an element matching the given selector has the :checked state.
     *
     * Will throw if there's no checked property on the element
     * Will throw if there' more than one elements with matching selector
     */
    assertChecked(selector: string, value: boolean): void;
    /**
     * Create a custom event by the given name and init for the current platform
     */
    createEvent<T>(name: string, init?: CustomEventInit<T>): CustomEvent;
    /**
     * Find an input or text area by the selector and emulate a keyboard event with the given value
     */
    type(selector: string | Element, value: string): void;
    hJsx(name: string, attrs: Record<string, string> | null, ...children: (Node | string | (Node | string)[])[]): HTMLElement;
    trigger: ITrigger;
    /**
     * A helper to scroll and trigger a scroll even on an element matching the given selector
     */
    scrollBy(selector: string, options: number | ScrollToOptions): void;
    flush(): void;
}
export type ITrigger = {
    (selector: string, event: 'keydown' | 'keyup' | 'keypress', init?: KeyboardEventInit, overrides?: Record<string, unknown>): void;
    (selector: string, event: 'click' | 'mousedown' | 'mouseup' | 'mousemove' | 'dbclick' | 'contextmenu', init?: MouseEventInit, overrides?: Record<string, unknown>): void;
    (selector: string, event: string, init?: CustomEventInit, overrides?: Record<string, unknown>): void;
    keydown(selector: string, init?: KeyboardEventInit, overrides?: Record<string, unknown>): void;
    keyup(selector: string, init?: KeyboardEventInit, overrides?: Record<string, unknown>): void;
    keypress(selector: string, init?: KeyboardEventInit, overrides?: Record<string, unknown>): void;
    click(selector: string, init?: MouseEventInit, overrides?: Record<string, unknown>): void;
    mousedown(selector: string, init?: MouseEventInit, overrides?: Record<string, unknown>): void;
    mouseup(selector: string, init?: MouseEventInit, overrides?: Record<string, unknown>): void;
    mousemove(selector: string, init?: MouseEventInit, overrides?: Record<string, unknown>): void;
    dbclick(selector: string, init?: MouseEventInit, overrides?: Record<string, unknown>): void;
    contextmenu(selector: string, init?: MouseEventInit, overrides?: Record<string, unknown>): void;
    change(selector: string, init?: CustomEventInit, overrides?: Record<string, unknown>): void;
    input(selector: string, init?: CustomEventInit, overrides?: Record<string, unknown>): void;
    scroll(selector: string, init?: CustomEventInit, overrides?: Record<string, unknown>): void;
};
export interface IFixtureBuilderBase<T, E = {}> {
    html(html: string): this & E;
    html<M>(html: TemplateStringsArray, ...values: TemplateValues<M>[]): this & E;
    component(comp: T, def?: Partial<PartialCustomElementDefinition>): this & E;
    deps(...args: unknown[]): this & E;
    config(config: IFixtureConfig): this & E;
}
type BuilderMethodNames = 'html' | 'component' | 'deps' | 'config';
type CreateBuilder<T, Availables extends BuilderMethodNames> = {
    [key in Availables]: key extends 'html' ? {
        (html: string): CreateBuilder<T, Exclude<Availables, 'html'>>;
        (html: TemplateStringsArray, ...values: TemplateValues<T>[]): CreateBuilder<T, Exclude<Availables, 'html'>>;
    } : key extends 'component' ? <K>(comp: Constructable<K> | K, def?: Partial<PartialCustomElementDefinition>) => CreateBuilder<K, Exclude<Availables, 'component'>> : (...args: Parameters<IFixtureBuilderBase<T>[key]>) => CreateBuilder<T, Exclude<Availables, key>>;
} & ('html' extends Availables ? {} : {
    build(): IFixture<T>;
});
type TaggedTemplateLambda<M> = (vm: M) => unknown;
type TemplateValues<M> = string | number | TaggedTemplateLambda<M>;
export type IFixtureConfig = Pick<IAppRootConfig, 'allowActionlessForm'>;
export {};
//# sourceMappingURL=startup.d.ts.map
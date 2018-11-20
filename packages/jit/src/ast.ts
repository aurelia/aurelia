import { PLATFORM } from '@aurelia/kernel';
import { DOM } from '@aurelia/runtime';

export class AttrSyntax {
  public readonly rawName: string;
  public readonly rawValue: string;
  public readonly target: string;
  public readonly command: string | null;

  constructor(rawName: string, rawValue: string, target: string, command: string | null) {
    this.rawName = rawName;
    this.rawValue = rawValue;
    this.target = target;
    this.command = command;
  }
}

const marker = DOM.createElement('au-m') as Element;
marker.classList.add('au');
const createMarker: () => HTMLElement = marker.cloneNode.bind(marker, false);

export class ElementSyntax {
  public readonly node: Node;
  public readonly name: string;
  public readonly $content: ElementSyntax | null;
  public readonly $children: ReadonlyArray<ElementSyntax>;
  public readonly $attributes: ReadonlyArray<AttrSyntax>;

  constructor(
    node: Node,
    name: string,
    $content: ElementSyntax | null,
    $children: ReadonlyArray<ElementSyntax>,
    $attributes: ReadonlyArray<AttrSyntax>) {
    this.node = node;
    this.name = name;
    this.$content = $content;
    this.$children = $children;
    this.$attributes = $attributes;
  }

  public static createMarker(): ElementSyntax {
    return new ElementSyntax(createMarker(), 'au-m', null, PLATFORM.emptyArray, PLATFORM.emptyArray);
  }
}

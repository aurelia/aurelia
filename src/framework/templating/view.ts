export class View {
  fragment: DocumentFragment;
  targets: NodeListOf<Element>;
  firstChild: Node;
  lastChild: Node;

  constructor(template: HTMLTemplateElement) {
    let clone = <HTMLTemplateElement>template.cloneNode(true);
    
    this.fragment = clone.content;
    this.targets = this.fragment.querySelectorAll('.au');
    this.firstChild = this.fragment.firstChild;
    this.lastChild = this.fragment.lastChild;
  }

  /**
  * Inserts this view's nodes before the specified DOM node.
  * @param refNode The node to insert this view's nodes before.
  */
  insertNodesBefore(refNode: Node): void {
     refNode.parentNode.insertBefore(this.fragment, refNode);
  }

  /**
  * Appends this view's to the specified DOM node.
  * @param parent The parent element to append this view's nodes to.
  */
  appendNodesTo(parent: Element): void {
    parent.appendChild(this.fragment);
  }

  /**
  * Removes this view's nodes from the DOM.
  */
  removeNodes(): void {
    let fragment = this.fragment;
    let current = this.firstChild;
    let end = this.lastChild;
    let next;

    while (current) {
      next = current.nextSibling;
      fragment.appendChild(current);

      if (current === end) {
        break;
      }

      current = next;
    }
  }
}

import { AttrSyntax } from '@aurelia/jit';
import { DI } from '@aurelia/kernel';

export interface IAttrSyntaxTransformer {
  transform(node: HTMLElement, attrSyntax: AttrSyntax): void;
  map(tagName: string, attr: string): string;
}

export const IAttrSyntaxTransformer =
  DI
    .createInterface<IAttrSyntaxTransformer>('IAttrSyntaxTransformer')
    .withDefault(x => x.singleton(HtmlAttrSyntaxTransformer));

export class HtmlAttrSyntaxTransformer implements IAttrSyntaxTransformer {

  public transform(node: HTMLElement, attrSyntax: AttrSyntax): void {

    if (attrSyntax.command === 'bind') {
      this.transformBindingCommand(node, attrSyntax);
    }

    attrSyntax.target = this.map(node.tagName, attrSyntax.target);
  }

  public map(tagName: string, attr: string): string {
    let target = attr;
    switch (tagName) {
      case 'LABEL':
        switch (target) {
          case 'for':
            target = 'htmlFor';
            break;
        }
        break;
      case 'IMG':
        switch (target) {
          case 'usemap':
            target = 'useMap';
            break;
        }
        break;
      case 'INPUT':
        switch (target) {
          case 'maxlength':
            target = 'maxLength';
            break;
          case 'minlength':
            target = 'minLength';
            break;
          case 'formaction':
            target = 'formAction';
            break;
          case 'formenctype':
            target = 'formEncType';
            break;
          case 'formmethod':
            target = 'formMethod';
            break;
          case 'formnovalidate':
            target = 'formNoValidate';
            break;
          case 'formtarget':
            target = 'formTarget';
            break;
        }
        break;
      case 'TEXTAREA':
        switch (target) {
          case 'maxlength':
            target = 'maxLength';
            break;
        }
        break;
      case 'TD':
      case 'TH':
        switch (target) {
          case 'rowspan':
            target = 'rowSpan';
            break;
          case 'colspan':
            target = 'colSpan';
            break;
        }
        break;
      default:
        switch (target) {
          case 'accesskey':
            target = 'accessKey';
            break;
          case 'contenteditable':
            target = 'contentEditable';
            break;
          case 'tabindex':
            target = 'tabIndex';
            break;
          case 'textcontent':
            target = 'textContent';
            break;
          case 'innerhtml':
            target = 'innerHTML';
            break;
          case 'scrolltop':
            target = 'scrollTop';
            break;
          case 'scrollleft':
            target = 'scrollLeft';
            break;
          case 'readonly':
            target = 'readOnly';
            break;
        }
        break;
    }
    return target;
  }

  private transformBindingCommand(element: HTMLElement, attrSyntax: AttrSyntax): void {
    const tagName = element.tagName;
    const target = attrSyntax.target;
    let command = attrSyntax.command;

    if (tagName === 'INPUT') {
      const inputType = (element as HTMLInputElement).type;
      if (
        (target === 'value' || target === 'files') && inputType !== 'checkbox' && inputType !== 'radio'
        || target === 'checked' && (inputType === 'checkbox' || inputType === 'radio')
      ) {
        command = 'two-way';
      }
    } else if (
      (tagName === 'TEXTAREA' || tagName === 'SELECT') && target === 'value'
      || (target === 'textcontent' || target === 'innerhtml') && element.hasAttribute('contenteditable')
      || target === 'scrolltop'
      || target === 'scrollleft'
    ) {
      command = 'two-way';
    }

    attrSyntax.command = command;
  }
}

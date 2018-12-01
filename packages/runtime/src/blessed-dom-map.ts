import { Widgets } from 'blessed';
import { CSSStyleDeclaration, Node, Element, HTMLElement } from '../basichtml';
import { BlessedDOM } from './blessed-dom';
import * as blessed from 'blessed';

(map => {
  const emptyOps = {};
  const dimensionProps: ('top' | 'left' | 'width' | 'height')[] = ['top', 'left', 'width', 'height'];
  function transferDimension(opts: Widgets.ElementOptions, node: Element) {
    dimensionProps.forEach(prop => {
      const value = node.getAttribute(prop);
      if (value) {
        const num = Number(value);
        opts[prop] = num ? num : value;
      }
    });
    return opts;
  }
  function transferContent(opts: Widgets.ElementOptions, node: Element) {
    ['content', 'text'].forEach(prop => {
      const contentOrText = node.getAttribute(prop);
      if (contentOrText) {
        opts[prop] = contentOrText;
      }
    });
    return opts;
  }
  function transferBooleans(opts: Widgets.ElementOptions, node: Element) {
    ['keys', 'mouse'].forEach(prop => {
      if (node.hasAttribute(prop)) {
        opts[prop] = true;
      }
    });
    if (node.hasAttribute('input-on-focus')) {
      opts['inputOnFocus'] = true;
    }
    return opts;
  }
  function transferStyles(opts: Widgets.ElementOptions, node: Element) {
    const style = (node as HTMLElement).style || (node.getAttributeNode('style') as any as CSSStyleDeclaration);
    if (style) {
      const optsStyle = opts.style = opts.style || {};
      const background = style.bg;
      if (background) {
        optsStyle.bg = background;
      }
      const focus = style['bg.focus'];
      if (focus) {
        optsStyle.focus = { bg: focus };
      }
      const border = node.getAttribute('border');
      if (border && (border === 'line' || border === 'bg')) {
        opts.border = border;
      }
    }
  }
  function transferName(opts: Widgets.ElementOptions, node: Element) {
    const name = node.getAttribute('name');
    if (name) {
      opts.name = name;
    }
  }
  function createOpts(node?: Element, opts: Widgets.ElementOptions = {}): Widgets.ElementOptions {
    if (node) {
      transferDimension(opts, node);
      transferContent(opts, node);
      transferBooleans(opts, node);
      transferStyles(opts, node);
      transferName(opts, node);
    }
    return opts;
  }
  map('label', (node?: Element) => {
    return blessed.text(createOpts(node));
  });
  map('button', (node?: Element) => {
    return blessed.button(createOpts(node));
  });
  map('textbox', (node?: Element) => {
    return blessed.textbox(createOpts(node));
  });
  map('textarea', (node?: Element) => {
    return blessed.textarea(createOpts(node));
  });
  map('checkbox', (node?: Element) => {
    return blessed.checkbox(createOpts(node));
  });
  map('radio', (node?: Element) => {
    return blessed.radiobutton(createOpts(node));
  });
  map('radioset', (node?: Element) => {
    return blessed.radioset(createOpts(node));
  });
  map('box', (node?: Element) => {
    return blessed.box(createOpts(node));
  });
  map('form', (node?: Element) => {
    return blessed.form(createOpts(node));
  });
  // map('ui-form', () => new UiForm());
  // map('ui-entry', () => new UiEntry());
  // map('ui-multiline-entry', () => new UiMultilineEntry());
  // map('ui-combobox', () => new UiCombobox());
  // map('ui-checkbox', () => new UiCheckbox());
  // map('ui-hbox', () => new UiHorizontalBox());
  // map('ui-vbox', () => new UiVerticalBox());
  // map('ui-slider', () => new UiSlider());
  // map('ui-tab', () => new UiTab());
})(BlessedDOM.map);

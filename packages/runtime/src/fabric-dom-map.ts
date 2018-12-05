// import { CSSStyleDeclaration, Node, Element, HTMLElement } from '../basichtml';
import { KonvaDOM } from './konva-dom';
import * as konva from 'konva';
import { PLATFORM } from 'kernel';

(map => {
  const emptyOps = {};
  const dimensionProps: ('top' | 'left' | 'width' | 'height')[] = ['top', 'left', 'width', 'height'];
  // function transferDimension(opts: Widgets.ElementOptions, node: Element) {
  //   dimensionProps.forEach(prop => {
  //     const value = node.getAttribute(prop);
  //     if (value) {
  //       const num = Number(value);
  //       opts[prop] = num ? num : value;
  //     }
  //   });
  //   return opts;
  // }
  // function transferContent(opts: Widgets.ElementOptions, node: Element) {
  //   ['content', 'text'].forEach(prop => {
  //     const contentOrText = node.getAttribute(prop);
  //     if (contentOrText) {
  //       opts[prop] = contentOrText;
  //     }
  //   });
  //   return opts;
  // }
  // function transferBooleans(opts: Widgets.ElementOptions, node: Element) {
  //   ['keys', 'mouse'].forEach(prop => {
  //     if (node.hasAttribute(prop)) {
  //       opts[prop] = true;
  //     }
  //   });
  //   if (node.hasAttribute('input-on-focus')) {
  //     opts['inputOnFocus'] = true;
  //   }
  //   return opts;
  // }
  // function transferStyles(opts: Widgets.ElementOptions, node: Element) {
  //   const style = (node as HTMLElement).style || (node.getAttributeNode('style') as any as CSSStyleDeclaration);
  //   if (style) {
  //     const optsStyle = opts.style = opts.style || {};
  //     const background = style.bg;
  //     if (background) {
  //       optsStyle.bg = background;
  //     }
  //     const focus = style['bg.focus'];
  //     if (focus) {
  //       optsStyle.focus = { bg: focus };
  //     }
  //     const border = node.getAttribute('border');
  //     if (border && (border === 'line' || border === 'bg')) {
  //       opts.border = border;
  //     }
  //   }
  // }
  // function transferName(opts: Widgets.ElementOptions, node: Element) {
  //   const name = node.getAttribute('name');
  //   if (name) {
  //     opts.name = name;
  //   }
  // }
  // function createOpts(node?: Element, opts: Widgets.ElementOptions = {}): Widgets.ElementOptions {
  //   if (node) {
  //     transferDimension(opts, node);
  //     transferContent(opts, node);
  //     transferBooleans(opts, node);
  //     transferStyles(opts, node);
  //     transferName(opts, node);
  //   }
  //   return opts;
  // }
  const camelCase = PLATFORM.camelCase;
  map('TEXT', (node?: Element) => {
    const text = new konva.Text({ text: node.getAttribute('text') || '' });
    if (node.hasAttribute('draggable')) {
      text.draggable(true);
    }
    return text;
  });
  map('LAYER', (node?: Element) => {
    const layer = new konva.Layer();
    return layer;
  });
  map('RECT', (node?: Element) => {
    const opts: konva.RectConfig = {};
    ['x', 'y', 'width', 'height', 'stroke-width'].forEach(p => {
      const value = Number(node.getAttribute(p));
      if (!isNaN(value)) {
        opts[camelCase(p)] = value;
      }
    });
    ['fill', 'stroke'].forEach(p => {
      if (node.hasAttribute(p)) {
        opts[p] = node.getAttribute(p);
        opts.fillEnabled = true;
      }
    });
    opts.draggable = node.hasAttribute('draggable');
    return new konva.Rect(opts);
  });
  map('IMAGE', (node?: Element) => {
    const image = new Image();
    const opts: konva.ImageConfig = {
      image,
    };
    ['x', 'y', 'width', 'height'].forEach(p => {
      const value = Number(node.getAttribute(p));
      if (!isNaN(value)) {
        opts[camelCase(p)] = value;
      }
    });
    
    const img = new konva.Image(opts);
    const realImage = new Image();
    realImage.onload = function() {
      realImage.onload = null;
      img.image(realImage);
    };
    return img;
  });
})(KonvaDOM.map);

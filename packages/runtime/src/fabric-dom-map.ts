// import { CSSStyleDeclaration, Node, Element, HTMLElement } from '../basichtml';
import { FabricDOM } from './fabric-dom';
import { PLATFORM } from '../kernel';
import { VNode } from '../dom/node';
import { IFabricVNode } from './fabric-vnode';

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
  const tryConvertToNumbers = (attributes: Record<string, string>): Record<string, number | string> => {
    return Object
      .keys(attributes)
      .reduce((attrs, prop) => {
        prop = camelCase(prop);
        let value = attributes[prop];
        let nVal = Number(value);
        attrs[prop] = isNaN(nVal) ? value : nVal;
        return attrs;
      }, {});
  }
  // map('')?
  VNode.invokeNativeObject = (node: VNode<fabric.Object | fabric.StaticCanvas>, ...args: any[]) => {
    const nodeName = node.nodeName;
    switch (nodeName) {
      case 'canvas':
        let canvas: HTMLCanvasElement;
        if (node.hasAttribute('canvas')) {
          let canvasId =  node.getAttribute('canvas');
          canvas = document.getElementById(canvasId) as HTMLCanvasElement;
          if (canvas === null) {
            throw new Error('Invalid canvas ID. Canvas not found');
          }
        } else {
          canvas = document.createElement('canvas');
        }
        node.nativeObject = new fabric.Canvas(canvas, tryConvertToNumbers(node.attributes));
        if (node.hasAttribute('background-color')) {
          node.nativeObject.backgroundColor = node.getAttribute('background-color');
        }
        if (node.hasAttribute('x')) {
          (node.nativeObject as fabric.Canvas)['lowerCanvasEl'].style.left = `${node.getAttribute('x')}px`;
          (node.nativeObject as fabric.Canvas)['upperCanvasEl'].style.left = `${node.getAttribute('x')}px`;
        }
        if (node.hasAttribute('y')) {
          (node.nativeObject as fabric.Canvas)['lowerCanvasEl'].style.top = `${node.getAttribute('y')}px`;
          (node.nativeObject as fabric.Canvas)['upperCanvasEl'].style.top = `${node.getAttribute('y')}px`;
        }
        let i = 0;
        let childVNodes = node.childNodes;
        while (i < childVNodes.length) {
          let childVNode = childVNodes[i];
          childVNode.invokeNativeObject();
          VNode.appendChild(childVNode, node);
          i++;
        }
        break;
      case 'group':
        // todo: convert node.attributes into appropriate group props
        node.nativeObject = new fabric.Group([], {});
        let $i = 0;
        let $childVNodes = node.childNodes;
        while ($i < $childVNodes.length) {
          let $childVNode = childVNodes[i];
          $childVNode.invokeNativeObject();
          VNode.appendChild($childVNode, node);
          i++;
        }
        break;
      case 'rect':
        node.nativeObject = new fabric.Rect(tryConvertToNumbers(node.attributes));
        break;
    }
  };
  VNode.appendChild = (node: VNode<fabric.Object | fabric.StaticCanvas>, parentNode: VNode) => {
    const nodeName = node.nodeName;
    const nodeNativeObject = node.nativeObject;
    const parentNodeName = parentNode.nodeName;
    const parentNativeObject = parentNode.nativeObject;
    
    if (parentNodeName === '$root') {
      if (nodeName === 'canvas' || nodeName === 'static-canvas') {
        (parentNativeObject as HTMLElement).appendChild((nodeNativeObject as fabric.StaticCanvas).getElement());
        if (nodeName === 'canvas') {
          (parentNativeObject as HTMLElement).appendChild((nodeNativeObject as fabric.Canvas)['upperCanvasEl']);
        }
      } else {
        throw new Error(`Invalid root node child. Expected "canvas" or "static-canvas", received: "${nodeName}"`);
      }
      return;
    }

    if (!(nodeNativeObject instanceof fabric.Object)) {
      throw new Error(`Invalid child node. Expected a fabric.Object instance. Received : "${nodeNativeObject.constructor.name}"`);
    }

    if (parentNodeName === 'canvas' || parentNodeName === 'static-canvas') {
      (parentNativeObject as fabric.StaticCanvas).add(nodeNativeObject);
      return;
    }
    if (parentNodeName === 'group') {
      (parentNativeObject as fabric.Group).add(nodeNativeObject);
    }
  };
})(FabricDOM.map);

// import { CSSStyleDeclaration, Node, Element, HTMLElement } from '../basichtml';
import { ThreejsDOM } from './three-dom';
import { PLATFORM } from '../kernel';
import { VNode } from '../dom/node';
import { I3VNode, ThreeObject } from './three-vnode';
import * as THREE from 'three';
import { DOM } from './dom';

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
  const tryAssignAttr = <T extends ThreeObject>(obj: T, attributes: Record<string, string>): T => {
    Object.keys(attributes).forEach(attr => {
      if (attr in obj) {
        const value = attributes[attr];
        const nVal = Number(value);
        obj[attr] = isNaN(nVal) ? value : nVal;
      }
    });
    return obj;
  };
  const getNumberAttributes = (attrs: string[], attributes: Record<string, string>, throwOnAbsence?: boolean): number[] => {
    return attrs.map(attr => {
      if (throwOnAbsence && attributes[attr] === undefined) {
        throw new Error(`Attribute ${attr} not found`);
      }
      const val = Number(attributes[attr]);
      return isNaN(val) ? 0 : val;
    });
  }
  const getCanvasFromVNode = (node: VNode): HTMLCanvasElement => {
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
    if (node.hasAttribute('x')) {
      canvas.style.left = `${node.getAttribute('x')}px`;
    }
    if (node.hasAttribute('y')) {
      canvas.style.top = `${node.getAttribute('y')}px`;
    }
    // if (node.hasAttribute('width')) {
    //   canvas.style.width = `${node.getAttribute('width')}px`;
    // }
    // if (node.hasAttribute('height')) {
    //   canvas.style.height = `${node.getAttribute('height')}px`;
    // }
    return canvas;
  }
  VNode.invokeNativeObject = (node: VNode<ThreeObject>, ...args: any[]) => {
    const nodeName = node.nodeName;
    switch (nodeName) {
      case 't-webgl': {
        const canvas = getCanvasFromVNode(node);
        const renderer = new THREE.WebGLRenderer({ canvas });
        renderer.setSize(Number(node.getAttribute('width')), Number(node.getAttribute('height')));
        node.nativeObject = renderer;
        let i = 0;
        let childVNodes = node.childNodes;
        while (i < childVNodes.length) {
          let childVNode = childVNodes[i];
          childVNode.invokeNativeObject();
          VNode.appendChild(childVNode, node);
          i++;
        }
        break;
      }
      case 't-canvas': {
        const canvas = getCanvasFromVNode(node);
        node.nativeObject = new THREE.CanvasRenderer({ canvas: canvas });
        let i = 0;
        let childVNodes = node.childNodes;
        while (i < childVNodes.length) {
          let childVNode = childVNodes[i];
          childVNode.invokeNativeObject();
          VNode.appendChild(childVNode, node);
          i++;
        }
        break;
      }
      case 't-group': {
        // todo: convert node.attributes into appropriate group props
        node.nativeObject = new THREE.Group();
        let i = 0;
        let childVNodes = node.childNodes;
        while (i < childVNodes.length) {
          let childVNode = childVNodes[i];
          childVNode.invokeNativeObject();
          VNode.appendChild(childVNode, node);
          i++;
        }
        break;
      }
      case 't-orthographic-camera':
      case 't-perspective-camera':
      case 't-stereo-camera':
      case 't-camera':
        const cam = new THREE.PerspectiveCamera();
        const pos = node.getAttribute('position').split(' ').map(Number);
        cam.position.x += pos[0] || 0;
        cam.position.y += pos[1] || 0;
        cam.position.z += pos[2] || 0;
        if (node.hasAttribute('far')) {
          cam.far = Number(node.getAttribute('far')) || 0;
        }
        node.nativeObject = cam;
        break;
      case 't-scene': {
        let scene = new THREE.Scene();
        scene.background = node.getAttribute('background');
        node.nativeObject = scene;
        let i = 0;
        let childVNodes = node.childNodes;
        while (i < childVNodes.length) {
          let childVNode = childVNodes[i];
          childVNode.invokeNativeObject();
          VNode.appendChild(childVNode, node);
          i++;
        }
        break;
      }
      case 't-mesh': {
        let geometry: THREE.Geometry;
        let material: THREE.Material;
        let $i = 0;
        let $childVNodes = node.childNodes;
        while ($i < $childVNodes.length) {
          let $childVNode = $childVNodes[$i];
          let nativeObject = $childVNode.invokeNativeObject();
          if (nativeObject.isGeometry === true) {
            geometry = nativeObject;
          } else if (nativeObject.isMaterial === true) {
            material = nativeObject;
          }
          $i++;
        }
        node.nativeObject = new THREE.Mesh(geometry, material);
        break;
      }
      case 't-geo-box':
        const box = new THREE.BoxGeometry(...getNumberAttributes(['width', 'height', 'depth'], node.attributes, true));
        node.nativeObject = box;
        break;
      case 't-material':
        const mat = new THREE.MeshBasicMaterial({ color: node.getAttribute('color') });
        node.nativeObject = mat;
        break;
      case 't-light': case 't-bone': case 't-group': case 't-lod': case 't-line': case 't-mesh': case 't-point': case 't-sprite':
      case 't-scene': case 't-audio': case 't-audio-listener': case 't-arrow-helper': case 't-directional-arrow-helper':
      case 't-hemishpere-light-helper': case 't-point-light-helper': case 't-spot-light-helper':
      case 't-immediate-render-object':
        
        break;
    }
  };
  VNode.appendChild = (node: VNode<ThreeObject>, parentNode: VNode) => {
    const nodeName = node.nodeName;
    const nodeNativeObject = node.nativeObject;
    const parentNodeName = parentNode.nodeName;
    const parentNativeObject = parentNode.nativeObject;
    
    if (nodeName === 't-webgl' || nodeName === 't-canvas') {
      if (DOM.isNodeInstance(parentNativeObject)) {
        (parentNativeObject as Element).appendChild((nodeNativeObject as THREE.Renderer).domElement);
      } else {
        throw new Error('Invalid renderer parent. Supposed to be an HTML Element');
      }
      return;
    }
    if (parentNodeName === 't-webgl') {
      // what to do?
      window['renderer'] = parentNativeObject;
      window['rendererVNode'] = parentNode;
      return;
    } else {
      if (!ThreejsDOM.isObject3D(parentNativeObject)) {
        throw new Error('Parent node is not a ThreeJs.Group instance');
      }
    }
    if (!ThreejsDOM.isObject3D(nodeNativeObject)) {
      throw new Error('Node is not a ThreeJs.Object3D instance.');
    }
    (parentNativeObject as THREE.Object3D).add(nodeNativeObject);
  };
})(ThreejsDOM.map);

import { IContainer } from '@aurelia/kernel';
import { DOM, INode, ISVGAnalyzer } from '@aurelia/runtime';

const svgElements = {
  a: ['class','externalResourcesRequired','id','onactivate','onclick','onfocusin','onfocusout','onload','onmousedown','onmousemove','onmouseout','onmouseover','onmouseup','requiredExtensions','requiredFeatures','style','systemLanguage','target','transform','xlink:actuate','xlink:arcrole','xlink:href','xlink:role','xlink:show','xlink:title','xlink:type','xml:base','xml:lang','xml:space'],
  altGlyph: ['class','dx','dy','externalResourcesRequired','format','glyphRef','id','onactivate','onclick','onfocusin','onfocusout','onload','onmousedown','onmousemove','onmouseout','onmouseover','onmouseup','requiredExtensions','requiredFeatures','rotate','style','systemLanguage','x','xlink:actuate','xlink:arcrole','xlink:href','xlink:role','xlink:show','xlink:title','xlink:type','xml:base','xml:lang','xml:space','y'],
  altGlyphDef: ['id','xml:base','xml:lang','xml:space'],
  altGlyphItem: ['id','xml:base','xml:lang','xml:space'],
  animate: ['accumulate','additive','attributeName','attributeType','begin','by','calcMode','dur','end','externalResourcesRequired','fill','from','id','keySplines','keyTimes','max','min','onbegin','onend','onload','onrepeat','repeatCount','repeatDur','requiredExtensions','requiredFeatures','restart','systemLanguage','to','values','xlink:actuate','xlink:arcrole','xlink:href','xlink:role','xlink:show','xlink:title','xlink:type','xml:base','xml:lang','xml:space'],
  animateColor: ['accumulate','additive','attributeName','attributeType','begin','by','calcMode','dur','end','externalResourcesRequired','fill','from','id','keySplines','keyTimes','max','min','onbegin','onend','onload','onrepeat','repeatCount','repeatDur','requiredExtensions','requiredFeatures','restart','systemLanguage','to','values','xlink:actuate','xlink:arcrole','xlink:href','xlink:role','xlink:show','xlink:title','xlink:type','xml:base','xml:lang','xml:space'],
  animateMotion: ['accumulate','additive','begin','by','calcMode','dur','end','externalResourcesRequired','fill','from','id','keyPoints','keySplines','keyTimes','max','min','onbegin','onend','onload','onrepeat','origin','path','repeatCount','repeatDur','requiredExtensions','requiredFeatures','restart','rotate','systemLanguage','to','values','xlink:actuate','xlink:arcrole','xlink:href','xlink:role','xlink:show','xlink:title','xlink:type','xml:base','xml:lang','xml:space'],
  animateTransform: ['accumulate','additive','attributeName','attributeType','begin','by','calcMode','dur','end','externalResourcesRequired','fill','from','id','keySplines','keyTimes','max','min','onbegin','onend','onload','onrepeat','repeatCount','repeatDur','requiredExtensions','requiredFeatures','restart','systemLanguage','to','type','values','xlink:actuate','xlink:arcrole','xlink:href','xlink:role','xlink:show','xlink:title','xlink:type','xml:base','xml:lang','xml:space'],
  circle: ['class','cx','cy','externalResourcesRequired','id','onactivate','onclick','onfocusin','onfocusout','onload','onmousedown','onmousemove','onmouseout','onmouseover','onmouseup','r','requiredExtensions','requiredFeatures','style','systemLanguage','transform','xml:base','xml:lang','xml:space'],
  clipPath: ['class','clipPathUnits','externalResourcesRequired','id','requiredExtensions','requiredFeatures','style','systemLanguage','transform','xml:base','xml:lang','xml:space'],
  'color-profile': ['id','local','name','rendering-intent','xlink:actuate','xlink:arcrole','xlink:href','xlink:role','xlink:show','xlink:title','xlink:type','xml:base','xml:lang','xml:space'],
  cursor: ['externalResourcesRequired','id','requiredExtensions','requiredFeatures','systemLanguage','x','xlink:actuate','xlink:arcrole','xlink:href','xlink:role','xlink:show','xlink:title','xlink:type','xml:base','xml:lang','xml:space','y'],
  defs: ['class','externalResourcesRequired','id','onactivate','onclick','onfocusin','onfocusout','onload','onmousedown','onmousemove','onmouseout','onmouseover','onmouseup','requiredExtensions','requiredFeatures','style','systemLanguage','transform','xml:base','xml:lang','xml:space'],
  desc: ['class','id','style','xml:base','xml:lang','xml:space'],
  ellipse: ['class','cx','cy','externalResourcesRequired','id','onactivate','onclick','onfocusin','onfocusout','onload','onmousedown','onmousemove','onmouseout','onmouseover','onmouseup','requiredExtensions','requiredFeatures','rx','ry','style','systemLanguage','transform','xml:base','xml:lang','xml:space'],
  feBlend: ['class','height','id','in','in2','mode','result','style','width','x','xml:base','xml:lang','xml:space','y'],
  feColorMatrix: ['class','height','id','in','result','style','type','values','width','x','xml:base','xml:lang','xml:space','y'],
  feComponentTransfer: ['class','height','id','in','result','style','width','x','xml:base','xml:lang','xml:space','y'],
  feComposite: ['class','height','id','in','in2','k1','k2','k3','k4','operator','result','style','width','x','xml:base','xml:lang','xml:space','y'],
  feConvolveMatrix: ['bias','class','divisor','edgeMode','height','id','in','kernelMatrix','kernelUnitLength','order','preserveAlpha','result','style','targetX','targetY','width','x','xml:base','xml:lang','xml:space','y'],
  feDiffuseLighting: ['class','diffuseConstant','height','id','in','kernelUnitLength','result','style','surfaceScale','width','x','xml:base','xml:lang','xml:space','y'],
  feDisplacementMap: ['class','height','id','in','in2','result','scale','style','width','x','xChannelSelector','xml:base','xml:lang','xml:space','y','yChannelSelector'],
  feDistantLight: ['azimuth','elevation','id','xml:base','xml:lang','xml:space'],
  feFlood: ['class','height','id','result','style','width','x','xml:base','xml:lang','xml:space','y'],
  feFuncA: ['amplitude','exponent','id','intercept','offset','slope','tableValues','type','xml:base','xml:lang','xml:space'],
  feFuncB: ['amplitude','exponent','id','intercept','offset','slope','tableValues','type','xml:base','xml:lang','xml:space'],
  feFuncG: ['amplitude','exponent','id','intercept','offset','slope','tableValues','type','xml:base','xml:lang','xml:space'],
  feFuncR: ['amplitude','exponent','id','intercept','offset','slope','tableValues','type','xml:base','xml:lang','xml:space'],
  feGaussianBlur: ['class','height','id','in','result','stdDeviation','style','width','x','xml:base','xml:lang','xml:space','y'],
  feImage: ['class','externalResourcesRequired','height','id','preserveAspectRatio','result','style','width','x','xlink:actuate','xlink:arcrole','xlink:href','xlink:role','xlink:show','xlink:title','xlink:type','xml:base','xml:lang','xml:space','y'],
  feMerge: ['class','height','id','result','style','width','x','xml:base','xml:lang','xml:space','y'],
  feMergeNode: ['id','xml:base','xml:lang','xml:space'],
  feMorphology: ['class','height','id','in','operator','radius','result','style','width','x','xml:base','xml:lang','xml:space','y'],
  feOffset: ['class','dx','dy','height','id','in','result','style','width','x','xml:base','xml:lang','xml:space','y'],
  fePointLight: ['id','x','xml:base','xml:lang','xml:space','y','z'],
  feSpecularLighting: ['class','height','id','in','kernelUnitLength','result','specularConstant','specularExponent','style','surfaceScale','width','x','xml:base','xml:lang','xml:space','y'],
  feSpotLight: ['id','limitingConeAngle','pointsAtX','pointsAtY','pointsAtZ','specularExponent','x','xml:base','xml:lang','xml:space','y','z'],
  feTile: ['class','height','id','in','result','style','width','x','xml:base','xml:lang','xml:space','y'],
  feTurbulence: ['baseFrequency','class','height','id','numOctaves','result','seed','stitchTiles','style','type','width','x','xml:base','xml:lang','xml:space','y'],
  filter: ['class','externalResourcesRequired','filterRes','filterUnits','height','id','primitiveUnits','style','width','x','xlink:actuate','xlink:arcrole','xlink:href','xlink:role','xlink:show','xlink:title','xlink:type','xml:base','xml:lang','xml:space','y'],
  font: ['class','externalResourcesRequired','horiz-adv-x','horiz-origin-x','horiz-origin-y','id','style','vert-adv-y','vert-origin-x','vert-origin-y','xml:base','xml:lang','xml:space'],
  'font-face': ['accent-height','alphabetic','ascent','bbox','cap-height','descent','font-family','font-size','font-stretch','font-style','font-variant','font-weight','hanging','id','ideographic','mathematical','overline-position','overline-thickness','panose-1','slope','stemh','stemv','strikethrough-position','strikethrough-thickness','underline-position','underline-thickness','unicode-range','units-per-em','v-alphabetic','v-hanging','v-ideographic','v-mathematical','widths','x-height','xml:base','xml:lang','xml:space'],
  'font-face-format': ['id','string','xml:base','xml:lang','xml:space'],
  'font-face-name': ['id','name','xml:base','xml:lang','xml:space'],
  'font-face-src': ['id','xml:base','xml:lang','xml:space'],
  'font-face-uri': ['id','xlink:actuate','xlink:arcrole','xlink:href','xlink:role','xlink:show','xlink:title','xlink:type','xml:base','xml:lang','xml:space'],
  foreignObject: ['class','externalResourcesRequired','height','id','onactivate','onclick','onfocusin','onfocusout','onload','onmousedown','onmousemove','onmouseout','onmouseover','onmouseup','requiredExtensions','requiredFeatures','style','systemLanguage','transform','width','x','xml:base','xml:lang','xml:space','y'],
  g: ['class','externalResourcesRequired','id','onactivate','onclick','onfocusin','onfocusout','onload','onmousedown','onmousemove','onmouseout','onmouseover','onmouseup','requiredExtensions','requiredFeatures','style','systemLanguage','transform','xml:base','xml:lang','xml:space'],
  glyph: ['arabic-form','class','d','glyph-name','horiz-adv-x','id','lang','orientation','style','unicode','vert-adv-y','vert-origin-x','vert-origin-y','xml:base','xml:lang','xml:space'],
  glyphRef: ['class','dx','dy','format','glyphRef','id','style','x','xlink:actuate','xlink:arcrole','xlink:href','xlink:role','xlink:show','xlink:title','xlink:type','xml:base','xml:lang','xml:space','y'],
  hkern: ['g1','g2','id','k','u1','u2','xml:base','xml:lang','xml:space'],
  image: ['class','externalResourcesRequired','height','id','onactivate','onclick','onfocusin','onfocusout','onload','onmousedown','onmousemove','onmouseout','onmouseover','onmouseup','preserveAspectRatio','requiredExtensions','requiredFeatures','style','systemLanguage','transform','width','x','xlink:actuate','xlink:arcrole','xlink:href','xlink:role','xlink:show','xlink:title','xlink:type','xml:base','xml:lang','xml:space','y'],
  line: ['class','externalResourcesRequired','id','onactivate','onclick','onfocusin','onfocusout','onload','onmousedown','onmousemove','onmouseout','onmouseover','onmouseup','requiredExtensions','requiredFeatures','style','systemLanguage','transform','x1','x2','xml:base','xml:lang','xml:space','y1','y2'],
  linearGradient: ['class','externalResourcesRequired','gradientTransform','gradientUnits','id','spreadMethod','style','x1','x2','xlink:arcrole','xlink:href','xlink:role','xlink:title','xlink:type','xml:base','xml:lang','xml:space','y1','y2'],
  marker: ['class','externalResourcesRequired','id','markerHeight','markerUnits','markerWidth','orient','preserveAspectRatio','refX','refY','style','viewBox','xml:base','xml:lang','xml:space'],
  mask: ['class','externalResourcesRequired','height','id','maskContentUnits','maskUnits','requiredExtensions','requiredFeatures','style','systemLanguage','width','x','xml:base','xml:lang','xml:space','y'],
  metadata: ['id','xml:base','xml:lang','xml:space'],
  'missing-glyph': ['class','d','horiz-adv-x','id','style','vert-adv-y','vert-origin-x','vert-origin-y','xml:base','xml:lang','xml:space'],
  mpath: ['externalResourcesRequired','id','xlink:actuate','xlink:arcrole','xlink:href','xlink:role','xlink:show','xlink:title','xlink:type','xml:base','xml:lang','xml:space'],
  path: ['class','d','externalResourcesRequired','id','onactivate','onclick','onfocusin','onfocusout','onload','onmousedown','onmousemove','onmouseout','onmouseover','onmouseup','pathLength','requiredExtensions','requiredFeatures','style','systemLanguage','transform','xml:base','xml:lang','xml:space'],
  pattern: ['class','externalResourcesRequired','height','id','patternContentUnits','patternTransform','patternUnits','preserveAspectRatio','requiredExtensions','requiredFeatures','style','systemLanguage','viewBox','width','x','xlink:actuate','xlink:arcrole','xlink:href','xlink:role','xlink:show','xlink:title','xlink:type','xml:base','xml:lang','xml:space','y'],
  polygon: ['class','externalResourcesRequired','id','onactivate','onclick','onfocusin','onfocusout','onload','onmousedown','onmousemove','onmouseout','onmouseover','onmouseup','points','requiredExtensions','requiredFeatures','style','systemLanguage','transform','xml:base','xml:lang','xml:space'],
  polyline: ['class','externalResourcesRequired','id','onactivate','onclick','onfocusin','onfocusout','onload','onmousedown','onmousemove','onmouseout','onmouseover','onmouseup','points','requiredExtensions','requiredFeatures','style','systemLanguage','transform','xml:base','xml:lang','xml:space'],
  radialGradient: ['class','cx','cy','externalResourcesRequired','fx','fy','gradientTransform','gradientUnits','id','r','spreadMethod','style','xlink:arcrole','xlink:href','xlink:role','xlink:title','xlink:type','xml:base','xml:lang','xml:space'],
  rect: ['class','externalResourcesRequired','height','id','onactivate','onclick','onfocusin','onfocusout','onload','onmousedown','onmousemove','onmouseout','onmouseover','onmouseup','requiredExtensions','requiredFeatures','rx','ry','style','systemLanguage','transform','width','x','xml:base','xml:lang','xml:space','y'],
  script: ['externalResourcesRequired','id','type','xlink:actuate','xlink:arcrole','xlink:href','xlink:role','xlink:show','xlink:title','xlink:type','xml:base','xml:lang','xml:space'],
  set: ['attributeName','attributeType','begin','dur','end','externalResourcesRequired','fill','id','max','min','onbegin','onend','onload','onrepeat','repeatCount','repeatDur','requiredExtensions','requiredFeatures','restart','systemLanguage','to','xlink:actuate','xlink:arcrole','xlink:href','xlink:role','xlink:show','xlink:title','xlink:type','xml:base','xml:lang','xml:space'],
  stop: ['class','id','offset','style','xml:base','xml:lang','xml:space'],
  style: ['id','media','title','type','xml:base','xml:lang','xml:space'],
  svg: ['baseProfile','class','contentScriptType','contentStyleType','externalResourcesRequired','height','id','onabort','onactivate','onclick','onerror','onfocusin','onfocusout','onload','onmousedown','onmousemove','onmouseout','onmouseover','onmouseup','onresize','onscroll','onunload','onzoom','preserveAspectRatio','requiredExtensions','requiredFeatures','style','systemLanguage','version','viewBox','width','x','xml:base','xml:lang','xml:space','y','zoomAndPan'],
  switch: ['class','externalResourcesRequired','id','onactivate','onclick','onfocusin','onfocusout','onload','onmousedown','onmousemove','onmouseout','onmouseover','onmouseup','requiredExtensions','requiredFeatures','style','systemLanguage','transform','xml:base','xml:lang','xml:space'],
  symbol: ['class','externalResourcesRequired','id','onactivate','onclick','onfocusin','onfocusout','onload','onmousedown','onmousemove','onmouseout','onmouseover','onmouseup','preserveAspectRatio','style','viewBox','xml:base','xml:lang','xml:space'],
  text: ['class','dx','dy','externalResourcesRequired','id','lengthAdjust','onactivate','onclick','onfocusin','onfocusout','onload','onmousedown','onmousemove','onmouseout','onmouseover','onmouseup','requiredExtensions','requiredFeatures','rotate','style','systemLanguage','textLength','transform','x','xml:base','xml:lang','xml:space','y'],
  textPath: ['class','externalResourcesRequired','id','lengthAdjust','method','onactivate','onclick','onfocusin','onfocusout','onload','onmousedown','onmousemove','onmouseout','onmouseover','onmouseup','requiredExtensions','requiredFeatures','spacing','startOffset','style','systemLanguage','textLength','xlink:arcrole','xlink:href','xlink:role','xlink:title','xlink:type','xml:base','xml:lang','xml:space'],
  title: ['class','id','style','xml:base','xml:lang','xml:space'],
  tref: ['class','dx','dy','externalResourcesRequired','id','lengthAdjust','onactivate','onclick','onfocusin','onfocusout','onload','onmousedown','onmousemove','onmouseout','onmouseover','onmouseup','requiredExtensions','requiredFeatures','rotate','style','systemLanguage','textLength','x','xlink:arcrole','xlink:href','xlink:role','xlink:title','xlink:type','xml:base','xml:lang','xml:space','y'],
  tspan: ['class','dx','dy','externalResourcesRequired','id','lengthAdjust','onactivate','onclick','onfocusin','onfocusout','onload','onmousedown','onmousemove','onmouseout','onmouseover','onmouseup','requiredExtensions','requiredFeatures','rotate','style','systemLanguage','textLength','x','xml:base','xml:lang','xml:space','y'],
  use: ['class','externalResourcesRequired','height','id','onactivate','onclick','onfocusin','onfocusout','onload','onmousedown','onmousemove','onmouseout','onmouseover','onmouseup','requiredExtensions','requiredFeatures','style','systemLanguage','transform','width','x','xlink:actuate','xlink:arcrole','xlink:href','xlink:role','xlink:show','xlink:title','xlink:type','xml:base','xml:lang','xml:space','y'],
  view: ['externalResourcesRequired','id','preserveAspectRatio','viewBox','viewTarget','xml:base','xml:lang','xml:space','zoomAndPan'],
  vkern: ['g1','g2','id','k','u1','u2','xml:base','xml:lang','xml:space'],
};

const svgPresentationElements = {
  'a': true,
  'altGlyph': true,
  'animate': true,
  'animateColor': true,
  'circle': true,
  'clipPath': true,
  'defs': true,
  'ellipse': true,
  'feBlend': true,
  'feColorMatrix': true,
  'feComponentTransfer': true,
  'feComposite': true,
  'feConvolveMatrix': true,
  'feDiffuseLighting': true,
  'feDisplacementMap': true,
  'feFlood': true,
  'feGaussianBlur': true,
  'feImage': true,
  'feMerge': true,
  'feMorphology': true,
  'feOffset': true,
  'feSpecularLighting': true,
  'feTile': true,
  'feTurbulence': true,
  'filter': true,
  'font': true,
  'foreignObject': true,
  'g': true,
  'glyph': true,
  'glyphRef': true,
  'image': true,
  'line': true,
  'linearGradient': true,
  'marker': true,
  'mask': true,
  'missing-glyph': true,
  'path': true,
  'pattern': true,
  'polygon': true,
  'polyline': true,
  'radialGradient': true,
  'rect': true,
  'stop': true,
  'svg': true,
  'switch': true,
  'symbol': true,
  'text': true,
  'textPath': true,
  'tref': true,
  'tspan': true,
  'use': true
};

const svgPresentationAttributes = {
  'alignment-baseline': true,
  'baseline-shift': true,
  'clip-path': true,
  'clip-rule': true,
  'clip': true,
  'color-interpolation-filters': true,
  'color-interpolation': true,
  'color-profile': true,
  'color-rendering': true,
  'color': true,
  'cursor': true,
  'direction': true,
  'display': true,
  'dominant-baseline': true,
  'enable-background': true,
  'fill-opacity': true,
  'fill-rule': true,
  'fill': true,
  'filter': true,
  'flood-color': true,
  'flood-opacity': true,
  'font-family': true,
  'font-size-adjust': true,
  'font-size': true,
  'font-stretch': true,
  'font-style': true,
  'font-variant': true,
  'font-weight': true,
  'glyph-orientation-horizontal': true,
  'glyph-orientation-vertical': true,
  'image-rendering': true,
  'kerning': true,
  'letter-spacing': true,
  'lighting-color': true,
  'marker-end': true,
  'marker-mid': true,
  'marker-start': true,
  'mask': true,
  'opacity': true,
  'overflow': true,
  'pointer-events': true,
  'shape-rendering': true,
  'stop-color': true,
  'stop-opacity': true,
  'stroke-dasharray': true,
  'stroke-dashoffset': true,
  'stroke-linecap': true,
  'stroke-linejoin': true,
  'stroke-miterlimit': true,
  'stroke-opacity': true,
  'stroke-width': true,
  'stroke': true,
  'text-anchor': true,
  'text-decoration': true,
  'text-rendering': true,
  'unicode-bidi': true,
  'visibility': true,
  'word-spacing': true,
  'writing-mode': true
};

// SVG elements/attributes are case-sensitive.  Not all browsers use the same casing for all attributes.
function createElement(html) {
  // Using very HTML-specific code here since you won't install this module
  // unless you are actually running in a browser, using HTML, 
  // and dealing with browser inconsistencies.
  let div = <HTMLElement>DOM.createElement('div');
  div.innerHTML = html;
  return div.firstElementChild;
};

if (createElement('<svg><altGlyph /></svg>').firstElementChild.nodeName === 'altglyph' && svgElements.altGlyph) {
  // handle chrome casing inconsistencies.
  (<any>svgElements).altglyph = svgElements.altGlyph;
  delete svgElements.altGlyph;
  (<any>svgElements).altglyphdef = svgElements.altGlyphDef;
  delete svgElements.altGlyphDef;
  (<any>svgElements).altglyphitem = svgElements.altGlyphItem;
  delete svgElements.altGlyphItem;
  (<any>svgElements).glyphref = svgElements.glyphRef;
  delete svgElements.glyphRef;
}

export function register(container: IContainer) {
  container.registerTransformer(ISVGAnalyzer, analyzer => {
    return Object.assign(analyzer, {
      isStandardSvgAttribute(node: INode, attributeName: string) {
        // Using very HTML-specific code here since you won't install this module
        // unless you are actually running in a browser, using HTML, 
        // and dealing with browser inconsistencies.
    
        if (!(node instanceof SVGElement)) {
          return false;
        }
    
        const nodeName = (<SVGElement>node).nodeName;
    
        return svgPresentationElements[nodeName] && svgPresentationAttributes[attributeName]
          || svgElements[nodeName] && svgElements[nodeName].indexOf(attributeName) !== -1;
      }
    });
  });
}

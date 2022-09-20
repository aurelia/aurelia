import { SVGAnalyzer } from '@aurelia/runtime-html';
import { createFixture } from '@aurelia/testing';
import { isNode } from '../util.js';

// todo: complete the SVG element/attr mapping table
describe('3-runtime-html/svg.spec.ts', function () {
  if (isNode()) return;

  // const externalResourcesRequiredAttr = 'externalResourcesRequired';
  // const externalResourcesRequiredAttr = '';
  // const styleAttr = 'style';
  // const basicAttrs = `class id`;
  const mouseListenerAttrs = 'onactivate onclick onfocusin onfocusout onload onmousedown onmousemove onmouseout onmouseover onmouseup';
  // const loadListenerAttrs = 'onbegin onend onload onrepeat';
  const xmlAttrs = 'xml:base xml:lang xml:space';
  const xlinkAttrs = 'xlink:actuate xlink:arcrole xlink:href xlink:role xlink:show xlink:title xlink:type';

  it('works with xhref:link', function () {
    const { assertAttrNS } = createFixture
      .deps(SVGAnalyzer)
      .component({ name: '1-square' })
      .html(`<svg>
        <use xlink:href="/base/bootstrap-icons.svg#\${name}" />
      </svg>
      `)
      .build();

    assertAttrNS('use', 'http://www.w3.org/1999/xlink', 'href', '/base/bootstrap-icons.svg#1-square');
  });

  for (const { name, attrs, only } of [
    {
      name: 'ellipse',
      attrs: `class cx cy externalResourcesRequired id ${mouseListenerAttrs} requiredExtensions requiredFeatures rx ry systemLanguage transform ${xmlAttrs}`,
      only: false
    },
    {
      name: 'a',
      attrs: `class externalResourcesRequired id ${mouseListenerAttrs} requiredExtensions requiredFeatures style systemLanguage target transform ${xlinkAttrs} ${xmlAttrs}`,
    },
    {
      name: 'altGlyph',
      attrs: `class dx dy externalResourcesRequired format glyphRef id ${mouseListenerAttrs} requiredExtensions requiredFeatures rotate style systemLanguage x ${xlinkAttrs} ${xmlAttrs} y`
    }
  ]) {
    (only ? describe.only : describe)(`<${name}/>`, function () {
      for (const attr of attrs.split(' ')) {
        // todo: externalResourcesRequired does not work
        if (attr === 'externalResourcesRequired' || attr === 'style' || attr === 'class') {
          continue;
        }
        it(`set [${attr}]`, function () {
          const { assertAttr } = createFixture
            .deps(SVGAnalyzer)
            .html(`<svg>
              <${name} ${attr}="\${1}" />
            </svg>
            `)
            .build();

          assertAttr(name, attr, '1');
        });
      }
    });
  }
});

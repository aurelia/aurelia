import { PLATFORM } from '@aurelia/kernel';
import { ILifecycle } from '@aurelia/runtime';
import { Blur } from '@aurelia/runtime-html';
import { assert, createSpy, eachCartesianJoin, HTMLTestContext, TestContext } from '@aurelia/testing';

describe('[UNIT] blur.spec.ts', function() {

  if (!PLATFORM.isBrowserLike) {
    return;
  }

  const falsyPansyValues = [false, 0, '', undefined, null];

  describe('contains()', function() {
    for (const value of falsyPansyValues) {
      it(`bails when value is already falsy: "${value}"`, function() {
        const { ctx, target, sut } = setup();
        const accessed: Record<string, number> = {};
        sut.value = value as unknown as boolean;
        sut.contains = (originalFn => {
          return function() {
            const proxy = new Proxy(this, {
              get(obj: Blur, propertyName: string): unknown {
                accessed[propertyName] = (accessed[propertyName] || 0) + 1;
                return obj[propertyName];
              }
            });
            return originalFn.apply(proxy, arguments);
          };
        })(sut.contains);

        const result = sut.contains(ctx.doc.body);
        assert.equal(result, false);
        assert.equal(Object.keys(accessed)[0], 'value', 'It should have accessed "value"');
        assert.equal(Object.keys(accessed).length, 1, 'It should not have accessed any other properties beside "value".');
      });
    }

    it('returns true when invoked on child element', function() {
      const { ctx, target, sut } = setup();
      const child = target.appendChild(ctx.createElement('div'));
      sut.value = true;
      const result = sut.contains(child);
      assert.equal(result, true);
    });

    it('returns true when invoked on the its own element', function() {
      const { ctx, target, sut } = setup();
      sut.value = true;
      assert.equal(sut.contains(target), true);
    });

    it('bails when there is no thing linked and the hosting element does not contain the target', function() {
      const { ctx, target, sut } = setup();
      let accessed: Record<string, number> = {};
      sut.value = true;
      sut.contains = (originalFn => {
        return function() {
          const proxy = new Proxy(this, {
            get(obj: Blur, propertyName: string): unknown {
              accessed[propertyName] = (accessed[propertyName] || 0) + 1;
              return obj[propertyName];
            }
          });
          return originalFn.apply(proxy, arguments);
        };
      })(sut.contains);

      // though the interface of Blur.contains is Element as first argument,
      // it can work with any subclass of Node
      for (const testValue of [
        ctx.doc.body,
        ctx.createElement('div'),
        ctx.doc.createDocumentFragment(),
        ctx.createElement('div').attachShadow({ mode: 'open' }),
        ctx.createElement('div').attachShadow({ mode: 'closed' }),
        ctx.doc.createComment('asdad'),
        ctx.doc.createTextNode('sdasdas'),
        ctx.doc.createElementNS('http://www.w3.org/1999/xhtml', 'asdasd:sadasd'),
        ctx.doc,
        ctx.doc.documentElement,
        ctx.doc.createAttribute('asd')
      ]) {
        const result = sut.contains(testValue as unknown as Element);
        assert.equal(result, false);
        const accessedProps = Object.keys(accessed);
        assert.equal(accessedProps.length, 3);
        assert.equal(
          accessedProps.toString(),
          ['value', 'element', 'linkedWith'].toString(),
          'It should have accessed "value", "element", "linkedWith"'
        );
        accessed = {};
      }
    });

    it('throws when given anything not a Node but also not null/undefined', function() {
      const { ctx, target, sut } = setup();
      sut.value = true;
      for (const imcompatValue of [true, false, 'a', 5, Symbol(), Number, new Date(), {}, [], new Proxy({}, {})]) {
        assert.throws(() => sut.contains(imcompatValue as unknown as Element));
      }
    });

    it('returns false when checking contains with element in different tree', function() {
      const { ctx, target, sut } = setup();
      target
        .attachShadow({ mode: 'open' })
        .innerHTML = '<button></button>';
      assert.equal(sut.contains(target.shadowRoot.querySelector('button')), false);
      assert.equal(sut.contains(target.shadowRoot as any), false);
    });
  });

  describe('.triggerBlur()', function() {
    it('sets value to false', function() {
      const { ctx, target, sut } = setup();
      for (const value of [true, 'a', 5, Symbol(), Number, new Date(), null, undefined, {}, [], new Proxy({}, {})]) {
        sut.value = value as unknown as boolean;
        sut.triggerBlur();
        assert.equal(sut.value, false);
      }
    });

    it('calls onBlur() if present', function() {
      const { ctx, target, sut } = setup();
      let count = 0;
      const onBlurSpy = createSpy(function() {
        count++;
      });
      sut.onBlur = onBlurSpy;
      const testValues = [true, 'a', 5, Symbol(), function() {/***/}, Number, new Date(), null, undefined, {}, [], new Proxy({}, {})];
      for (const value of testValues) {
        sut.value = value as unknown as boolean;
        sut.triggerBlur();
        assert.equal(sut.value, false);
        assert.equal(onBlurSpy.calls.length, 1);
        onBlurSpy.reset();
      }
      assert.equal(count, testValues.length);
    });

    it('does not call onBlur if value is not a function', function() {
      let { sut } = setup();
      const testValues = [true, 'a', 5, Symbol(), new Date(), null, undefined, {}, [], new Proxy({}, {})];
      let onBlurValue: any;
      let accessCount = 0;
      sut = new Proxy(sut, {
        get($obj, propertyName) {
          if (propertyName === 'onBlur') {
            accessCount++;
          }
          return propertyName === 'onBlur' ? onBlurValue : $obj[propertyName];
        }
      }) as any;
      for (const value of testValues) {
        onBlurValue = value;
        sut.triggerBlur();
      }
      assert.equal(accessCount, testValues.length);
    });
  });

  describe('\n\t+ [linkedWith]', function() {
    describe('object/object[] scenarios', function() {
      const { doc } = TestContext.createHTMLTestContext();
      const fakeEl = doc.body.appendChild(doc.createElement('fake'));
      const linkedWithValues: (HasContains | HasContains[])[] = [
        doc,
        doc.documentElement,
        doc.body,
        {
          name: 'some-view-model with contains method',
          contains(el: Element) {
            return el === fakeEl;
          }
        },
        [
          {
            name: 'some-other-vm',
            contains(el: Element) {
              return el === fakeEl;
            }
          },
          {
            handle(el: Element) {
              return el === fakeEl;
            },
            contains(el: Element) {
              return this.handle(el);
            }
          }
        ]
      ];
      for (const linkedWith of linkedWithValues) {
        it('invokes contains on linkedWith object', function() {
          const { ctx, target, sut } = setup();
          sut.linkedWith = linkedWith;
          assert.equal(
            sut.contains(fakeEl),
            true,
            `contains + linkedWith + ${linkedWith['name'] || typeof linkedWith}`
          );
        });
      }
    });

    describe('string/string[] scenarios', function() {
      const { doc } = TestContext.createHTMLTestContext();
      doc.body.insertAdjacentHTML('beforeend', `
        <some-el><div data-query="some-el"></div></some-el>,
        <div class="some-css-class">
          <div data-query=".some-css-class"></div>
        </div>
        <div id="some-id">
          <div data-query="#some-id"></div>
        </div>
        <div id="some-complex-selector">
          <div class="some-nested-complex-selector">
          </div>
          <button data-query="#some-complex-selector > .some-nested-complex-selector + button">Click me</button>
        </div>
      `);
      const linkedWithValues = [
        'some-el',
        '.some-css-class',
        '#some-id',
        '#some-complex-selector > .some-nested-complex-selector + button'
      ];
      for (const linkWith of linkedWithValues) {
        it(`works when linkedWith is a string: ${linkWith}`, function() {
          const { ctx, target, sut } = setup();
          sut.linkedWith = linkWith;
          const interactWith = doc.querySelector(`[data-query="${linkWith}"]`);
          assert.notEqual(
            interactWith,
            null,
            `querySelector[data-query=${linkWith}]`
          );
          assert.equal(sut.contains(interactWith), true);
        });
      }

      it('works when linkedWith is an array of string', function() {
        const { ctx, target, sut } = setup();
        sut.linkedWith = linkedWithValues;
        for (const linkWith of linkedWithValues) {
          const interactWith = doc.querySelector(`[data-query="${linkWith}"]`);
          assert.notEqual(
            interactWith,
            null,
            `querySelector[data-query=${linkWith}]`
          );
          assert.equal(sut.contains(interactWith), true);
        }
      });
    });
  });

  describe('with [linkedWith] + [onBlur] + ...', function todo() {/**/});
  describe('\n\twith [linkedWith] + [linkingContext]', function todo() {

    const testCases: ILinkingContextTestCase[] = [
      {
        title: () => `\n\t--> contains() return correct value with string values`,
        template: () =>
          `
            <div class='blur-host'>
              <div class='mouse-target'></div>
            </div>
            <dialog-container id="dialog-1">
              <select></select>
            </dialog-container>
            <dialog-container id="dialog-2">
              <select><option></option></select>
            </dialog-container>
            <dialog-container id="dialog-3">
              <input>
            </dialog-container>
          `,
        linkedWith: ['select', 'input'],
        linkingContext: null,
        blurHost: '.blur-host',
        assertFn: (ctx, host, sut) => {
          const select = host.querySelector('select');
          const input = host.querySelector('input');
          assert.equal(sut.contains(select), true);
          assert.equal(sut.contains(input), true);

          sut.linkingContext = '#dialog-1';
          assert.equal(sut.contains(select), true);
          assert.equal(sut.contains(input), false);

          sut.linkingContext = '#dialog-2';
          // select is queried by querySelector()
          // comes from #dialog-1
          assert.equal(sut.contains(select), false);
          assert.equal(sut.contains(input), false);

          sut.linkingContext = '#dialog-3';
          assert.equal(sut.contains(select), false);
          assert.equal(sut.contains(input), true);

          for (const falsyValue of [undefined, false, 0]) {
            sut.linkingContext = falsyValue as any;
            assert.equal(sut.contains(select), true);
            assert.equal(sut.contains(input), true);
          }

          for (const truthyValue of [{}, [], 1, new Date(), function() {/*  */}, Symbol()]) {
            sut.linkingContext = truthyValue as any;
            assert.throws(
              () => {
                assert.equal(sut.contains(select), true);
                assert.equal(sut.contains(input), true);
              },
              undefined,
              `It should have thrown for ${String(truthyValue)}`);
          }
        }
      },
      {
        title: () => `\n\t--> contains() return correct value with mixed string and Element values`,
        template: () =>
          `
            <div class='blur-host'></div>
            <dialog-container id="dialog-1">
              <select id=select-1></select>
            </dialog-container>
            <dialog-container id="dialog-2">
              <input id=input-2>
              <select id=select-2><option></option></select>
            </dialog-container>
            <dialog-container id="dialog-3">
              <input id=input-3>
            </dialog-container>
          `,
        linkedWith: null,
        linkingContext: null,
        blurHost: '.blur-host',
        assertFn: (ctx, host, sut) => {
          const [dialog1, dialog2, dialog3] = Array.from(host.querySelectorAll('dialog-container'));
          const [select1, select2         ] = Array.from(host.querySelectorAll('select'));
          const [         input2,  input3 ] = Array.from(host.querySelectorAll('input'));

          sut.linkedWith = [input2, 'select'];
          sut.linkingContext = dialog2;

          assertContain(sut, [
            [select1, false, '<#dialog2> does not have <#select1>'],
            [input2, true, '<#input2> is linked directly'],
            [select2, true, '<#select2> is in <#dialog2> (linking context)'],
            [input3, false, '<#dialog2> does not have <#input3>'],
            [dialog1, false, '<#dialog2> does not have <#dialog1>'],
            [dialog3, false, '<#dialog2> does not have <#dialog3>'],
          ]);

          sut.linkedWith = [select1, 'input'];
          sut.linkingContext = dialog3;
          assertContain(sut, [
            [select1, true, '<#select1> is linked directly'],
            [select2, false, '<#dialog3> does not have <#select2>'],
            [input2, false, '<#dialog3> does not have <#input2>'],
            [input3, true, '<#input3> is in <#dialog3>']
          ]);

          // it('should work fine with duplicate linkedWith results')
          sut.linkedWith = [select1, 'select', 'select'];
          sut.linkingContext = host;
          assertContain(sut, [
            [select1, true],
            [select2, true],
            [input2, false],
            [input3, false]
          ]);
        }
      }
    ];

    eachCartesianJoin(
      [testCases],
      (testCase) => {
        const { linkedWith, linkingContext, template, title, assertFn, blurHost } = testCase;
        it(title(), function() {
          const ctx = TestContext.createHTMLTestContext();
          const host = ctx.doc.body.appendChild(ctx.createElement('div'));
          host.innerHTML = template();

          const sut = new Blur(
            typeof blurHost === 'string'
              ? host.querySelector(blurHost)
              : blurHost,
            ctx.dom,
            ctx.container.get(ILifecycle)
          );
          sut.linkedWith = linkedWith;
          sut.linkingContext = linkingContext;
          assertFn(ctx, host, sut);
          host.remove();
        });
      }
    );

    interface ILinkingContextTestCase {
      linkedWith: string | Element | (string | Element)[];
      linkingContext: string | Element | null;
      blurHost: string | HTMLElement;
      // tslint:disable:prefer-method-signature
      title: () => string;
      template: () => string;
      assertFn: (ctx: HTMLTestContext, host: HTMLElement, sut: Blur) => void | Promise<void>;
    }
  });
  describe('with [linkedWith] + [linkingContext] + [searchSubTree]', function todo() {/**/});
  describe('with [linkedWith] + [linkingContext] + [searchSubTree] + [linkMultiple]', function todo() {/**/});

  function setup() {
    const ctx = TestContext.createHTMLTestContext();
    const target = ctx.doc.body.appendChild(ctx.createElement('div'));
    const sut = new Blur(target, ctx.dom, ctx.container.get(ILifecycle));
    return { ctx, target, sut };
  }

  function assertContain(sut: Blur, checks: [HTMLElement, boolean, string?][]): void {
    for (const [el, contains, message] of checks) {
      assert.equal(sut.contains(el), contains, `should have been ${contains} as ${message}`);
    }
  }

  interface HasContains {
    contains(el: Element): boolean;
    [x: string]: any;
  }
});

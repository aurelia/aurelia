import { resolve } from '@aurelia/kernel';
import { CustomAttribute, INode } from '@aurelia/runtime-html';
import { assert, createFixture } from '@aurelia/testing';

describe('3-runtime-html/custom-elements.infer-expression.spec.ts', function () {
  it('auto infers binding expression with .bind', function () {
    const { assertHtml, component, flush } = createFixture('<div textcontent.bind>', {
      textcontent: 'hey'
    });
    assertHtml('<div>hey</div>');
    component.textcontent = 'ahh';
    flush();
    assertHtml('<div>ahh</div>');
  });

  it('auto infers binding expression with .one-time', function () {
    const { assertHtml, component, flush } = createFixture('<div textcontent.one-time>', {
      textcontent: 'hey'
    });
    assertHtml('<div>hey</div>');
    component.textcontent = 'ahh';
    flush();
    assertHtml('<div>hey</div>');
  });

  it('auto infers binding expression with .to-view', function () {
    const { assertHtml, component, flush } = createFixture('<div textcontent.to-view>', {
      textcontent: 'hey'
    });
    assertHtml('<div>hey</div>');
    component.textcontent = 'ahh';
    flush();
    assertHtml('<div>ahh</div>');
  });

  it('auto infers binding expression with .two-way', function () {
    const { assertValue, type, component } = createFixture('<input value.two-way>', {
      value: 'hey'
    });
    assertValue('input', 'hey');
    type('input', 'you');
    assert.strictEqual(component.value, 'you');
  });

  it('auto infers binding expression with .from-view', function () {
    const { assertValue, type, component, flush } = createFixture('<input value.from-view>', {
      value: 'hey'
    });
    assertValue('input', '');
    type('input', 'you');
    assert.strictEqual(component.value, 'you');
    component.value = 'ahh';
    flush();
    assertValue('input', 'you');
  });

  it('auto infers binding expression with .attr', function () {
    const { assertHtml } = createFixture('<div hey-there.attr>', {
      'hey-there': 1,
      'heyThere': 2,
    });
    assertHtml('<div hey-there="2"></div>');
  });

  it('does not use mapped attribute name when inferring binding expression', function () {
    const { assertHtml } = createFixture('<input minlength.bind>', {
      minLength: 0,
      minlength: 1,
    });
    assertHtml('<input minlength="1">');
  });

  it('infers expression with custom attribute', function () {
    const { assertHtml } = createFixture('<div square.bind foo-bar.bind>', {
      square: 2,
      fooBar: 3,
    }, [
      CustomAttribute.define('square', class {
        host = resolve(INode) as HTMLElement;
        value: any;
        binding() {
          this.host.setAttribute('square', String(Number(this.value) * Number(this.value)));
        }
      }),
      CustomAttribute.define('foo-bar', class {
        host = resolve(INode) as HTMLElement;
        value: any;
        binding() {
          this.host.setAttribute('random', String(this.value * 10));
        }
      }),
    ]);
    assertHtml('<div square="4" random="30"></div>');
  });
});

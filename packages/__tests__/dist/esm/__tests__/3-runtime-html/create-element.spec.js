import { CustomElement, createElement as sut, } from '@aurelia/runtime-html';
import { _, eachCartesianJoin, eachCartesianJoinFactory, TestContext, assert } from '@aurelia/testing';
describe(`createElement() creates element based on tag`, function () {
    eachCartesianJoin([['div', 'template']], (tag) => {
        describe(`tag=${tag}`, function () {
            it(`translates raw object properties to attributes`, function () {
                const ctx = TestContext.create();
                const actual = sut(ctx.platform, tag, { title: 'asdf', foo: 'bar' });
                const node = actual['node'];
                assert.strictEqual(node.getAttribute('title'), 'asdf', `node.getAttribute('title')`);
                assert.strictEqual(node.getAttribute('foo'), 'bar', `node.getAttribute('foo')`);
                assert.strictEqual(actual['instructions'].length, 0, `actual['instructions'].length`);
                assert.strictEqual(node.getAttribute('class'), null, `node.getAttribute('class')`);
            });
            eachCartesianJoin([[[null, 'null'], [undefined, 'undefined']]], ([props, str]) => {
                it(`can handle ${str} props`, function () {
                    const ctx = TestContext.create();
                    const actual = sut(ctx.platform, tag, props);
                    const node = actual['node'];
                    assert.strictEqual(actual['instructions'].length, 0, `actual['instructions'].length`);
                    assert.strictEqual(node.getAttribute('class'), null, `node.getAttribute('class')`);
                });
            });
            eachCartesianJoin([
                [
                    "rh" /* callBinding */,
                    "rb" /* hydrateAttribute */,
                    "ra" /* hydrateElement */,
                    "rd" /* hydrateLetElement */,
                    "rc" /* hydrateTemplateController */,
                    "rf" /* interpolation */,
                    "rk" /* iteratorBinding */,
                    "ri" /* letBinding */,
                    "rg" /* propertyBinding */,
                    "rj" /* refBinding */,
                    "re" /* setProperty */,
                    "hb" /* listenerBinding */,
                    "he" /* setAttribute */,
                    "hd" /* stylePropertyBinding */,
                    "ha" /* textBinding */
                ]
            ], t => {
                it(`understands targeted instruction type=${t}`, function () {
                    const ctx = TestContext.create();
                    const actual = sut(ctx.platform, tag, { prop: { type: t } });
                    const instruction = actual['instructions'][0][0];
                    const node = actual['node'];
                    assert.strictEqual(actual['instructions'].length, 1, `actual['instructions'].length`);
                    assert.strictEqual(actual['instructions'][0].length, 1, `actual['instructions'][0].length`);
                    assert.strictEqual(instruction.type, t, `instruction.type`);
                    assert.strictEqual(node.getAttribute('class'), 'au', `node.getAttribute('class')`);
                });
            });
            eachCartesianJoinFactory([
                [
                    TestContext.create
                ],
                [
                    _ctx => [['foo', 'bar'], 'foobar'],
                    ctx => [[ctx.createElementFromMarkup('<div>foo</div>'), ctx.createElementFromMarkup('<div>bar</div>')], 'foobar'],
                    ctx => [['foo', ctx.createElementFromMarkup('<div>bar</div>')], 'foobar']
                ],
                [
                    (ctx, [children, expected]) => [children, expected],
                    (ctx, [children, expected]) => [[sut(ctx.platform, 'div', null, ['baz']), ...children], `baz${expected}`],
                    (ctx, [children, expected]) => [[sut(ctx.platform, 'div', null, [ctx.createElementFromMarkup('<div>baz</div>')]), ...children], `baz${expected}`]
                ]
            ], (ctx, $1, [children, expected]) => {
                it(_ `adds children (${children})`, function () {
                    const actual = sut(ctx.platform, tag, null, children);
                    const node = actual['node'];
                    assert.strictEqual(actual['instructions'].length, 0, `actual['instructions'].length`);
                    assert.strictEqual(node.getAttribute('class'), null, `node.getAttribute('class')`);
                    assert.strictEqual(node.textContent, expected, `node.textContent`);
                });
            });
        });
    });
});
describe(`createElement() creates element based on type`, function () {
    eachCartesianJoin([
        [
            () => CustomElement.define({ name: 'foo' }, class Foo {
            }),
            () => CustomElement.define({ name: 'foo', bindables: { foo: {} } }, class Foo {
            })
        ]
    ], (createType) => {
        describe(_ `type=${createType()}`, function () {
            it(`translates raw object properties to attributes`, function () {
                const ctx = TestContext.create();
                const type = createType();
                const definition = CustomElement.getDefinition(type);
                const actual = sut(ctx.platform, type, { title: 'asdf', foo: 'bar' });
                const node = actual['node'];
                const instruction = (actual['instructions'][0][0]);
                assert.strictEqual(node.getAttribute('title'), null, `node.getAttribute('title')`);
                assert.strictEqual(node.getAttribute('foo'), null, `node.getAttribute('foo')`);
                assert.strictEqual(actual['instructions'].length, 1, `actual['instructions'].length`);
                assert.strictEqual(actual['instructions'][0].length, 1, `actual['instructions'][0].length`);
                assert.strictEqual(instruction.type, "ra" /* hydrateElement */, `instruction.type`);
                assert.strictEqual(instruction.res, definition, `instruction.res`);
                assert.strictEqual(instruction.props.length, 2, `instruction.props.length`);
                assert.strictEqual(instruction.props[0].type, "he" /* setAttribute */, `instruction.props[0].type`);
                assert.strictEqual(instruction.props[0]['to'], 'title', `instruction.props[0]['to']`);
                assert.strictEqual(instruction.props[0]['value'], 'asdf', `instruction.props[0]['value']`);
                if (definition.bindables['foo']) {
                    assert.strictEqual(instruction.props[1].type, "re" /* setProperty */, `instruction.props[1].type`);
                }
                else {
                    assert.strictEqual(instruction.props[1].type, "he" /* setAttribute */, `instruction.props[1].type`);
                }
                assert.strictEqual(instruction.props[1]['to'], 'foo', `instruction.props[1]['to']`);
                assert.strictEqual(instruction.props[1]['value'], 'bar', `instruction.props[1]['value']`);
                assert.strictEqual(node.getAttribute('class'), 'au', `node.getAttribute('class')`);
            });
            eachCartesianJoin([[[null, 'null'], [undefined, 'undefined']]], ([props, str]) => {
                it(`can handle ${str} props`, function () {
                    const type = createType();
                    const ctx = TestContext.create();
                    const actual = sut(ctx.platform, type, props);
                    const node = actual['node'];
                    const instruction = (actual['instructions'][0][0]);
                    assert.strictEqual(actual['instructions'].length, 1, `actual['instructions'].length`);
                    assert.strictEqual(actual['instructions'][0].length, 1, `actual['instructions'][0].length`);
                    assert.strictEqual(instruction.props.length, 0, `instruction.props.length`);
                    assert.strictEqual(node.getAttribute('class'), 'au', `node.getAttribute('class')`);
                });
            });
            eachCartesianJoin([
                [
                    "rh" /* callBinding */,
                    "rb" /* hydrateAttribute */,
                    "ra" /* hydrateElement */,
                    "rd" /* hydrateLetElement */,
                    "rc" /* hydrateTemplateController */,
                    "rf" /* interpolation */,
                    "rk" /* iteratorBinding */,
                    "ri" /* letBinding */,
                    "rg" /* propertyBinding */,
                    "rj" /* refBinding */,
                    "re" /* setProperty */,
                    "hb" /* listenerBinding */,
                    "he" /* setAttribute */,
                    "hd" /* stylePropertyBinding */,
                    "ha" /* textBinding */
                ]
            ], t => {
                it(`understands targeted instruction type=${t}`, function () {
                    const type = createType();
                    const definition = CustomElement.getDefinition(type);
                    const ctx = TestContext.create();
                    const actual = sut(ctx.platform, type, { prop: { type: t } });
                    const node = actual['node'];
                    const instruction = (actual['instructions'][0][0]);
                    assert.strictEqual(actual['instructions'].length, 1, `actual['instructions'].length`);
                    assert.strictEqual(actual['instructions'][0].length, 1, `actual['instructions'][0].length`);
                    assert.strictEqual(instruction.type, "ra" /* hydrateElement */, `instruction.type`);
                    assert.strictEqual(instruction.res, definition, `instruction.res`);
                    assert.strictEqual(instruction.props.length, 1, `instruction.props.length`);
                    assert.strictEqual(instruction.props[0].type, t, `instruction.props[0].type`);
                    assert.strictEqual(node.getAttribute('class'), 'au', `node.getAttribute('class')`);
                });
            });
            eachCartesianJoinFactory([
                [
                    TestContext.create
                ],
                [
                    _ctx => [['foo', 'bar'], 'foobar'],
                    ctx => [[ctx.createElementFromMarkup('<div>foo</div>'), ctx.createElementFromMarkup('<div>bar</div>')], 'foobar'],
                    ctx => [['foo', ctx.createElementFromMarkup('<div>bar</div>')], 'foobar']
                ],
                [
                    (ctx, [children, expected]) => [children, expected],
                    (ctx, [children, expected]) => [[sut(ctx.platform, 'div', null, ['baz']), ...children], `baz${expected}`],
                    (ctx, [children, expected]) => [[sut(ctx.platform, 'div', null, [ctx.createElementFromMarkup('<div>baz</div>')]), ...children], `baz${expected}`]
                ]
            ], (ctx, $1, [children, expected]) => {
                it(_ `adds children (${children})`, function () {
                    const type = createType();
                    const definition = CustomElement.getDefinition(type);
                    const actual = sut(ctx.platform, type, null, children);
                    const node = actual['node'];
                    const instruction = (actual['instructions'][0][0]);
                    assert.strictEqual(actual['instructions'].length, 1, `actual['instructions'].length`);
                    assert.strictEqual(actual['instructions'][0].length, 1, `actual['instructions'][0].length`);
                    assert.strictEqual(instruction.type, "ra" /* hydrateElement */, `instruction.type`);
                    assert.strictEqual(instruction.res, definition, `instruction.res`);
                    assert.strictEqual(instruction.props.length, 0, `instruction.props.length`);
                    assert.strictEqual(node.getAttribute('class'), 'au', `node.getAttribute('class')`);
                    assert.strictEqual(node.textContent, expected, `node.textContent`);
                });
            });
        });
    });
});
//# sourceMappingURL=create-element.spec.js.map
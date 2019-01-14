import { Profiler } from '@aurelia/kernel';
import { Aurelia, CustomElementResource } from '@aurelia/runtime';
import { expect } from 'chai';
import { getVisibleText, TestContext, writeProfilerReport } from '../util';

describe('generated.template-compiler.static', function () {
    before(function () {
        Profiler.enable();
    });
    after(function () {
        Profiler.disable();
        writeProfilerReport('static');
    });
    function setup() {
        const ctx = TestContext.createHTMLTestContext();
        const au = new Aurelia(ctx.container);
        const host = ctx.createElement('div');
        return { au, host };
    }
    function verify(au, host, expected) {
        au.start();
        const outerHtmlAfterStart1 = host.outerHTML;
        expect(getVisibleText(au, host)).to.equal(expected, 'after start #1');
        au.stop();
        const outerHtmlAfterStop1 = host.outerHTML;
        expect(getVisibleText(au, host)).to.equal('', 'after stop #1');
        au.start();
        const outerHtmlAfterStart2 = host.outerHTML;
        expect(getVisibleText(au, host)).to.equal(expected, 'after start #2');
        au.stop();
        const outerHtmlAfterStop2 = host.outerHTML;
        expect(getVisibleText(au, host)).to.equal('', 'after stop #2');
        expect(outerHtmlAfterStart1).to.equal(outerHtmlAfterStart2, 'outerHTML after start #1 / #2');
        expect(outerHtmlAfterStop1).to.equal(outerHtmlAfterStop2, 'outerHTML after stop #1 / #2');
    }
    it('tag$01 text$01 _', function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: 'app', template: '<template><div>a</div></template>' }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, 'a');
    });
    it('tag$01 text$03 _', function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: 'app', template: '<template><div>${msg}</div></template>' }, class {
            public msg = 'a';
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, 'a');
    });
    it('tag$02 text$01 _', function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: 'app', template: '<template>a</template>' }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, 'a');
    });
    it('tag$02 text$03 _', function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: 'app', template: '<template>${msg}</template>' }, class {
            public msg = 'a';
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, 'a');
    });
    it('tag$03 text$03 _', function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: 'my-foo', template: '<template>${msg}</template>' }, class {
            public static bindables = { msg: { property: 'msg', attribute: 'msg' }, not: { property: 'not', attribute: 'not' }, item: { property: 'item', attribute: 'item' } };
            public msg = '';
            public not = '';
            public item = '';
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: 'app', template: '<template><my-foo msg.bind="msg"></my-foo></template>' }, class {
            public msg = 'a';
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, 'a');
    });
    it('tag$04 text$03 _', function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: 'my-foo', template: '<template><template replaceable part="part1"></template><template replaceable part="part2"></template></template>' }, class {
            public static bindables = { msg: { property: 'msg', attribute: 'msg' }, not: { property: 'not', attribute: 'not' }, item: { property: 'item', attribute: 'item' } };
            public msg = '';
            public not = '';
            public item = '';
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: 'app', template: '<template><my-foo msg.bind="msg"><template replace-part="part1">${msg}</template></my-foo></template>' }, class {
            public msg = 'a';
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, 'a');
    });
    it('tag$05 text$03 _', function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: 'my-foo', template: '<template>${msg}</template>' }, class {
            public static bindables = { msg: { property: 'msg', attribute: 'msg' }, not: { property: 'not', attribute: 'not' }, item: { property: 'item', attribute: 'item' } };
            public static containerless = true;
            public msg = '';
            public not = '';
            public item = '';
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: 'app', template: '<template><my-foo msg.bind="msg"></my-foo></template>' }, class {
            public msg = 'a';
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, 'a');
    });
    it('tag$06 text$03 _', function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: 'my-foo', template: '<template><template replaceable part="part1"></template><template replaceable part="part2"></template></template>' }, class {
            public static bindables = { msg: { property: 'msg', attribute: 'msg' }, not: { property: 'not', attribute: 'not' }, item: { property: 'item', attribute: 'item' } };
            public static containerless = true;
            public msg = '';
            public not = '';
            public item = '';
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: 'app', template: '<template><my-foo msg.bind="msg"><template replace-part="part1">${msg}</template></my-foo></template>' }, class {
            public msg = 'a';
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, 'a');
    });
    it('tag$07 text$03 _', function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: 'my-foo', template: '<template>${msg}</template>' }, class {
            public static bindables = { msg: { property: 'msg', attribute: 'msg' }, not: { property: 'not', attribute: 'not' }, item: { property: 'item', attribute: 'item' } };
            public static shadowOptions = { mode: 'open' };
            public msg = '';
            public not = '';
            public item = '';
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: 'app', template: '<template><my-foo msg.bind="msg"></my-foo></template>' }, class {
            public msg = 'a';
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, 'a');
    });
    it('tag$08 text$03 _', function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: 'my-foo', template: '<template><template replaceable part="part1"></template><template replaceable part="part2"></template></template>' }, class {
            public static bindables = { msg: { property: 'msg', attribute: 'msg' }, not: { property: 'not', attribute: 'not' }, item: { property: 'item', attribute: 'item' } };
            public static shadowOptions = { mode: 'open' };
            public msg = '';
            public not = '';
            public item = '';
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: 'app', template: '<template><my-foo msg.bind="msg"><template replace-part="part1">${msg}</template></my-foo></template>' }, class {
            public msg = 'a';
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, 'a');
    });
    it('tag$09 text$03 _', function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: 'my-foo', template: '<template>${msg}</template>' }, class {
            public static bindables = { msg: { property: 'msg', attribute: 'msg' }, not: { property: 'not', attribute: 'not' }, item: { property: 'item', attribute: 'item' } };
            public static shadowOptions = { mode: 'closed' };
            public msg = '';
            public not = '';
            public item = '';
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: 'app', template: '<template><my-foo msg.bind="msg"></my-foo></template>' }, class {
            public msg = 'a';
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, 'a');
    });
    it('tag$10 text$03 _', function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: 'my-foo', template: '<template><template replaceable part="part1"></template><template replaceable part="part2"></template></template>' }, class {
            public static bindables = { msg: { property: 'msg', attribute: 'msg' }, not: { property: 'not', attribute: 'not' }, item: { property: 'item', attribute: 'item' } };
            public static shadowOptions = { mode: 'closed' };
            public msg = '';
            public not = '';
            public item = '';
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: 'app', template: '<template><my-foo msg.bind="msg"><template replace-part="part1">${msg}</template></my-foo></template>' }, class {
            public msg = 'a';
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, 'a');
    });
});

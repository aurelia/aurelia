import { expect } from "chai";
import { DI } from "../../../kernel/src/index";
import { CustomElementResource, DOM, Aurelia } from "../../../runtime/src/index";
import { BasicConfiguration } from "../../src/index";

describe.only("template-compiler.generated", function template_compiler_generated() {
    function setup() {
        const container = DI.createContainer();
        container.register(BasicConfiguration);
        const au = new Aurelia(container);
        const host = DOM.createElement("div");
        return { au, host };
    }
    describe("$01$xxx template=\"a\", notTemplate=b (div)", function $01$xxx_template__a___notTemplate_b__div_() {
        it("$01$001 \"a\"", function $01$001__a_() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div>a</div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$01$101 div.if.true > \"a\"", function $01$101_div_if_true____a_() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\">a</div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$01$102 (div.if.false > \"\") + (div.else > \"a\")", function $01$102__div_if_false__________div_else____a__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"false\"></div><div else>a</div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$01$103 div.if.true +> div.repeat x3 > \"a\"", function $01$103_div_if_true____div_repeat_x3____a_() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\" repeat.for=\"i of 3\">a</div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$01$104 (div.if.false > \"\") + (div.else +> div.repeat x3 > \"a\")", function $01$104__div_if_false__________div_else____div_repeat_x3____a__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"false\"></div><div else repeat.for=\"i of 3\">a</div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$01$105 div.repeat x3 +> div.if.true > \"a\"", function $01$105_div_repeat_x3____div_if_true____a_() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div repeat.for=\"i of 3\" if.bind=\"true\">a</div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$01$106 div.repeat x3 > div.if.true > \"a\"", function $01$106_div_repeat_x3___div_if_true____a_() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div repeat.for=\"i of 3\"><div if.bind=\"true\">a</div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$01$107 (div.if.false > \"\") + (div.else)", function $01$107__div_if_false__________div_else_() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div repeat.for=\"i of 3\"><div if.bind=\"false\"></div><div else>a</div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$01$121 div.if.true > div.if.true > \"a\"", function $01$121_div_if_true___div_if_true____a_() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\"><div if.bind=\"true\">a</div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$01$123 div.if.true > (div.if.false > \"\") : (div.else > \"a\")", function $01$123_div_if_true____div_if_false__________div_else____a__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\"><div if.bind=\"false\"></div><div else>a</div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$01$125 div.else > div.else > \"a\"", function $01$125_div_else___div_else____a_() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"false\"></div><div else><div if.bind=\"false\"></div><div else>a</div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$01$127 (div.if.false > \"\") + (div.else > div.if.true > \"a\")", function $01$127__div_if_false__________div_else___div_if_true____a__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"false\"></div><div else><div if.bind=\"true\">a</div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$01$128 (div.if.false > \"\") + (div.else +> div.if.true > \"a\")", function $01$128__div_if_false__________div_else____div_if_true____a__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"false\"></div><div else if.bind=\"true\">a</div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$01$141 div.repeat x3 > (div.if.true > div.if.true > \"a\")", function $01$141_div_repeat_x3____div_if_true___div_if_true____a__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div repeat.for=\"i of 3\"><div if.bind=\"true\"><div if.bind=\"true\">a</div></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$01$143 div.repeat x3 > (div.if.true > (div.if.false > \"\") : (div.else > \"a\"))", function $01$143_div_repeat_x3____div_if_true____div_if_false__________div_else____a___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div repeat.for=\"i of 3\"><div if.bind=\"true\"><div if.bind=\"false\"></div><div else>a</div></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$01$145 div.repeat x3 > (div.else > div.else > \"a\")", function $01$145_div_repeat_x3____div_else___div_else____a__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div repeat.for=\"i of 3\"><div if.bind=\"false\"></div><div else><div if.bind=\"false\"></div><div else>a</div></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$01$147 div.repeat x3 > ((div.if.false > \"\") + (div.else > div.if.true > \"a\"))", function $01$147_div_repeat_x3_____div_if_false__________div_else___div_if_true____a___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div repeat.for=\"i of 3\"><div if.bind=\"false\"></div><div else><div if.bind=\"true\">a</div></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$01$148 div.repeat x3 > ((div.if.false > \"\") + (div.else +> div.if.true > \"a\"))", function $01$148_div_repeat_x3_____div_if_false__________div_else____div_if_true____a___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div repeat.for=\"i of 3\"><div if.bind=\"false\"></div><div else if.bind=\"true\">a</div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$01$161 div.repeat x3 +> (div.if.true > div.if.true > \"a\")", function $01$161_div_repeat_x3_____div_if_true___div_if_true____a__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div repeat.for=\"i of 3\" if.bind=\"true\"><div if.bind=\"true\">a</div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$01$162 div.if.true +> (div.repeat x3 > div.if.true > \"a\")", function $01$162_div_if_true_____div_repeat_x3___div_if_true____a__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\" repeat.for=\"i of 3\"><div if.bind=\"true\">a</div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$01$163 div.if.true > (div.repeat x3 +> (div.if.true > \"a\"))", function $01$163_div_if_true____div_repeat_x3_____div_if_true____a___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\"><div repeat.for=\"i of 3\" if.bind=\"true\">a</div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$01$164 div.if.true +> (div.if.true +> div.repeat x3 > \"a\")", function $01$164_div_if_true_____div_if_true____div_repeat_x3____a__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\"><div if.bind=\"true\" repeat.for=\"i of 3\">a</div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$01$165 div.repeat x3 +> (div.if.true > (div.repeat x3 +> (div.if.true > \"a\")))", function $01$165_div_repeat_x3_____div_if_true____div_repeat_x3_____div_if_true____a____() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div repeat.for=\"i of 3\" if.bind=\"true\"><div repeat.for=\"i of 3\" if.bind=\"true\">a</div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$01$166 div.if.true +> (div.repeat x3 > (div.repeat x3 +> (div.if.true > \"a\")))", function $01$166_div_if_true_____div_repeat_x3____div_repeat_x3_____div_if_true____a____() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\" repeat.for=\"i of 3\"><div repeat.for=\"i of 3\" if.bind=\"true\">a</div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$01$167 div.repeat x3 +> (div.if.true > (div.if.true +> div.repeat x3 > \"a\"))", function $01$167_div_repeat_x3_____div_if_true____div_if_true____div_repeat_x3____a___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div repeat.for=\"i of 3\" if.bind=\"true\"><div if.bind=\"true\" repeat.for=\"i of 3\">a</div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$01$168 div.if.true +> (div.repeat x3 > (div.if.true +> div.repeat x3 > \"a\"))", function $01$168_div_if_true_____div_repeat_x3____div_if_true____div_repeat_x3____a___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\" repeat.for=\"i of 3\"><div if.bind=\"true\" repeat.for=\"i of 3\">a</div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$01$201 (div.if.true > \"a\") + (else > \"b\")", function $01$201__div_if_true____a______else____b__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\">a</div><div else>b</div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$01$202 (div.if.false > \"b\") + (div.else > \"a\")", function $01$202__div_if_false____b______div_else____a__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"false\">b</div><div else>a</div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$01$221 div.if.true > ((div.if.true > \"a\") + (else > \"b\"))", function $01$221_div_if_true_____div_if_true____a______else____b___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\"><div if.bind=\"true\">a</div><div else>b</div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$01$222 (div.if.true > ((div.if.true > \"a\") + (else > \"b\"))) + (else > \"b\")", function $01$222__div_if_true_____div_if_true____a______else____b________else____b__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\"><div if.bind=\"true\">a</div><div else>b</div></div><div else>b</div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$01$223 div.if.true > ((div.if.false > \"b\") + (else > \"a\"))", function $01$223_div_if_true_____div_if_false____b______else____a___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\"><div if.bind=\"false\">b</div><div else>a</div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$01$224 (div.if.true > ((div.if.false > \"b\") + (else > \"a\"))) + (else > \"b\")", function $01$224__div_if_true_____div_if_false____b______else____a________else____b__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\"><div if.bind=\"false\">b</div><div else>a</div></div><div else>b</div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$01$225 (div.if.false > \"\") + (div.else > (if.bind=\"false\" > \"b\") + (div.else > \"a\"))", function $01$225__div_if_false__________div_else____if_bind__false_____b______div_else____a___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"false\"></div><div else><div if.bind=\"false\">b</div><div else>a</div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$01$226 (div.if.false > \"b\") + (div.else > (if.bind=\"false\" > \"b\") + (div.else > \"a\"))", function $01$226__div_if_false____b______div_else____if_bind__false_____b______div_else____a___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"false\">b</div><div else><div if.bind=\"false\">b</div><div else>a</div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$01$227 (div.if.false > \"b\") + (div.else > (if.bind=\"true\" > \"a\"))", function $01$227__div_if_false____b______div_else____if_bind__true_____a___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"false\">b</div><div else><div if.bind=\"true\">a</div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$01$228 (div.if.false > \"b\") + (div.else +> div.if.true > \"a\")", function $01$228__div_if_false____b______div_else____div_if_true____a__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"false\">b</div><div else if.bind=\"true\">a</div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
    });
    describe("$02$xxx template=\"a\", notTemplate=${notMsg} (div)", function $02$xxx_template__a___notTemplate_$_notMsg___div_() {
        it("$02$201 (div.if.true > \"a\") + (else > ${notMsg})", function $02$201__div_if_true____a______else___$_notMsg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\">a</div><div else>${notMsg}</div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$02$202 (div.if.false > ${notMsg}) + (div.else > \"a\")", function $02$202__div_if_false___$_notMsg______div_else____a__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"false\">${notMsg}</div><div else>a</div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$02$221 div.if.true > ((div.if.true > \"a\") + (else > ${notMsg}))", function $02$221_div_if_true_____div_if_true____a______else___$_notMsg___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\"><div if.bind=\"true\">a</div><div else>${notMsg}</div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$02$222 (div.if.true > ((div.if.true > \"a\") + (else > ${notMsg}))) + (else > ${notMsg})", function $02$222__div_if_true_____div_if_true____a______else___$_notMsg________else___$_notMsg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\"><div if.bind=\"true\">a</div><div else>${notMsg}</div></div><div else>${notMsg}</div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$02$223 div.if.true > ((div.if.false > ${notMsg}) + (else > \"a\"))", function $02$223_div_if_true_____div_if_false___$_notMsg______else____a___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\"><div if.bind=\"false\">${notMsg}</div><div else>a</div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$02$224 (div.if.true > ((div.if.false > ${notMsg}) + (else > \"a\"))) + (else > ${notMsg})", function $02$224__div_if_true_____div_if_false___$_notMsg______else____a________else___$_notMsg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\"><div if.bind=\"false\">${notMsg}</div><div else>a</div></div><div else>${notMsg}</div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$02$225 (div.if.false > \"\") + (div.else > (if.bind=\"false\" > ${notMsg}) + (div.else > \"a\"))", function $02$225__div_if_false__________div_else____if_bind__false____$_notMsg______div_else____a___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"false\"></div><div else><div if.bind=\"false\">${notMsg}</div><div else>a</div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$02$226 (div.if.false > ${notMsg}) + (div.else > (if.bind=\"false\" > ${notMsg}) + (div.else > \"a\"))", function $02$226__div_if_false___$_notMsg______div_else____if_bind__false____$_notMsg______div_else____a___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"false\">${notMsg}</div><div else><div if.bind=\"false\">${notMsg}</div><div else>a</div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$02$227 (div.if.false > ${notMsg}) + (div.else > (if.bind=\"true\" > \"a\"))", function $02$227__div_if_false___$_notMsg______div_else____if_bind__true_____a___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"false\">${notMsg}</div><div else><div if.bind=\"true\">a</div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$02$228 (div.if.false > ${notMsg}) + (div.else +> div.if.true > \"a\")", function $02$228__div_if_false___$_notMsg______div_else____div_if_true____a__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"false\">${notMsg}</div><div else if.bind=\"true\">a</div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
    });
    describe("$03$xxx template=${msg}, notTemplate=b (div)", function $03$xxx_template_$_msg___notTemplate_b__div_() {
        it("$03$001 ${msg}", function $03$001_$_msg_() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div>${msg}</div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$03$101 div.if.true > ${msg}", function $03$101_div_if_true___$_msg_() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\">${msg}</div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$03$102 (div.if.false > \"\") + (div.else > ${msg})", function $03$102__div_if_false__________div_else___$_msg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"false\"></div><div else>${msg}</div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$03$103 div.if.true +> div.repeat x3 > ${msg}", function $03$103_div_if_true____div_repeat_x3___$_msg_() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\" repeat.for=\"i of 3\">${msg}</div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$03$104 (div.if.false > \"\") + (div.else +> div.repeat x3 > ${msg})", function $03$104__div_if_false__________div_else____div_repeat_x3___$_msg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"false\"></div><div else repeat.for=\"i of 3\">${msg}</div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$03$105 div.repeat x3 +> div.if.true > ${msg}", function $03$105_div_repeat_x3____div_if_true___$_msg_() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div repeat.for=\"i of 3\" if.bind=\"true\">${msg}</div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$03$106 div.repeat x3 > div.if.true > ${msg}", function $03$106_div_repeat_x3___div_if_true___$_msg_() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div repeat.for=\"i of 3\"><div if.bind=\"true\">${msg}</div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$03$107 (div.if.false > \"\") + (div.else)", function $03$107__div_if_false__________div_else_() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div repeat.for=\"i of 3\"><div if.bind=\"false\"></div><div else>${msg}</div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$03$121 div.if.true > div.if.true > ${msg}", function $03$121_div_if_true___div_if_true___$_msg_() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\"><div if.bind=\"true\">${msg}</div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$03$123 div.if.true > (div.if.false > \"\") : (div.else > ${msg})", function $03$123_div_if_true____div_if_false__________div_else___$_msg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\"><div if.bind=\"false\"></div><div else>${msg}</div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$03$125 div.else > div.else > ${msg}", function $03$125_div_else___div_else___$_msg_() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"false\"></div><div else><div if.bind=\"false\"></div><div else>${msg}</div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$03$127 (div.if.false > \"\") + (div.else > div.if.true > ${msg})", function $03$127__div_if_false__________div_else___div_if_true___$_msg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"false\"></div><div else><div if.bind=\"true\">${msg}</div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$03$128 (div.if.false > \"\") + (div.else +> div.if.true > ${msg})", function $03$128__div_if_false__________div_else____div_if_true___$_msg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"false\"></div><div else if.bind=\"true\">${msg}</div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$03$141 div.repeat x3 > (div.if.true > div.if.true > ${msg})", function $03$141_div_repeat_x3____div_if_true___div_if_true___$_msg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div repeat.for=\"i of 3\"><div if.bind=\"true\"><div if.bind=\"true\">${msg}</div></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$03$143 div.repeat x3 > (div.if.true > (div.if.false > \"\") : (div.else > ${msg}))", function $03$143_div_repeat_x3____div_if_true____div_if_false__________div_else___$_msg___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div repeat.for=\"i of 3\"><div if.bind=\"true\"><div if.bind=\"false\"></div><div else>${msg}</div></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$03$145 div.repeat x3 > (div.else > div.else > ${msg})", function $03$145_div_repeat_x3____div_else___div_else___$_msg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div repeat.for=\"i of 3\"><div if.bind=\"false\"></div><div else><div if.bind=\"false\"></div><div else>${msg}</div></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$03$147 div.repeat x3 > ((div.if.false > \"\") + (div.else > div.if.true > ${msg}))", function $03$147_div_repeat_x3_____div_if_false__________div_else___div_if_true___$_msg___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div repeat.for=\"i of 3\"><div if.bind=\"false\"></div><div else><div if.bind=\"true\">${msg}</div></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$03$148 div.repeat x3 > ((div.if.false > \"\") + (div.else +> div.if.true > ${msg}))", function $03$148_div_repeat_x3_____div_if_false__________div_else____div_if_true___$_msg___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div repeat.for=\"i of 3\"><div if.bind=\"false\"></div><div else if.bind=\"true\">${msg}</div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$03$161 div.repeat x3 +> (div.if.true > div.if.true > ${msg})", function $03$161_div_repeat_x3_____div_if_true___div_if_true___$_msg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div repeat.for=\"i of 3\" if.bind=\"true\"><div if.bind=\"true\">${msg}</div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$03$162 div.if.true +> (div.repeat x3 > div.if.true > ${msg})", function $03$162_div_if_true_____div_repeat_x3___div_if_true___$_msg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\" repeat.for=\"i of 3\"><div if.bind=\"true\">${msg}</div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$03$163 div.if.true > (div.repeat x3 +> (div.if.true > ${msg}))", function $03$163_div_if_true____div_repeat_x3_____div_if_true___$_msg___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\"><div repeat.for=\"i of 3\" if.bind=\"true\">${msg}</div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$03$164 div.if.true +> (div.if.true +> div.repeat x3 > ${msg})", function $03$164_div_if_true_____div_if_true____div_repeat_x3___$_msg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\"><div if.bind=\"true\" repeat.for=\"i of 3\">${msg}</div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$03$165 div.repeat x3 +> (div.if.true > (div.repeat x3 +> (div.if.true > ${msg})))", function $03$165_div_repeat_x3_____div_if_true____div_repeat_x3_____div_if_true___$_msg____() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div repeat.for=\"i of 3\" if.bind=\"true\"><div repeat.for=\"i of 3\" if.bind=\"true\">${msg}</div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$03$166 div.if.true +> (div.repeat x3 > (div.repeat x3 +> (div.if.true > ${msg})))", function $03$166_div_if_true_____div_repeat_x3____div_repeat_x3_____div_if_true___$_msg____() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\" repeat.for=\"i of 3\"><div repeat.for=\"i of 3\" if.bind=\"true\">${msg}</div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$03$167 div.repeat x3 +> (div.if.true > (div.if.true +> div.repeat x3 > ${msg}))", function $03$167_div_repeat_x3_____div_if_true____div_if_true____div_repeat_x3___$_msg___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div repeat.for=\"i of 3\" if.bind=\"true\"><div if.bind=\"true\" repeat.for=\"i of 3\">${msg}</div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$03$168 div.if.true +> (div.repeat x3 > (div.if.true +> div.repeat x3 > ${msg}))", function $03$168_div_if_true_____div_repeat_x3____div_if_true____div_repeat_x3___$_msg___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\" repeat.for=\"i of 3\"><div if.bind=\"true\" repeat.for=\"i of 3\">${msg}</div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$03$201 (div.if.true > ${msg}) + (else > \"b\")", function $03$201__div_if_true___$_msg______else____b__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\">${msg}</div><div else>b</div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$03$202 (div.if.false > \"b\") + (div.else > ${msg})", function $03$202__div_if_false____b______div_else___$_msg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"false\">b</div><div else>${msg}</div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$03$221 div.if.true > ((div.if.true > ${msg}) + (else > \"b\"))", function $03$221_div_if_true_____div_if_true___$_msg______else____b___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\"><div if.bind=\"true\">${msg}</div><div else>b</div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$03$222 (div.if.true > ((div.if.true > ${msg}) + (else > \"b\"))) + (else > \"b\")", function $03$222__div_if_true_____div_if_true___$_msg______else____b________else____b__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\"><div if.bind=\"true\">${msg}</div><div else>b</div></div><div else>b</div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$03$223 div.if.true > ((div.if.false > \"b\") + (else > ${msg}))", function $03$223_div_if_true_____div_if_false____b______else___$_msg___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\"><div if.bind=\"false\">b</div><div else>${msg}</div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$03$224 (div.if.true > ((div.if.false > \"b\") + (else > ${msg}))) + (else > \"b\")", function $03$224__div_if_true_____div_if_false____b______else___$_msg________else____b__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\"><div if.bind=\"false\">b</div><div else>${msg}</div></div><div else>b</div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$03$225 (div.if.false > \"\") + (div.else > (if.bind=\"false\" > \"b\") + (div.else > ${msg}))", function $03$225__div_if_false__________div_else____if_bind__false_____b______div_else___$_msg___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"false\"></div><div else><div if.bind=\"false\">b</div><div else>${msg}</div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$03$226 (div.if.false > \"b\") + (div.else > (if.bind=\"false\" > \"b\") + (div.else > ${msg}))", function $03$226__div_if_false____b______div_else____if_bind__false_____b______div_else___$_msg___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"false\">b</div><div else><div if.bind=\"false\">b</div><div else>${msg}</div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$03$227 (div.if.false > \"b\") + (div.else > (if.bind=\"true\" > ${msg}))", function $03$227__div_if_false____b______div_else____if_bind__true____$_msg___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"false\">b</div><div else><div if.bind=\"true\">${msg}</div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$03$228 (div.if.false > \"b\") + (div.else +> div.if.true > ${msg})", function $03$228__div_if_false____b______div_else____div_if_true___$_msg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"false\">b</div><div else if.bind=\"true\">${msg}</div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
    });
    describe("$04$xxx template=${msg}, notTemplate=${notMsg} (div)", function $04$xxx_template_$_msg___notTemplate_$_notMsg___div_() {
        it("$04$201 (div.if.true > ${msg}) + (else > ${notMsg})", function $04$201__div_if_true___$_msg______else___$_notMsg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\">${msg}</div><div else>${notMsg}</div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$04$202 (div.if.false > ${notMsg}) + (div.else > ${msg})", function $04$202__div_if_false___$_notMsg______div_else___$_msg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"false\">${notMsg}</div><div else>${msg}</div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$04$221 div.if.true > ((div.if.true > ${msg}) + (else > ${notMsg}))", function $04$221_div_if_true_____div_if_true___$_msg______else___$_notMsg___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\"><div if.bind=\"true\">${msg}</div><div else>${notMsg}</div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$04$222 (div.if.true > ((div.if.true > ${msg}) + (else > ${notMsg}))) + (else > ${notMsg})", function $04$222__div_if_true_____div_if_true___$_msg______else___$_notMsg________else___$_notMsg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\"><div if.bind=\"true\">${msg}</div><div else>${notMsg}</div></div><div else>${notMsg}</div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$04$223 div.if.true > ((div.if.false > ${notMsg}) + (else > ${msg}))", function $04$223_div_if_true_____div_if_false___$_notMsg______else___$_msg___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\"><div if.bind=\"false\">${notMsg}</div><div else>${msg}</div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$04$224 (div.if.true > ((div.if.false > ${notMsg}) + (else > ${msg}))) + (else > ${notMsg})", function $04$224__div_if_true_____div_if_false___$_notMsg______else___$_msg________else___$_notMsg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\"><div if.bind=\"false\">${notMsg}</div><div else>${msg}</div></div><div else>${notMsg}</div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$04$225 (div.if.false > \"\") + (div.else > (if.bind=\"false\" > ${notMsg}) + (div.else > ${msg}))", function $04$225__div_if_false__________div_else____if_bind__false____$_notMsg______div_else___$_msg___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"false\"></div><div else><div if.bind=\"false\">${notMsg}</div><div else>${msg}</div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$04$226 (div.if.false > ${notMsg}) + (div.else > (if.bind=\"false\" > ${notMsg}) + (div.else > ${msg}))", function $04$226__div_if_false___$_notMsg______div_else____if_bind__false____$_notMsg______div_else___$_msg___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"false\">${notMsg}</div><div else><div if.bind=\"false\">${notMsg}</div><div else>${msg}</div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$04$227 (div.if.false > ${notMsg}) + (div.else > (if.bind=\"true\" > ${msg}))", function $04$227__div_if_false___$_notMsg______div_else____if_bind__true____$_msg___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"false\">${notMsg}</div><div else><div if.bind=\"true\">${msg}</div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$04$228 (div.if.false > ${notMsg}) + (div.else +> div.if.true > ${msg})", function $04$228__div_if_false___$_notMsg______div_else____div_if_true___$_msg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"false\">${notMsg}</div><div else if.bind=\"true\">${msg}</div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
    });
    describe("$05$xxx template=div.repeat x3 > \"a\", notTemplate=<div repeat.for=\"i of 3\">b</div> (div)", function $05$xxx_template_div_repeat_x3____a___notTemplate__div_repeat_for__i_of_3__b__div___div_() {
        it("$05$001 div.repeat x3 > \"a\"", function $05$001_div_repeat_x3____a_() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div repeat.for=\"i of 3\">a</div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$05$101 div.if.true > div.repeat x3 > \"a\"", function $05$101_div_if_true___div_repeat_x3____a_() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\"><div repeat.for=\"i of 3\">a</div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$05$102 (div.if.false > \"\") + (div.else > div.repeat x3 > \"a\")", function $05$102__div_if_false__________div_else___div_repeat_x3____a__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"false\"></div><div else><div repeat.for=\"i of 3\">a</div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$05$103 div.if.true +> div.repeat x3 > div.repeat x3 > \"a\"", function $05$103_div_if_true____div_repeat_x3___div_repeat_x3____a_() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\" repeat.for=\"i of 3\"><div repeat.for=\"i of 3\">a</div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$05$104 (div.if.false > \"\") + (div.else +> div.repeat x3 > div.repeat x3 > \"a\")", function $05$104__div_if_false__________div_else____div_repeat_x3___div_repeat_x3____a__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"false\"></div><div else repeat.for=\"i of 3\"><div repeat.for=\"i of 3\">a</div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$05$105 div.repeat x3 +> div.if.true > div.repeat x3 > \"a\"", function $05$105_div_repeat_x3____div_if_true___div_repeat_x3____a_() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div repeat.for=\"i of 3\" if.bind=\"true\"><div repeat.for=\"i of 3\">a</div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$05$106 div.repeat x3 > div.if.true > div.repeat x3 > \"a\"", function $05$106_div_repeat_x3___div_if_true___div_repeat_x3____a_() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div repeat.for=\"i of 3\"><div if.bind=\"true\"><div repeat.for=\"i of 3\">a</div></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$05$107 (div.if.false > \"\") + (div.else)", function $05$107__div_if_false__________div_else_() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div repeat.for=\"i of 3\"><div if.bind=\"false\"></div><div else><div repeat.for=\"i of 3\">a</div></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$05$121 div.if.true > div.if.true > div.repeat x3 > \"a\"", function $05$121_div_if_true___div_if_true___div_repeat_x3____a_() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\"><div if.bind=\"true\"><div repeat.for=\"i of 3\">a</div></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$05$123 div.if.true > (div.if.false > \"\") : (div.else > div.repeat x3 > \"a\")", function $05$123_div_if_true____div_if_false__________div_else___div_repeat_x3____a__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\"><div if.bind=\"false\"></div><div else><div repeat.for=\"i of 3\">a</div></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$05$125 div.else > div.else > div.repeat x3 > \"a\"", function $05$125_div_else___div_else___div_repeat_x3____a_() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"false\"></div><div else><div if.bind=\"false\"></div><div else><div repeat.for=\"i of 3\">a</div></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$05$127 (div.if.false > \"\") + (div.else > div.if.true > div.repeat x3 > \"a\")", function $05$127__div_if_false__________div_else___div_if_true___div_repeat_x3____a__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"false\"></div><div else><div if.bind=\"true\"><div repeat.for=\"i of 3\">a</div></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$05$128 (div.if.false > \"\") + (div.else +> div.if.true > div.repeat x3 > \"a\")", function $05$128__div_if_false__________div_else____div_if_true___div_repeat_x3____a__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"false\"></div><div else if.bind=\"true\"><div repeat.for=\"i of 3\">a</div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$05$141 div.repeat x3 > (div.if.true > div.if.true > div.repeat x3 > \"a\")", function $05$141_div_repeat_x3____div_if_true___div_if_true___div_repeat_x3____a__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div repeat.for=\"i of 3\"><div if.bind=\"true\"><div if.bind=\"true\"><div repeat.for=\"i of 3\">a</div></div></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$05$143 div.repeat x3 > (div.if.true > (div.if.false > \"\") : (div.else > div.repeat x3 > \"a\"))", function $05$143_div_repeat_x3____div_if_true____div_if_false__________div_else___div_repeat_x3____a___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div repeat.for=\"i of 3\"><div if.bind=\"true\"><div if.bind=\"false\"></div><div else><div repeat.for=\"i of 3\">a</div></div></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$05$145 div.repeat x3 > (div.else > div.else > div.repeat x3 > \"a\")", function $05$145_div_repeat_x3____div_else___div_else___div_repeat_x3____a__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div repeat.for=\"i of 3\"><div if.bind=\"false\"></div><div else><div if.bind=\"false\"></div><div else><div repeat.for=\"i of 3\">a</div></div></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$05$147 div.repeat x3 > ((div.if.false > \"\") + (div.else > div.if.true > div.repeat x3 > \"a\"))", function $05$147_div_repeat_x3_____div_if_false__________div_else___div_if_true___div_repeat_x3____a___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div repeat.for=\"i of 3\"><div if.bind=\"false\"></div><div else><div if.bind=\"true\"><div repeat.for=\"i of 3\">a</div></div></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$05$148 div.repeat x3 > ((div.if.false > \"\") + (div.else +> div.if.true > div.repeat x3 > \"a\"))", function $05$148_div_repeat_x3_____div_if_false__________div_else____div_if_true___div_repeat_x3____a___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div repeat.for=\"i of 3\"><div if.bind=\"false\"></div><div else if.bind=\"true\"><div repeat.for=\"i of 3\">a</div></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$05$161 div.repeat x3 +> (div.if.true > div.if.true > div.repeat x3 > \"a\")", function $05$161_div_repeat_x3_____div_if_true___div_if_true___div_repeat_x3____a__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div repeat.for=\"i of 3\" if.bind=\"true\"><div if.bind=\"true\"><div repeat.for=\"i of 3\">a</div></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$05$162 div.if.true +> (div.repeat x3 > div.if.true > div.repeat x3 > \"a\")", function $05$162_div_if_true_____div_repeat_x3___div_if_true___div_repeat_x3____a__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\" repeat.for=\"i of 3\"><div if.bind=\"true\"><div repeat.for=\"i of 3\">a</div></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$05$163 div.if.true > (div.repeat x3 +> (div.if.true > div.repeat x3 > \"a\"))", function $05$163_div_if_true____div_repeat_x3_____div_if_true___div_repeat_x3____a___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\"><div repeat.for=\"i of 3\" if.bind=\"true\"><div repeat.for=\"i of 3\">a</div></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$05$164 div.if.true +> (div.if.true +> div.repeat x3 > div.repeat x3 > \"a\")", function $05$164_div_if_true_____div_if_true____div_repeat_x3___div_repeat_x3____a__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\"><div if.bind=\"true\" repeat.for=\"i of 3\"><div repeat.for=\"i of 3\">a</div></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$05$165 div.repeat x3 +> (div.if.true > (div.repeat x3 +> (div.if.true > div.repeat x3 > \"a\")))", function $05$165_div_repeat_x3_____div_if_true____div_repeat_x3_____div_if_true___div_repeat_x3____a____() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div repeat.for=\"i of 3\" if.bind=\"true\"><div repeat.for=\"i of 3\" if.bind=\"true\"><div repeat.for=\"i of 3\">a</div></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaaaaaaaaaaaaaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$05$166 div.if.true +> (div.repeat x3 > (div.repeat x3 +> (div.if.true > div.repeat x3 > \"a\")))", function $05$166_div_if_true_____div_repeat_x3____div_repeat_x3_____div_if_true___div_repeat_x3____a____() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\" repeat.for=\"i of 3\"><div repeat.for=\"i of 3\" if.bind=\"true\"><div repeat.for=\"i of 3\">a</div></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaaaaaaaaaaaaaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$05$167 div.repeat x3 +> (div.if.true > (div.if.true +> div.repeat x3 > div.repeat x3 > \"a\"))", function $05$167_div_repeat_x3_____div_if_true____div_if_true____div_repeat_x3___div_repeat_x3____a___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div repeat.for=\"i of 3\" if.bind=\"true\"><div if.bind=\"true\" repeat.for=\"i of 3\"><div repeat.for=\"i of 3\">a</div></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaaaaaaaaaaaaaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$05$168 div.if.true +> (div.repeat x3 > (div.if.true +> div.repeat x3 > div.repeat x3 > \"a\"))", function $05$168_div_if_true_____div_repeat_x3____div_if_true____div_repeat_x3___div_repeat_x3____a___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\" repeat.for=\"i of 3\"><div if.bind=\"true\" repeat.for=\"i of 3\"><div repeat.for=\"i of 3\">a</div></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaaaaaaaaaaaaaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$05$201 (div.if.true > div.repeat x3 > \"a\") + (else > div.repeat x3 > \"b\")", function $05$201__div_if_true___div_repeat_x3____a______else___div_repeat_x3____b__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\"><div repeat.for=\"i of 3\">a</div></div><div else><div repeat.for=\"i of 3\">b</div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$05$202 (div.if.false > div.repeat x3 > \"b\") + (div.else > div.repeat x3 > \"a\")", function $05$202__div_if_false___div_repeat_x3____b______div_else___div_repeat_x3____a__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"false\"><div repeat.for=\"i of 3\">b</div></div><div else><div repeat.for=\"i of 3\">a</div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$05$221 div.if.true > ((div.if.true > div.repeat x3 > \"a\") + (else > div.repeat x3 > \"b\"))", function $05$221_div_if_true_____div_if_true___div_repeat_x3____a______else___div_repeat_x3____b___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\"><div if.bind=\"true\"><div repeat.for=\"i of 3\">a</div></div><div else><div repeat.for=\"i of 3\">b</div></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$05$222 (div.if.true > ((div.if.true > div.repeat x3 > \"a\") + (else > div.repeat x3 > \"b\"))) + (else > div.repeat x3 > \"b\")", function $05$222__div_if_true_____div_if_true___div_repeat_x3____a______else___div_repeat_x3____b________else___div_repeat_x3____b__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\"><div if.bind=\"true\"><div repeat.for=\"i of 3\">a</div></div><div else><div repeat.for=\"i of 3\">b</div></div></div><div else><div repeat.for=\"i of 3\">b</div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$05$223 div.if.true > ((div.if.false > div.repeat x3 > \"b\") + (else > div.repeat x3 > \"a\"))", function $05$223_div_if_true_____div_if_false___div_repeat_x3____b______else___div_repeat_x3____a___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\"><div if.bind=\"false\"><div repeat.for=\"i of 3\">b</div></div><div else><div repeat.for=\"i of 3\">a</div></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$05$224 (div.if.true > ((div.if.false > div.repeat x3 > \"b\") + (else > div.repeat x3 > \"a\"))) + (else > div.repeat x3 > \"b\")", function $05$224__div_if_true_____div_if_false___div_repeat_x3____b______else___div_repeat_x3____a________else___div_repeat_x3____b__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\"><div if.bind=\"false\"><div repeat.for=\"i of 3\">b</div></div><div else><div repeat.for=\"i of 3\">a</div></div></div><div else><div repeat.for=\"i of 3\">b</div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$05$225 (div.if.false > \"\") + (div.else > (if.bind=\"false\" > div.repeat x3 > \"b\") + (div.else > div.repeat x3 > \"a\"))", function $05$225__div_if_false__________div_else____if_bind__false____div_repeat_x3____b______div_else___div_repeat_x3____a___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"false\"></div><div else><div if.bind=\"false\"><div repeat.for=\"i of 3\">b</div></div><div else><div repeat.for=\"i of 3\">a</div></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$05$226 (div.if.false > div.repeat x3 > \"b\") + (div.else > (if.bind=\"false\" > div.repeat x3 > \"b\") + (div.else > div.repeat x3 > \"a\"))", function $05$226__div_if_false___div_repeat_x3____b______div_else____if_bind__false____div_repeat_x3____b______div_else___div_repeat_x3____a___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"false\"><div repeat.for=\"i of 3\">b</div></div><div else><div if.bind=\"false\"><div repeat.for=\"i of 3\">b</div></div><div else><div repeat.for=\"i of 3\">a</div></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$05$227 (div.if.false > div.repeat x3 > \"b\") + (div.else > (if.bind=\"true\" > div.repeat x3 > \"a\"))", function $05$227__div_if_false___div_repeat_x3____b______div_else____if_bind__true____div_repeat_x3____a___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"false\"><div repeat.for=\"i of 3\">b</div></div><div else><div if.bind=\"true\"><div repeat.for=\"i of 3\">a</div></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$05$228 (div.if.false > div.repeat x3 > \"b\") + (div.else +> div.if.true > div.repeat x3 > \"a\")", function $05$228__div_if_false___div_repeat_x3____b______div_else____div_if_true___div_repeat_x3____a__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"false\"><div repeat.for=\"i of 3\">b</div></div><div else if.bind=\"true\"><div repeat.for=\"i of 3\">a</div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
    });
    describe("$06$xxx template=div.repeat x3 > \"a\", notTemplate=<div repeat.for=\"i of 3\">${notMsg}</div> (div)", function $06$xxx_template_div_repeat_x3____a___notTemplate__div_repeat_for__i_of_3__$_notMsg___div___div_() {
        it("$06$201 (div.if.true > div.repeat x3 > \"a\") + (else > div.repeat x3 > ${notMsg})", function $06$201__div_if_true___div_repeat_x3____a______else___div_repeat_x3___$_notMsg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\"><div repeat.for=\"i of 3\">a</div></div><div else><div repeat.for=\"i of 3\">${notMsg}</div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$06$202 (div.if.false > div.repeat x3 > ${notMsg}) + (div.else > div.repeat x3 > \"a\")", function $06$202__div_if_false___div_repeat_x3___$_notMsg______div_else___div_repeat_x3____a__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"false\"><div repeat.for=\"i of 3\">${notMsg}</div></div><div else><div repeat.for=\"i of 3\">a</div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$06$221 div.if.true > ((div.if.true > div.repeat x3 > \"a\") + (else > div.repeat x3 > ${notMsg}))", function $06$221_div_if_true_____div_if_true___div_repeat_x3____a______else___div_repeat_x3___$_notMsg___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\"><div if.bind=\"true\"><div repeat.for=\"i of 3\">a</div></div><div else><div repeat.for=\"i of 3\">${notMsg}</div></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$06$222 (div.if.true > ((div.if.true > div.repeat x3 > \"a\") + (else > div.repeat x3 > ${notMsg}))) + (else > div.repeat x3 > ${notMsg})", function $06$222__div_if_true_____div_if_true___div_repeat_x3____a______else___div_repeat_x3___$_notMsg________else___div_repeat_x3___$_notMsg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\"><div if.bind=\"true\"><div repeat.for=\"i of 3\">a</div></div><div else><div repeat.for=\"i of 3\">${notMsg}</div></div></div><div else><div repeat.for=\"i of 3\">${notMsg}</div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$06$223 div.if.true > ((div.if.false > div.repeat x3 > ${notMsg}) + (else > div.repeat x3 > \"a\"))", function $06$223_div_if_true_____div_if_false___div_repeat_x3___$_notMsg______else___div_repeat_x3____a___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\"><div if.bind=\"false\"><div repeat.for=\"i of 3\">${notMsg}</div></div><div else><div repeat.for=\"i of 3\">a</div></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$06$224 (div.if.true > ((div.if.false > div.repeat x3 > ${notMsg}) + (else > div.repeat x3 > \"a\"))) + (else > div.repeat x3 > ${notMsg})", function $06$224__div_if_true_____div_if_false___div_repeat_x3___$_notMsg______else___div_repeat_x3____a________else___div_repeat_x3___$_notMsg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\"><div if.bind=\"false\"><div repeat.for=\"i of 3\">${notMsg}</div></div><div else><div repeat.for=\"i of 3\">a</div></div></div><div else><div repeat.for=\"i of 3\">${notMsg}</div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$06$225 (div.if.false > \"\") + (div.else > (if.bind=\"false\" > div.repeat x3 > ${notMsg}) + (div.else > div.repeat x3 > \"a\"))", function $06$225__div_if_false__________div_else____if_bind__false____div_repeat_x3___$_notMsg______div_else___div_repeat_x3____a___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"false\"></div><div else><div if.bind=\"false\"><div repeat.for=\"i of 3\">${notMsg}</div></div><div else><div repeat.for=\"i of 3\">a</div></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$06$226 (div.if.false > div.repeat x3 > ${notMsg}) + (div.else > (if.bind=\"false\" > div.repeat x3 > ${notMsg}) + (div.else > div.repeat x3 > \"a\"))", function $06$226__div_if_false___div_repeat_x3___$_notMsg______div_else____if_bind__false____div_repeat_x3___$_notMsg______div_else___div_repeat_x3____a___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"false\"><div repeat.for=\"i of 3\">${notMsg}</div></div><div else><div if.bind=\"false\"><div repeat.for=\"i of 3\">${notMsg}</div></div><div else><div repeat.for=\"i of 3\">a</div></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$06$227 (div.if.false > div.repeat x3 > ${notMsg}) + (div.else > (if.bind=\"true\" > div.repeat x3 > \"a\"))", function $06$227__div_if_false___div_repeat_x3___$_notMsg______div_else____if_bind__true____div_repeat_x3____a___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"false\"><div repeat.for=\"i of 3\">${notMsg}</div></div><div else><div if.bind=\"true\"><div repeat.for=\"i of 3\">a</div></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$06$228 (div.if.false > div.repeat x3 > ${notMsg}) + (div.else +> div.if.true > div.repeat x3 > \"a\")", function $06$228__div_if_false___div_repeat_x3___$_notMsg______div_else____div_if_true___div_repeat_x3____a__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"false\"><div repeat.for=\"i of 3\">${notMsg}</div></div><div else if.bind=\"true\"><div repeat.for=\"i of 3\">a</div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
    });
    describe("$07$xxx template=div.repeat x3 > ${msg}, notTemplate=<div repeat.for=\"i of 3\">b</div> (div)", function $07$xxx_template_div_repeat_x3___$_msg___notTemplate__div_repeat_for__i_of_3__b__div___div_() {
        it("$07$001 div.repeat x3 > ${msg}", function $07$001_div_repeat_x3___$_msg_() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div repeat.for=\"i of 3\">${msg}</div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$07$101 div.if.true > div.repeat x3 > ${msg}", function $07$101_div_if_true___div_repeat_x3___$_msg_() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\"><div repeat.for=\"i of 3\">${msg}</div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$07$102 (div.if.false > \"\") + (div.else > div.repeat x3 > ${msg})", function $07$102__div_if_false__________div_else___div_repeat_x3___$_msg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"false\"></div><div else><div repeat.for=\"i of 3\">${msg}</div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$07$103 div.if.true +> div.repeat x3 > div.repeat x3 > ${msg}", function $07$103_div_if_true____div_repeat_x3___div_repeat_x3___$_msg_() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\" repeat.for=\"i of 3\"><div repeat.for=\"i of 3\">${msg}</div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$07$104 (div.if.false > \"\") + (div.else +> div.repeat x3 > div.repeat x3 > ${msg})", function $07$104__div_if_false__________div_else____div_repeat_x3___div_repeat_x3___$_msg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"false\"></div><div else repeat.for=\"i of 3\"><div repeat.for=\"i of 3\">${msg}</div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$07$105 div.repeat x3 +> div.if.true > div.repeat x3 > ${msg}", function $07$105_div_repeat_x3____div_if_true___div_repeat_x3___$_msg_() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div repeat.for=\"i of 3\" if.bind=\"true\"><div repeat.for=\"i of 3\">${msg}</div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$07$106 div.repeat x3 > div.if.true > div.repeat x3 > ${msg}", function $07$106_div_repeat_x3___div_if_true___div_repeat_x3___$_msg_() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div repeat.for=\"i of 3\"><div if.bind=\"true\"><div repeat.for=\"i of 3\">${msg}</div></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$07$107 (div.if.false > \"\") + (div.else)", function $07$107__div_if_false__________div_else_() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div repeat.for=\"i of 3\"><div if.bind=\"false\"></div><div else><div repeat.for=\"i of 3\">${msg}</div></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$07$121 div.if.true > div.if.true > div.repeat x3 > ${msg}", function $07$121_div_if_true___div_if_true___div_repeat_x3___$_msg_() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\"><div if.bind=\"true\"><div repeat.for=\"i of 3\">${msg}</div></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$07$123 div.if.true > (div.if.false > \"\") : (div.else > div.repeat x3 > ${msg})", function $07$123_div_if_true____div_if_false__________div_else___div_repeat_x3___$_msg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\"><div if.bind=\"false\"></div><div else><div repeat.for=\"i of 3\">${msg}</div></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$07$125 div.else > div.else > div.repeat x3 > ${msg}", function $07$125_div_else___div_else___div_repeat_x3___$_msg_() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"false\"></div><div else><div if.bind=\"false\"></div><div else><div repeat.for=\"i of 3\">${msg}</div></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$07$127 (div.if.false > \"\") + (div.else > div.if.true > div.repeat x3 > ${msg})", function $07$127__div_if_false__________div_else___div_if_true___div_repeat_x3___$_msg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"false\"></div><div else><div if.bind=\"true\"><div repeat.for=\"i of 3\">${msg}</div></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$07$128 (div.if.false > \"\") + (div.else +> div.if.true > div.repeat x3 > ${msg})", function $07$128__div_if_false__________div_else____div_if_true___div_repeat_x3___$_msg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"false\"></div><div else if.bind=\"true\"><div repeat.for=\"i of 3\">${msg}</div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$07$141 div.repeat x3 > (div.if.true > div.if.true > div.repeat x3 > ${msg})", function $07$141_div_repeat_x3____div_if_true___div_if_true___div_repeat_x3___$_msg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div repeat.for=\"i of 3\"><div if.bind=\"true\"><div if.bind=\"true\"><div repeat.for=\"i of 3\">${msg}</div></div></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$07$143 div.repeat x3 > (div.if.true > (div.if.false > \"\") : (div.else > div.repeat x3 > ${msg}))", function $07$143_div_repeat_x3____div_if_true____div_if_false__________div_else___div_repeat_x3___$_msg___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div repeat.for=\"i of 3\"><div if.bind=\"true\"><div if.bind=\"false\"></div><div else><div repeat.for=\"i of 3\">${msg}</div></div></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$07$145 div.repeat x3 > (div.else > div.else > div.repeat x3 > ${msg})", function $07$145_div_repeat_x3____div_else___div_else___div_repeat_x3___$_msg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div repeat.for=\"i of 3\"><div if.bind=\"false\"></div><div else><div if.bind=\"false\"></div><div else><div repeat.for=\"i of 3\">${msg}</div></div></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$07$147 div.repeat x3 > ((div.if.false > \"\") + (div.else > div.if.true > div.repeat x3 > ${msg}))", function $07$147_div_repeat_x3_____div_if_false__________div_else___div_if_true___div_repeat_x3___$_msg___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div repeat.for=\"i of 3\"><div if.bind=\"false\"></div><div else><div if.bind=\"true\"><div repeat.for=\"i of 3\">${msg}</div></div></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$07$148 div.repeat x3 > ((div.if.false > \"\") + (div.else +> div.if.true > div.repeat x3 > ${msg}))", function $07$148_div_repeat_x3_____div_if_false__________div_else____div_if_true___div_repeat_x3___$_msg___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div repeat.for=\"i of 3\"><div if.bind=\"false\"></div><div else if.bind=\"true\"><div repeat.for=\"i of 3\">${msg}</div></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$07$161 div.repeat x3 +> (div.if.true > div.if.true > div.repeat x3 > ${msg})", function $07$161_div_repeat_x3_____div_if_true___div_if_true___div_repeat_x3___$_msg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div repeat.for=\"i of 3\" if.bind=\"true\"><div if.bind=\"true\"><div repeat.for=\"i of 3\">${msg}</div></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$07$162 div.if.true +> (div.repeat x3 > div.if.true > div.repeat x3 > ${msg})", function $07$162_div_if_true_____div_repeat_x3___div_if_true___div_repeat_x3___$_msg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\" repeat.for=\"i of 3\"><div if.bind=\"true\"><div repeat.for=\"i of 3\">${msg}</div></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$07$163 div.if.true > (div.repeat x3 +> (div.if.true > div.repeat x3 > ${msg}))", function $07$163_div_if_true____div_repeat_x3_____div_if_true___div_repeat_x3___$_msg___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\"><div repeat.for=\"i of 3\" if.bind=\"true\"><div repeat.for=\"i of 3\">${msg}</div></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$07$164 div.if.true +> (div.if.true +> div.repeat x3 > div.repeat x3 > ${msg})", function $07$164_div_if_true_____div_if_true____div_repeat_x3___div_repeat_x3___$_msg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\"><div if.bind=\"true\" repeat.for=\"i of 3\"><div repeat.for=\"i of 3\">${msg}</div></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$07$165 div.repeat x3 +> (div.if.true > (div.repeat x3 +> (div.if.true > div.repeat x3 > ${msg})))", function $07$165_div_repeat_x3_____div_if_true____div_repeat_x3_____div_if_true___div_repeat_x3___$_msg____() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div repeat.for=\"i of 3\" if.bind=\"true\"><div repeat.for=\"i of 3\" if.bind=\"true\"><div repeat.for=\"i of 3\">${msg}</div></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaaaaaaaaaaaaaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$07$166 div.if.true +> (div.repeat x3 > (div.repeat x3 +> (div.if.true > div.repeat x3 > ${msg})))", function $07$166_div_if_true_____div_repeat_x3____div_repeat_x3_____div_if_true___div_repeat_x3___$_msg____() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\" repeat.for=\"i of 3\"><div repeat.for=\"i of 3\" if.bind=\"true\"><div repeat.for=\"i of 3\">${msg}</div></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaaaaaaaaaaaaaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$07$167 div.repeat x3 +> (div.if.true > (div.if.true +> div.repeat x3 > div.repeat x3 > ${msg}))", function $07$167_div_repeat_x3_____div_if_true____div_if_true____div_repeat_x3___div_repeat_x3___$_msg___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div repeat.for=\"i of 3\" if.bind=\"true\"><div if.bind=\"true\" repeat.for=\"i of 3\"><div repeat.for=\"i of 3\">${msg}</div></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaaaaaaaaaaaaaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$07$168 div.if.true +> (div.repeat x3 > (div.if.true +> div.repeat x3 > div.repeat x3 > ${msg}))", function $07$168_div_if_true_____div_repeat_x3____div_if_true____div_repeat_x3___div_repeat_x3___$_msg___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\" repeat.for=\"i of 3\"><div if.bind=\"true\" repeat.for=\"i of 3\"><div repeat.for=\"i of 3\">${msg}</div></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaaaaaaaaaaaaaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$07$201 (div.if.true > div.repeat x3 > ${msg}) + (else > div.repeat x3 > \"b\")", function $07$201__div_if_true___div_repeat_x3___$_msg______else___div_repeat_x3____b__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\"><div repeat.for=\"i of 3\">${msg}</div></div><div else><div repeat.for=\"i of 3\">b</div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$07$202 (div.if.false > div.repeat x3 > \"b\") + (div.else > div.repeat x3 > ${msg})", function $07$202__div_if_false___div_repeat_x3____b______div_else___div_repeat_x3___$_msg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"false\"><div repeat.for=\"i of 3\">b</div></div><div else><div repeat.for=\"i of 3\">${msg}</div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$07$221 div.if.true > ((div.if.true > div.repeat x3 > ${msg}) + (else > div.repeat x3 > \"b\"))", function $07$221_div_if_true_____div_if_true___div_repeat_x3___$_msg______else___div_repeat_x3____b___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\"><div if.bind=\"true\"><div repeat.for=\"i of 3\">${msg}</div></div><div else><div repeat.for=\"i of 3\">b</div></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$07$222 (div.if.true > ((div.if.true > div.repeat x3 > ${msg}) + (else > div.repeat x3 > \"b\"))) + (else > div.repeat x3 > \"b\")", function $07$222__div_if_true_____div_if_true___div_repeat_x3___$_msg______else___div_repeat_x3____b________else___div_repeat_x3____b__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\"><div if.bind=\"true\"><div repeat.for=\"i of 3\">${msg}</div></div><div else><div repeat.for=\"i of 3\">b</div></div></div><div else><div repeat.for=\"i of 3\">b</div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$07$223 div.if.true > ((div.if.false > div.repeat x3 > \"b\") + (else > div.repeat x3 > ${msg}))", function $07$223_div_if_true_____div_if_false___div_repeat_x3____b______else___div_repeat_x3___$_msg___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\"><div if.bind=\"false\"><div repeat.for=\"i of 3\">b</div></div><div else><div repeat.for=\"i of 3\">${msg}</div></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$07$224 (div.if.true > ((div.if.false > div.repeat x3 > \"b\") + (else > div.repeat x3 > ${msg}))) + (else > div.repeat x3 > \"b\")", function $07$224__div_if_true_____div_if_false___div_repeat_x3____b______else___div_repeat_x3___$_msg________else___div_repeat_x3____b__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\"><div if.bind=\"false\"><div repeat.for=\"i of 3\">b</div></div><div else><div repeat.for=\"i of 3\">${msg}</div></div></div><div else><div repeat.for=\"i of 3\">b</div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$07$225 (div.if.false > \"\") + (div.else > (if.bind=\"false\" > div.repeat x3 > \"b\") + (div.else > div.repeat x3 > ${msg}))", function $07$225__div_if_false__________div_else____if_bind__false____div_repeat_x3____b______div_else___div_repeat_x3___$_msg___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"false\"></div><div else><div if.bind=\"false\"><div repeat.for=\"i of 3\">b</div></div><div else><div repeat.for=\"i of 3\">${msg}</div></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$07$226 (div.if.false > div.repeat x3 > \"b\") + (div.else > (if.bind=\"false\" > div.repeat x3 > \"b\") + (div.else > div.repeat x3 > ${msg}))", function $07$226__div_if_false___div_repeat_x3____b______div_else____if_bind__false____div_repeat_x3____b______div_else___div_repeat_x3___$_msg___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"false\"><div repeat.for=\"i of 3\">b</div></div><div else><div if.bind=\"false\"><div repeat.for=\"i of 3\">b</div></div><div else><div repeat.for=\"i of 3\">${msg}</div></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$07$227 (div.if.false > div.repeat x3 > \"b\") + (div.else > (if.bind=\"true\" > div.repeat x3 > ${msg}))", function $07$227__div_if_false___div_repeat_x3____b______div_else____if_bind__true____div_repeat_x3___$_msg___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"false\"><div repeat.for=\"i of 3\">b</div></div><div else><div if.bind=\"true\"><div repeat.for=\"i of 3\">${msg}</div></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$07$228 (div.if.false > div.repeat x3 > \"b\") + (div.else +> div.if.true > div.repeat x3 > ${msg})", function $07$228__div_if_false___div_repeat_x3____b______div_else____div_if_true___div_repeat_x3___$_msg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"false\"><div repeat.for=\"i of 3\">b</div></div><div else if.bind=\"true\"><div repeat.for=\"i of 3\">${msg}</div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
    });
    describe("$08$xxx template=div.repeat x3 > ${msg}, notTemplate=<div repeat.for=\"i of 3\">${notMsg}</div> (div)", function $08$xxx_template_div_repeat_x3___$_msg___notTemplate__div_repeat_for__i_of_3__$_notMsg___div___div_() {
        it("$08$201 (div.if.true > div.repeat x3 > ${msg}) + (else > div.repeat x3 > ${notMsg})", function $08$201__div_if_true___div_repeat_x3___$_msg______else___div_repeat_x3___$_notMsg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\"><div repeat.for=\"i of 3\">${msg}</div></div><div else><div repeat.for=\"i of 3\">${notMsg}</div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$08$202 (div.if.false > div.repeat x3 > ${notMsg}) + (div.else > div.repeat x3 > ${msg})", function $08$202__div_if_false___div_repeat_x3___$_notMsg______div_else___div_repeat_x3___$_msg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"false\"><div repeat.for=\"i of 3\">${notMsg}</div></div><div else><div repeat.for=\"i of 3\">${msg}</div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$08$221 div.if.true > ((div.if.true > div.repeat x3 > ${msg}) + (else > div.repeat x3 > ${notMsg}))", function $08$221_div_if_true_____div_if_true___div_repeat_x3___$_msg______else___div_repeat_x3___$_notMsg___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\"><div if.bind=\"true\"><div repeat.for=\"i of 3\">${msg}</div></div><div else><div repeat.for=\"i of 3\">${notMsg}</div></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$08$222 (div.if.true > ((div.if.true > div.repeat x3 > ${msg}) + (else > div.repeat x3 > ${notMsg}))) + (else > div.repeat x3 > ${notMsg})", function $08$222__div_if_true_____div_if_true___div_repeat_x3___$_msg______else___div_repeat_x3___$_notMsg________else___div_repeat_x3___$_notMsg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\"><div if.bind=\"true\"><div repeat.for=\"i of 3\">${msg}</div></div><div else><div repeat.for=\"i of 3\">${notMsg}</div></div></div><div else><div repeat.for=\"i of 3\">${notMsg}</div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$08$223 div.if.true > ((div.if.false > div.repeat x3 > ${notMsg}) + (else > div.repeat x3 > ${msg}))", function $08$223_div_if_true_____div_if_false___div_repeat_x3___$_notMsg______else___div_repeat_x3___$_msg___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\"><div if.bind=\"false\"><div repeat.for=\"i of 3\">${notMsg}</div></div><div else><div repeat.for=\"i of 3\">${msg}</div></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$08$224 (div.if.true > ((div.if.false > div.repeat x3 > ${notMsg}) + (else > div.repeat x3 > ${msg}))) + (else > div.repeat x3 > ${notMsg})", function $08$224__div_if_true_____div_if_false___div_repeat_x3___$_notMsg______else___div_repeat_x3___$_msg________else___div_repeat_x3___$_notMsg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\"><div if.bind=\"false\"><div repeat.for=\"i of 3\">${notMsg}</div></div><div else><div repeat.for=\"i of 3\">${msg}</div></div></div><div else><div repeat.for=\"i of 3\">${notMsg}</div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$08$225 (div.if.false > \"\") + (div.else > (if.bind=\"false\" > div.repeat x3 > ${notMsg}) + (div.else > div.repeat x3 > ${msg}))", function $08$225__div_if_false__________div_else____if_bind__false____div_repeat_x3___$_notMsg______div_else___div_repeat_x3___$_msg___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"false\"></div><div else><div if.bind=\"false\"><div repeat.for=\"i of 3\">${notMsg}</div></div><div else><div repeat.for=\"i of 3\">${msg}</div></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$08$226 (div.if.false > div.repeat x3 > ${notMsg}) + (div.else > (if.bind=\"false\" > div.repeat x3 > ${notMsg}) + (div.else > div.repeat x3 > ${msg}))", function $08$226__div_if_false___div_repeat_x3___$_notMsg______div_else____if_bind__false____div_repeat_x3___$_notMsg______div_else___div_repeat_x3___$_msg___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"false\"><div repeat.for=\"i of 3\">${notMsg}</div></div><div else><div if.bind=\"false\"><div repeat.for=\"i of 3\">${notMsg}</div></div><div else><div repeat.for=\"i of 3\">${msg}</div></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$08$227 (div.if.false > div.repeat x3 > ${notMsg}) + (div.else > (if.bind=\"true\" > div.repeat x3 > ${msg}))", function $08$227__div_if_false___div_repeat_x3___$_notMsg______div_else____if_bind__true____div_repeat_x3___$_msg___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"false\"><div repeat.for=\"i of 3\">${notMsg}</div></div><div else><div if.bind=\"true\"><div repeat.for=\"i of 3\">${msg}</div></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$08$228 (div.if.false > div.repeat x3 > ${notMsg}) + (div.else +> div.if.true > div.repeat x3 > ${msg})", function $08$228__div_if_false___div_repeat_x3___$_notMsg______div_else____div_if_true___div_repeat_x3___$_msg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"false\"><div repeat.for=\"i of 3\">${notMsg}</div></div><div else if.bind=\"true\"><div repeat.for=\"i of 3\">${msg}</div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
    });
    describe("$09$xxx template=tpl.repeat x3 > \"a\", notTemplate=<template repeat.for=\"i of 3\">b</template> (div)", function $09$xxx_template_tpl_repeat_x3____a___notTemplate__template_repeat_for__i_of_3__b__template___div_() {
        it("$09$001 tpl.repeat x3 > \"a\"", function $09$001_tpl_repeat_x3____a_() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><template repeat.for=\"i of 3\">a</template></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$09$101 div.if.true > tpl.repeat x3 > \"a\"", function $09$101_div_if_true___tpl_repeat_x3____a_() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\"><template repeat.for=\"i of 3\">a</template></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$09$102 (div.if.false > \"\") + (div.else > tpl.repeat x3 > \"a\")", function $09$102__div_if_false__________div_else___tpl_repeat_x3____a__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"false\"></div><div else><template repeat.for=\"i of 3\">a</template></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$09$103 div.if.true +> div.repeat x3 > tpl.repeat x3 > \"a\"", function $09$103_div_if_true____div_repeat_x3___tpl_repeat_x3____a_() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\" repeat.for=\"i of 3\"><template repeat.for=\"i of 3\">a</template></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$09$104 (div.if.false > \"\") + (div.else +> div.repeat x3 > tpl.repeat x3 > \"a\")", function $09$104__div_if_false__________div_else____div_repeat_x3___tpl_repeat_x3____a__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"false\"></div><div else repeat.for=\"i of 3\"><template repeat.for=\"i of 3\">a</template></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$09$105 div.repeat x3 +> div.if.true > tpl.repeat x3 > \"a\"", function $09$105_div_repeat_x3____div_if_true___tpl_repeat_x3____a_() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div repeat.for=\"i of 3\" if.bind=\"true\"><template repeat.for=\"i of 3\">a</template></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$09$106 div.repeat x3 > div.if.true > tpl.repeat x3 > \"a\"", function $09$106_div_repeat_x3___div_if_true___tpl_repeat_x3____a_() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div repeat.for=\"i of 3\"><div if.bind=\"true\"><template repeat.for=\"i of 3\">a</template></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$09$107 (div.if.false > \"\") + (div.else)", function $09$107__div_if_false__________div_else_() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div repeat.for=\"i of 3\"><div if.bind=\"false\"></div><div else><template repeat.for=\"i of 3\">a</template></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$09$121 div.if.true > div.if.true > tpl.repeat x3 > \"a\"", function $09$121_div_if_true___div_if_true___tpl_repeat_x3____a_() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\"><div if.bind=\"true\"><template repeat.for=\"i of 3\">a</template></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$09$123 div.if.true > (div.if.false > \"\") : (div.else > tpl.repeat x3 > \"a\")", function $09$123_div_if_true____div_if_false__________div_else___tpl_repeat_x3____a__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\"><div if.bind=\"false\"></div><div else><template repeat.for=\"i of 3\">a</template></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$09$125 div.else > div.else > tpl.repeat x3 > \"a\"", function $09$125_div_else___div_else___tpl_repeat_x3____a_() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"false\"></div><div else><div if.bind=\"false\"></div><div else><template repeat.for=\"i of 3\">a</template></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$09$127 (div.if.false > \"\") + (div.else > div.if.true > tpl.repeat x3 > \"a\")", function $09$127__div_if_false__________div_else___div_if_true___tpl_repeat_x3____a__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"false\"></div><div else><div if.bind=\"true\"><template repeat.for=\"i of 3\">a</template></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$09$128 (div.if.false > \"\") + (div.else +> div.if.true > tpl.repeat x3 > \"a\")", function $09$128__div_if_false__________div_else____div_if_true___tpl_repeat_x3____a__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"false\"></div><div else if.bind=\"true\"><template repeat.for=\"i of 3\">a</template></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$09$141 div.repeat x3 > (div.if.true > div.if.true > tpl.repeat x3 > \"a\")", function $09$141_div_repeat_x3____div_if_true___div_if_true___tpl_repeat_x3____a__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div repeat.for=\"i of 3\"><div if.bind=\"true\"><div if.bind=\"true\"><template repeat.for=\"i of 3\">a</template></div></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$09$143 div.repeat x3 > (div.if.true > (div.if.false > \"\") : (div.else > tpl.repeat x3 > \"a\"))", function $09$143_div_repeat_x3____div_if_true____div_if_false__________div_else___tpl_repeat_x3____a___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div repeat.for=\"i of 3\"><div if.bind=\"true\"><div if.bind=\"false\"></div><div else><template repeat.for=\"i of 3\">a</template></div></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$09$145 div.repeat x3 > (div.else > div.else > tpl.repeat x3 > \"a\")", function $09$145_div_repeat_x3____div_else___div_else___tpl_repeat_x3____a__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div repeat.for=\"i of 3\"><div if.bind=\"false\"></div><div else><div if.bind=\"false\"></div><div else><template repeat.for=\"i of 3\">a</template></div></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$09$147 div.repeat x3 > ((div.if.false > \"\") + (div.else > div.if.true > tpl.repeat x3 > \"a\"))", function $09$147_div_repeat_x3_____div_if_false__________div_else___div_if_true___tpl_repeat_x3____a___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div repeat.for=\"i of 3\"><div if.bind=\"false\"></div><div else><div if.bind=\"true\"><template repeat.for=\"i of 3\">a</template></div></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$09$148 div.repeat x3 > ((div.if.false > \"\") + (div.else +> div.if.true > tpl.repeat x3 > \"a\"))", function $09$148_div_repeat_x3_____div_if_false__________div_else____div_if_true___tpl_repeat_x3____a___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div repeat.for=\"i of 3\"><div if.bind=\"false\"></div><div else if.bind=\"true\"><template repeat.for=\"i of 3\">a</template></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$09$161 div.repeat x3 +> (div.if.true > div.if.true > tpl.repeat x3 > \"a\")", function $09$161_div_repeat_x3_____div_if_true___div_if_true___tpl_repeat_x3____a__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div repeat.for=\"i of 3\" if.bind=\"true\"><div if.bind=\"true\"><template repeat.for=\"i of 3\">a</template></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$09$162 div.if.true +> (div.repeat x3 > div.if.true > tpl.repeat x3 > \"a\")", function $09$162_div_if_true_____div_repeat_x3___div_if_true___tpl_repeat_x3____a__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\" repeat.for=\"i of 3\"><div if.bind=\"true\"><template repeat.for=\"i of 3\">a</template></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$09$163 div.if.true > (div.repeat x3 +> (div.if.true > tpl.repeat x3 > \"a\"))", function $09$163_div_if_true____div_repeat_x3_____div_if_true___tpl_repeat_x3____a___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\"><div repeat.for=\"i of 3\" if.bind=\"true\"><template repeat.for=\"i of 3\">a</template></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$09$164 div.if.true +> (div.if.true +> div.repeat x3 > tpl.repeat x3 > \"a\")", function $09$164_div_if_true_____div_if_true____div_repeat_x3___tpl_repeat_x3____a__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\"><div if.bind=\"true\" repeat.for=\"i of 3\"><template repeat.for=\"i of 3\">a</template></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$09$165 div.repeat x3 +> (div.if.true > (div.repeat x3 +> (div.if.true > tpl.repeat x3 > \"a\")))", function $09$165_div_repeat_x3_____div_if_true____div_repeat_x3_____div_if_true___tpl_repeat_x3____a____() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div repeat.for=\"i of 3\" if.bind=\"true\"><div repeat.for=\"i of 3\" if.bind=\"true\"><template repeat.for=\"i of 3\">a</template></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaaaaaaaaaaaaaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$09$166 div.if.true +> (div.repeat x3 > (div.repeat x3 +> (div.if.true > tpl.repeat x3 > \"a\")))", function $09$166_div_if_true_____div_repeat_x3____div_repeat_x3_____div_if_true___tpl_repeat_x3____a____() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\" repeat.for=\"i of 3\"><div repeat.for=\"i of 3\" if.bind=\"true\"><template repeat.for=\"i of 3\">a</template></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaaaaaaaaaaaaaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$09$167 div.repeat x3 +> (div.if.true > (div.if.true +> div.repeat x3 > tpl.repeat x3 > \"a\"))", function $09$167_div_repeat_x3_____div_if_true____div_if_true____div_repeat_x3___tpl_repeat_x3____a___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div repeat.for=\"i of 3\" if.bind=\"true\"><div if.bind=\"true\" repeat.for=\"i of 3\"><template repeat.for=\"i of 3\">a</template></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaaaaaaaaaaaaaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$09$168 div.if.true +> (div.repeat x3 > (div.if.true +> div.repeat x3 > tpl.repeat x3 > \"a\"))", function $09$168_div_if_true_____div_repeat_x3____div_if_true____div_repeat_x3___tpl_repeat_x3____a___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\" repeat.for=\"i of 3\"><div if.bind=\"true\" repeat.for=\"i of 3\"><template repeat.for=\"i of 3\">a</template></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaaaaaaaaaaaaaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$09$201 (div.if.true > tpl.repeat x3 > \"a\") + (else > tpl.repeat x3 > \"b\")", function $09$201__div_if_true___tpl_repeat_x3____a______else___tpl_repeat_x3____b__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\"><template repeat.for=\"i of 3\">a</template></div><div else><template repeat.for=\"i of 3\">b</template></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$09$202 (div.if.false > tpl.repeat x3 > \"b\") + (div.else > tpl.repeat x3 > \"a\")", function $09$202__div_if_false___tpl_repeat_x3____b______div_else___tpl_repeat_x3____a__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"false\"><template repeat.for=\"i of 3\">b</template></div><div else><template repeat.for=\"i of 3\">a</template></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$09$221 div.if.true > ((div.if.true > tpl.repeat x3 > \"a\") + (else > tpl.repeat x3 > \"b\"))", function $09$221_div_if_true_____div_if_true___tpl_repeat_x3____a______else___tpl_repeat_x3____b___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\"><div if.bind=\"true\"><template repeat.for=\"i of 3\">a</template></div><div else><template repeat.for=\"i of 3\">b</template></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$09$222 (div.if.true > ((div.if.true > tpl.repeat x3 > \"a\") + (else > tpl.repeat x3 > \"b\"))) + (else > tpl.repeat x3 > \"b\")", function $09$222__div_if_true_____div_if_true___tpl_repeat_x3____a______else___tpl_repeat_x3____b________else___tpl_repeat_x3____b__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\"><div if.bind=\"true\"><template repeat.for=\"i of 3\">a</template></div><div else><template repeat.for=\"i of 3\">b</template></div></div><div else><template repeat.for=\"i of 3\">b</template></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$09$223 div.if.true > ((div.if.false > tpl.repeat x3 > \"b\") + (else > tpl.repeat x3 > \"a\"))", function $09$223_div_if_true_____div_if_false___tpl_repeat_x3____b______else___tpl_repeat_x3____a___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\"><div if.bind=\"false\"><template repeat.for=\"i of 3\">b</template></div><div else><template repeat.for=\"i of 3\">a</template></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$09$224 (div.if.true > ((div.if.false > tpl.repeat x3 > \"b\") + (else > tpl.repeat x3 > \"a\"))) + (else > tpl.repeat x3 > \"b\")", function $09$224__div_if_true_____div_if_false___tpl_repeat_x3____b______else___tpl_repeat_x3____a________else___tpl_repeat_x3____b__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\"><div if.bind=\"false\"><template repeat.for=\"i of 3\">b</template></div><div else><template repeat.for=\"i of 3\">a</template></div></div><div else><template repeat.for=\"i of 3\">b</template></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$09$225 (div.if.false > \"\") + (div.else > (if.bind=\"false\" > tpl.repeat x3 > \"b\") + (div.else > tpl.repeat x3 > \"a\"))", function $09$225__div_if_false__________div_else____if_bind__false____tpl_repeat_x3____b______div_else___tpl_repeat_x3____a___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"false\"></div><div else><div if.bind=\"false\"><template repeat.for=\"i of 3\">b</template></div><div else><template repeat.for=\"i of 3\">a</template></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$09$226 (div.if.false > tpl.repeat x3 > \"b\") + (div.else > (if.bind=\"false\" > tpl.repeat x3 > \"b\") + (div.else > tpl.repeat x3 > \"a\"))", function $09$226__div_if_false___tpl_repeat_x3____b______div_else____if_bind__false____tpl_repeat_x3____b______div_else___tpl_repeat_x3____a___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"false\"><template repeat.for=\"i of 3\">b</template></div><div else><div if.bind=\"false\"><template repeat.for=\"i of 3\">b</template></div><div else><template repeat.for=\"i of 3\">a</template></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$09$227 (div.if.false > tpl.repeat x3 > \"b\") + (div.else > (if.bind=\"true\" > tpl.repeat x3 > \"a\"))", function $09$227__div_if_false___tpl_repeat_x3____b______div_else____if_bind__true____tpl_repeat_x3____a___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"false\"><template repeat.for=\"i of 3\">b</template></div><div else><div if.bind=\"true\"><template repeat.for=\"i of 3\">a</template></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$09$228 (div.if.false > tpl.repeat x3 > \"b\") + (div.else +> div.if.true > tpl.repeat x3 > \"a\")", function $09$228__div_if_false___tpl_repeat_x3____b______div_else____div_if_true___tpl_repeat_x3____a__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"false\"><template repeat.for=\"i of 3\">b</template></div><div else if.bind=\"true\"><template repeat.for=\"i of 3\">a</template></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
    });
    describe("$10$xxx template=tpl.repeat x3 > \"a\", notTemplate=<template repeat.for=\"i of 3\">${notMsg}</template> (div)", function $10$xxx_template_tpl_repeat_x3____a___notTemplate__template_repeat_for__i_of_3__$_notMsg___template___div_() {
        it("$10$201 (div.if.true > tpl.repeat x3 > \"a\") + (else > tpl.repeat x3 > ${notMsg})", function $10$201__div_if_true___tpl_repeat_x3____a______else___tpl_repeat_x3___$_notMsg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\"><template repeat.for=\"i of 3\">a</template></div><div else><template repeat.for=\"i of 3\">${notMsg}</template></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$10$202 (div.if.false > tpl.repeat x3 > ${notMsg}) + (div.else > tpl.repeat x3 > \"a\")", function $10$202__div_if_false___tpl_repeat_x3___$_notMsg______div_else___tpl_repeat_x3____a__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"false\"><template repeat.for=\"i of 3\">${notMsg}</template></div><div else><template repeat.for=\"i of 3\">a</template></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$10$221 div.if.true > ((div.if.true > tpl.repeat x3 > \"a\") + (else > tpl.repeat x3 > ${notMsg}))", function $10$221_div_if_true_____div_if_true___tpl_repeat_x3____a______else___tpl_repeat_x3___$_notMsg___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\"><div if.bind=\"true\"><template repeat.for=\"i of 3\">a</template></div><div else><template repeat.for=\"i of 3\">${notMsg}</template></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$10$222 (div.if.true > ((div.if.true > tpl.repeat x3 > \"a\") + (else > tpl.repeat x3 > ${notMsg}))) + (else > tpl.repeat x3 > ${notMsg})", function $10$222__div_if_true_____div_if_true___tpl_repeat_x3____a______else___tpl_repeat_x3___$_notMsg________else___tpl_repeat_x3___$_notMsg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\"><div if.bind=\"true\"><template repeat.for=\"i of 3\">a</template></div><div else><template repeat.for=\"i of 3\">${notMsg}</template></div></div><div else><template repeat.for=\"i of 3\">${notMsg}</template></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$10$223 div.if.true > ((div.if.false > tpl.repeat x3 > ${notMsg}) + (else > tpl.repeat x3 > \"a\"))", function $10$223_div_if_true_____div_if_false___tpl_repeat_x3___$_notMsg______else___tpl_repeat_x3____a___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\"><div if.bind=\"false\"><template repeat.for=\"i of 3\">${notMsg}</template></div><div else><template repeat.for=\"i of 3\">a</template></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$10$224 (div.if.true > ((div.if.false > tpl.repeat x3 > ${notMsg}) + (else > tpl.repeat x3 > \"a\"))) + (else > tpl.repeat x3 > ${notMsg})", function $10$224__div_if_true_____div_if_false___tpl_repeat_x3___$_notMsg______else___tpl_repeat_x3____a________else___tpl_repeat_x3___$_notMsg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\"><div if.bind=\"false\"><template repeat.for=\"i of 3\">${notMsg}</template></div><div else><template repeat.for=\"i of 3\">a</template></div></div><div else><template repeat.for=\"i of 3\">${notMsg}</template></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$10$225 (div.if.false > \"\") + (div.else > (if.bind=\"false\" > tpl.repeat x3 > ${notMsg}) + (div.else > tpl.repeat x3 > \"a\"))", function $10$225__div_if_false__________div_else____if_bind__false____tpl_repeat_x3___$_notMsg______div_else___tpl_repeat_x3____a___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"false\"></div><div else><div if.bind=\"false\"><template repeat.for=\"i of 3\">${notMsg}</template></div><div else><template repeat.for=\"i of 3\">a</template></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$10$226 (div.if.false > tpl.repeat x3 > ${notMsg}) + (div.else > (if.bind=\"false\" > tpl.repeat x3 > ${notMsg}) + (div.else > tpl.repeat x3 > \"a\"))", function $10$226__div_if_false___tpl_repeat_x3___$_notMsg______div_else____if_bind__false____tpl_repeat_x3___$_notMsg______div_else___tpl_repeat_x3____a___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"false\"><template repeat.for=\"i of 3\">${notMsg}</template></div><div else><div if.bind=\"false\"><template repeat.for=\"i of 3\">${notMsg}</template></div><div else><template repeat.for=\"i of 3\">a</template></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$10$227 (div.if.false > tpl.repeat x3 > ${notMsg}) + (div.else > (if.bind=\"true\" > tpl.repeat x3 > \"a\"))", function $10$227__div_if_false___tpl_repeat_x3___$_notMsg______div_else____if_bind__true____tpl_repeat_x3____a___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"false\"><template repeat.for=\"i of 3\">${notMsg}</template></div><div else><div if.bind=\"true\"><template repeat.for=\"i of 3\">a</template></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$10$228 (div.if.false > tpl.repeat x3 > ${notMsg}) + (div.else +> div.if.true > tpl.repeat x3 > \"a\")", function $10$228__div_if_false___tpl_repeat_x3___$_notMsg______div_else____div_if_true___tpl_repeat_x3____a__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"false\"><template repeat.for=\"i of 3\">${notMsg}</template></div><div else if.bind=\"true\"><template repeat.for=\"i of 3\">a</template></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
    });
    describe("$11$xxx template=tpl.repeat x3 > ${msg}, notTemplate=<template repeat.for=\"i of 3\">b</template> (div)", function $11$xxx_template_tpl_repeat_x3___$_msg___notTemplate__template_repeat_for__i_of_3__b__template___div_() {
        it("$11$001 tpl.repeat x3 > ${msg}", function $11$001_tpl_repeat_x3___$_msg_() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><template repeat.for=\"i of 3\">${msg}</template></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$11$101 div.if.true > tpl.repeat x3 > ${msg}", function $11$101_div_if_true___tpl_repeat_x3___$_msg_() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\"><template repeat.for=\"i of 3\">${msg}</template></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$11$102 (div.if.false > \"\") + (div.else > tpl.repeat x3 > ${msg})", function $11$102__div_if_false__________div_else___tpl_repeat_x3___$_msg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"false\"></div><div else><template repeat.for=\"i of 3\">${msg}</template></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$11$103 div.if.true +> div.repeat x3 > tpl.repeat x3 > ${msg}", function $11$103_div_if_true____div_repeat_x3___tpl_repeat_x3___$_msg_() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\" repeat.for=\"i of 3\"><template repeat.for=\"i of 3\">${msg}</template></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$11$104 (div.if.false > \"\") + (div.else +> div.repeat x3 > tpl.repeat x3 > ${msg})", function $11$104__div_if_false__________div_else____div_repeat_x3___tpl_repeat_x3___$_msg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"false\"></div><div else repeat.for=\"i of 3\"><template repeat.for=\"i of 3\">${msg}</template></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$11$105 div.repeat x3 +> div.if.true > tpl.repeat x3 > ${msg}", function $11$105_div_repeat_x3____div_if_true___tpl_repeat_x3___$_msg_() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div repeat.for=\"i of 3\" if.bind=\"true\"><template repeat.for=\"i of 3\">${msg}</template></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$11$106 div.repeat x3 > div.if.true > tpl.repeat x3 > ${msg}", function $11$106_div_repeat_x3___div_if_true___tpl_repeat_x3___$_msg_() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div repeat.for=\"i of 3\"><div if.bind=\"true\"><template repeat.for=\"i of 3\">${msg}</template></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$11$107 (div.if.false > \"\") + (div.else)", function $11$107__div_if_false__________div_else_() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div repeat.for=\"i of 3\"><div if.bind=\"false\"></div><div else><template repeat.for=\"i of 3\">${msg}</template></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$11$121 div.if.true > div.if.true > tpl.repeat x3 > ${msg}", function $11$121_div_if_true___div_if_true___tpl_repeat_x3___$_msg_() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\"><div if.bind=\"true\"><template repeat.for=\"i of 3\">${msg}</template></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$11$123 div.if.true > (div.if.false > \"\") : (div.else > tpl.repeat x3 > ${msg})", function $11$123_div_if_true____div_if_false__________div_else___tpl_repeat_x3___$_msg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\"><div if.bind=\"false\"></div><div else><template repeat.for=\"i of 3\">${msg}</template></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$11$125 div.else > div.else > tpl.repeat x3 > ${msg}", function $11$125_div_else___div_else___tpl_repeat_x3___$_msg_() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"false\"></div><div else><div if.bind=\"false\"></div><div else><template repeat.for=\"i of 3\">${msg}</template></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$11$127 (div.if.false > \"\") + (div.else > div.if.true > tpl.repeat x3 > ${msg})", function $11$127__div_if_false__________div_else___div_if_true___tpl_repeat_x3___$_msg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"false\"></div><div else><div if.bind=\"true\"><template repeat.for=\"i of 3\">${msg}</template></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$11$128 (div.if.false > \"\") + (div.else +> div.if.true > tpl.repeat x3 > ${msg})", function $11$128__div_if_false__________div_else____div_if_true___tpl_repeat_x3___$_msg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"false\"></div><div else if.bind=\"true\"><template repeat.for=\"i of 3\">${msg}</template></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$11$141 div.repeat x3 > (div.if.true > div.if.true > tpl.repeat x3 > ${msg})", function $11$141_div_repeat_x3____div_if_true___div_if_true___tpl_repeat_x3___$_msg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div repeat.for=\"i of 3\"><div if.bind=\"true\"><div if.bind=\"true\"><template repeat.for=\"i of 3\">${msg}</template></div></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$11$143 div.repeat x3 > (div.if.true > (div.if.false > \"\") : (div.else > tpl.repeat x3 > ${msg}))", function $11$143_div_repeat_x3____div_if_true____div_if_false__________div_else___tpl_repeat_x3___$_msg___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div repeat.for=\"i of 3\"><div if.bind=\"true\"><div if.bind=\"false\"></div><div else><template repeat.for=\"i of 3\">${msg}</template></div></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$11$145 div.repeat x3 > (div.else > div.else > tpl.repeat x3 > ${msg})", function $11$145_div_repeat_x3____div_else___div_else___tpl_repeat_x3___$_msg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div repeat.for=\"i of 3\"><div if.bind=\"false\"></div><div else><div if.bind=\"false\"></div><div else><template repeat.for=\"i of 3\">${msg}</template></div></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$11$147 div.repeat x3 > ((div.if.false > \"\") + (div.else > div.if.true > tpl.repeat x3 > ${msg}))", function $11$147_div_repeat_x3_____div_if_false__________div_else___div_if_true___tpl_repeat_x3___$_msg___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div repeat.for=\"i of 3\"><div if.bind=\"false\"></div><div else><div if.bind=\"true\"><template repeat.for=\"i of 3\">${msg}</template></div></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$11$148 div.repeat x3 > ((div.if.false > \"\") + (div.else +> div.if.true > tpl.repeat x3 > ${msg}))", function $11$148_div_repeat_x3_____div_if_false__________div_else____div_if_true___tpl_repeat_x3___$_msg___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div repeat.for=\"i of 3\"><div if.bind=\"false\"></div><div else if.bind=\"true\"><template repeat.for=\"i of 3\">${msg}</template></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$11$161 div.repeat x3 +> (div.if.true > div.if.true > tpl.repeat x3 > ${msg})", function $11$161_div_repeat_x3_____div_if_true___div_if_true___tpl_repeat_x3___$_msg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div repeat.for=\"i of 3\" if.bind=\"true\"><div if.bind=\"true\"><template repeat.for=\"i of 3\">${msg}</template></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$11$162 div.if.true +> (div.repeat x3 > div.if.true > tpl.repeat x3 > ${msg})", function $11$162_div_if_true_____div_repeat_x3___div_if_true___tpl_repeat_x3___$_msg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\" repeat.for=\"i of 3\"><div if.bind=\"true\"><template repeat.for=\"i of 3\">${msg}</template></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$11$163 div.if.true > (div.repeat x3 +> (div.if.true > tpl.repeat x3 > ${msg}))", function $11$163_div_if_true____div_repeat_x3_____div_if_true___tpl_repeat_x3___$_msg___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\"><div repeat.for=\"i of 3\" if.bind=\"true\"><template repeat.for=\"i of 3\">${msg}</template></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$11$164 div.if.true +> (div.if.true +> div.repeat x3 > tpl.repeat x3 > ${msg})", function $11$164_div_if_true_____div_if_true____div_repeat_x3___tpl_repeat_x3___$_msg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\"><div if.bind=\"true\" repeat.for=\"i of 3\"><template repeat.for=\"i of 3\">${msg}</template></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$11$165 div.repeat x3 +> (div.if.true > (div.repeat x3 +> (div.if.true > tpl.repeat x3 > ${msg})))", function $11$165_div_repeat_x3_____div_if_true____div_repeat_x3_____div_if_true___tpl_repeat_x3___$_msg____() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div repeat.for=\"i of 3\" if.bind=\"true\"><div repeat.for=\"i of 3\" if.bind=\"true\"><template repeat.for=\"i of 3\">${msg}</template></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaaaaaaaaaaaaaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$11$166 div.if.true +> (div.repeat x3 > (div.repeat x3 +> (div.if.true > tpl.repeat x3 > ${msg})))", function $11$166_div_if_true_____div_repeat_x3____div_repeat_x3_____div_if_true___tpl_repeat_x3___$_msg____() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\" repeat.for=\"i of 3\"><div repeat.for=\"i of 3\" if.bind=\"true\"><template repeat.for=\"i of 3\">${msg}</template></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaaaaaaaaaaaaaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$11$167 div.repeat x3 +> (div.if.true > (div.if.true +> div.repeat x3 > tpl.repeat x3 > ${msg}))", function $11$167_div_repeat_x3_____div_if_true____div_if_true____div_repeat_x3___tpl_repeat_x3___$_msg___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div repeat.for=\"i of 3\" if.bind=\"true\"><div if.bind=\"true\" repeat.for=\"i of 3\"><template repeat.for=\"i of 3\">${msg}</template></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaaaaaaaaaaaaaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$11$168 div.if.true +> (div.repeat x3 > (div.if.true +> div.repeat x3 > tpl.repeat x3 > ${msg}))", function $11$168_div_if_true_____div_repeat_x3____div_if_true____div_repeat_x3___tpl_repeat_x3___$_msg___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\" repeat.for=\"i of 3\"><div if.bind=\"true\" repeat.for=\"i of 3\"><template repeat.for=\"i of 3\">${msg}</template></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaaaaaaaaaaaaaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$11$201 (div.if.true > tpl.repeat x3 > ${msg}) + (else > tpl.repeat x3 > \"b\")", function $11$201__div_if_true___tpl_repeat_x3___$_msg______else___tpl_repeat_x3____b__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\"><template repeat.for=\"i of 3\">${msg}</template></div><div else><template repeat.for=\"i of 3\">b</template></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$11$202 (div.if.false > tpl.repeat x3 > \"b\") + (div.else > tpl.repeat x3 > ${msg})", function $11$202__div_if_false___tpl_repeat_x3____b______div_else___tpl_repeat_x3___$_msg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"false\"><template repeat.for=\"i of 3\">b</template></div><div else><template repeat.for=\"i of 3\">${msg}</template></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$11$221 div.if.true > ((div.if.true > tpl.repeat x3 > ${msg}) + (else > tpl.repeat x3 > \"b\"))", function $11$221_div_if_true_____div_if_true___tpl_repeat_x3___$_msg______else___tpl_repeat_x3____b___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\"><div if.bind=\"true\"><template repeat.for=\"i of 3\">${msg}</template></div><div else><template repeat.for=\"i of 3\">b</template></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$11$222 (div.if.true > ((div.if.true > tpl.repeat x3 > ${msg}) + (else > tpl.repeat x3 > \"b\"))) + (else > tpl.repeat x3 > \"b\")", function $11$222__div_if_true_____div_if_true___tpl_repeat_x3___$_msg______else___tpl_repeat_x3____b________else___tpl_repeat_x3____b__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\"><div if.bind=\"true\"><template repeat.for=\"i of 3\">${msg}</template></div><div else><template repeat.for=\"i of 3\">b</template></div></div><div else><template repeat.for=\"i of 3\">b</template></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$11$223 div.if.true > ((div.if.false > tpl.repeat x3 > \"b\") + (else > tpl.repeat x3 > ${msg}))", function $11$223_div_if_true_____div_if_false___tpl_repeat_x3____b______else___tpl_repeat_x3___$_msg___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\"><div if.bind=\"false\"><template repeat.for=\"i of 3\">b</template></div><div else><template repeat.for=\"i of 3\">${msg}</template></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$11$224 (div.if.true > ((div.if.false > tpl.repeat x3 > \"b\") + (else > tpl.repeat x3 > ${msg}))) + (else > tpl.repeat x3 > \"b\")", function $11$224__div_if_true_____div_if_false___tpl_repeat_x3____b______else___tpl_repeat_x3___$_msg________else___tpl_repeat_x3____b__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\"><div if.bind=\"false\"><template repeat.for=\"i of 3\">b</template></div><div else><template repeat.for=\"i of 3\">${msg}</template></div></div><div else><template repeat.for=\"i of 3\">b</template></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$11$225 (div.if.false > \"\") + (div.else > (if.bind=\"false\" > tpl.repeat x3 > \"b\") + (div.else > tpl.repeat x3 > ${msg}))", function $11$225__div_if_false__________div_else____if_bind__false____tpl_repeat_x3____b______div_else___tpl_repeat_x3___$_msg___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"false\"></div><div else><div if.bind=\"false\"><template repeat.for=\"i of 3\">b</template></div><div else><template repeat.for=\"i of 3\">${msg}</template></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$11$226 (div.if.false > tpl.repeat x3 > \"b\") + (div.else > (if.bind=\"false\" > tpl.repeat x3 > \"b\") + (div.else > tpl.repeat x3 > ${msg}))", function $11$226__div_if_false___tpl_repeat_x3____b______div_else____if_bind__false____tpl_repeat_x3____b______div_else___tpl_repeat_x3___$_msg___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"false\"><template repeat.for=\"i of 3\">b</template></div><div else><div if.bind=\"false\"><template repeat.for=\"i of 3\">b</template></div><div else><template repeat.for=\"i of 3\">${msg}</template></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$11$227 (div.if.false > tpl.repeat x3 > \"b\") + (div.else > (if.bind=\"true\" > tpl.repeat x3 > ${msg}))", function $11$227__div_if_false___tpl_repeat_x3____b______div_else____if_bind__true____tpl_repeat_x3___$_msg___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"false\"><template repeat.for=\"i of 3\">b</template></div><div else><div if.bind=\"true\"><template repeat.for=\"i of 3\">${msg}</template></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$11$228 (div.if.false > tpl.repeat x3 > \"b\") + (div.else +> div.if.true > tpl.repeat x3 > ${msg})", function $11$228__div_if_false___tpl_repeat_x3____b______div_else____div_if_true___tpl_repeat_x3___$_msg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"false\"><template repeat.for=\"i of 3\">b</template></div><div else if.bind=\"true\"><template repeat.for=\"i of 3\">${msg}</template></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
    });
    describe("$12$xxx template=tpl.repeat x3 > ${msg}, notTemplate=<template repeat.for=\"i of 3\">${notMsg}</template> (div)", function $12$xxx_template_tpl_repeat_x3___$_msg___notTemplate__template_repeat_for__i_of_3__$_notMsg___template___div_() {
        it("$12$201 (div.if.true > tpl.repeat x3 > ${msg}) + (else > tpl.repeat x3 > ${notMsg})", function $12$201__div_if_true___tpl_repeat_x3___$_msg______else___tpl_repeat_x3___$_notMsg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\"><template repeat.for=\"i of 3\">${msg}</template></div><div else><template repeat.for=\"i of 3\">${notMsg}</template></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$12$202 (div.if.false > tpl.repeat x3 > ${notMsg}) + (div.else > tpl.repeat x3 > ${msg})", function $12$202__div_if_false___tpl_repeat_x3___$_notMsg______div_else___tpl_repeat_x3___$_msg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"false\"><template repeat.for=\"i of 3\">${notMsg}</template></div><div else><template repeat.for=\"i of 3\">${msg}</template></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$12$221 div.if.true > ((div.if.true > tpl.repeat x3 > ${msg}) + (else > tpl.repeat x3 > ${notMsg}))", function $12$221_div_if_true_____div_if_true___tpl_repeat_x3___$_msg______else___tpl_repeat_x3___$_notMsg___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\"><div if.bind=\"true\"><template repeat.for=\"i of 3\">${msg}</template></div><div else><template repeat.for=\"i of 3\">${notMsg}</template></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$12$222 (div.if.true > ((div.if.true > tpl.repeat x3 > ${msg}) + (else > tpl.repeat x3 > ${notMsg}))) + (else > tpl.repeat x3 > ${notMsg})", function $12$222__div_if_true_____div_if_true___tpl_repeat_x3___$_msg______else___tpl_repeat_x3___$_notMsg________else___tpl_repeat_x3___$_notMsg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\"><div if.bind=\"true\"><template repeat.for=\"i of 3\">${msg}</template></div><div else><template repeat.for=\"i of 3\">${notMsg}</template></div></div><div else><template repeat.for=\"i of 3\">${notMsg}</template></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$12$223 div.if.true > ((div.if.false > tpl.repeat x3 > ${notMsg}) + (else > tpl.repeat x3 > ${msg}))", function $12$223_div_if_true_____div_if_false___tpl_repeat_x3___$_notMsg______else___tpl_repeat_x3___$_msg___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\"><div if.bind=\"false\"><template repeat.for=\"i of 3\">${notMsg}</template></div><div else><template repeat.for=\"i of 3\">${msg}</template></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$12$224 (div.if.true > ((div.if.false > tpl.repeat x3 > ${notMsg}) + (else > tpl.repeat x3 > ${msg}))) + (else > tpl.repeat x3 > ${notMsg})", function $12$224__div_if_true_____div_if_false___tpl_repeat_x3___$_notMsg______else___tpl_repeat_x3___$_msg________else___tpl_repeat_x3___$_notMsg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"true\"><div if.bind=\"false\"><template repeat.for=\"i of 3\">${notMsg}</template></div><div else><template repeat.for=\"i of 3\">${msg}</template></div></div><div else><template repeat.for=\"i of 3\">${notMsg}</template></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$12$225 (div.if.false > \"\") + (div.else > (if.bind=\"false\" > tpl.repeat x3 > ${notMsg}) + (div.else > tpl.repeat x3 > ${msg}))", function $12$225__div_if_false__________div_else____if_bind__false____tpl_repeat_x3___$_notMsg______div_else___tpl_repeat_x3___$_msg___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"false\"></div><div else><div if.bind=\"false\"><template repeat.for=\"i of 3\">${notMsg}</template></div><div else><template repeat.for=\"i of 3\">${msg}</template></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$12$226 (div.if.false > tpl.repeat x3 > ${notMsg}) + (div.else > (if.bind=\"false\" > tpl.repeat x3 > ${notMsg}) + (div.else > tpl.repeat x3 > ${msg}))", function $12$226__div_if_false___tpl_repeat_x3___$_notMsg______div_else____if_bind__false____tpl_repeat_x3___$_notMsg______div_else___tpl_repeat_x3___$_msg___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"false\"><template repeat.for=\"i of 3\">${notMsg}</template></div><div else><div if.bind=\"false\"><template repeat.for=\"i of 3\">${notMsg}</template></div><div else><template repeat.for=\"i of 3\">${msg}</template></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$12$227 (div.if.false > tpl.repeat x3 > ${notMsg}) + (div.else > (if.bind=\"true\" > tpl.repeat x3 > ${msg}))", function $12$227__div_if_false___tpl_repeat_x3___$_notMsg______div_else____if_bind__true____tpl_repeat_x3___$_msg___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"false\"><template repeat.for=\"i of 3\">${notMsg}</template></div><div else><div if.bind=\"true\"><template repeat.for=\"i of 3\">${msg}</template></div></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$12$228 (div.if.false > tpl.repeat x3 > ${notMsg}) + (div.else +> div.if.true > tpl.repeat x3 > ${msg})", function $12$228__div_if_false___tpl_repeat_x3___$_notMsg______div_else____div_if_true___tpl_repeat_x3___$_msg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<div><div if.bind=\"false\"><template repeat.for=\"i of 3\">${notMsg}</template></div><div else if.bind=\"true\"><template repeat.for=\"i of 3\">${msg}</template></div></div>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
    });
    describe("$01$xxx template=\"a\", notTemplate=b (tpl)", function $01$xxx_template__a___notTemplate_b__tpl_() {
        it("$01$001 \"a\"", function $01$001__a_() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template>a</template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$01$101 tpl.if.true > \"a\"", function $01$101_tpl_if_true____a_() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\">a</template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$01$102 (tpl.if.false > \"\") + (tpl.else > \"a\")", function $01$102__tpl_if_false__________tpl_else____a__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"false\"></template><template else>a</template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$01$103 tpl.if.true +> tpl.repeat x3 > \"a\"", function $01$103_tpl_if_true____tpl_repeat_x3____a_() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\" repeat.for=\"i of 3\">a</template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$01$104 (tpl.if.false > \"\") + (tpl.else +> tpl.repeat x3 > \"a\")", function $01$104__tpl_if_false__________tpl_else____tpl_repeat_x3____a__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"false\"></template><template else repeat.for=\"i of 3\">a</template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$01$105 tpl.repeat x3 +> tpl.if.true > \"a\"", function $01$105_tpl_repeat_x3____tpl_if_true____a_() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template repeat.for=\"i of 3\" if.bind=\"true\">a</template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$01$106 tpl.repeat x3 > tpl.if.true > \"a\"", function $01$106_tpl_repeat_x3___tpl_if_true____a_() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template repeat.for=\"i of 3\"><template if.bind=\"true\">a</template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$01$107 (tpl.if.false > \"\") + (tpl.else)", function $01$107__tpl_if_false__________tpl_else_() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template repeat.for=\"i of 3\"><template if.bind=\"false\"></template><template else>a</template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$01$121 tpl.if.true > tpl.if.true > \"a\"", function $01$121_tpl_if_true___tpl_if_true____a_() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\"><template if.bind=\"true\">a</template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$01$123 tpl.if.true > (tpl.if.false > \"\") : (tpl.else > \"a\")", function $01$123_tpl_if_true____tpl_if_false__________tpl_else____a__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\"><template if.bind=\"false\"></template><template else>a</template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$01$125 tpl.else > tpl.else > \"a\"", function $01$125_tpl_else___tpl_else____a_() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"false\"></template><template else><template if.bind=\"false\"></template><template else>a</template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$01$127 (tpl.if.false > \"\") + (tpl.else > tpl.if.true > \"a\")", function $01$127__tpl_if_false__________tpl_else___tpl_if_true____a__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"false\"></template><template else><template if.bind=\"true\">a</template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$01$128 (tpl.if.false > \"\") + (tpl.else +> tpl.if.true > \"a\")", function $01$128__tpl_if_false__________tpl_else____tpl_if_true____a__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"false\"></template><template else if.bind=\"true\">a</template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$01$141 tpl.repeat x3 > (tpl.if.true > tpl.if.true > \"a\")", function $01$141_tpl_repeat_x3____tpl_if_true___tpl_if_true____a__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template repeat.for=\"i of 3\"><template if.bind=\"true\"><template if.bind=\"true\">a</template></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$01$143 tpl.repeat x3 > (tpl.if.true > (tpl.if.false > \"\") : (tpl.else > \"a\"))", function $01$143_tpl_repeat_x3____tpl_if_true____tpl_if_false__________tpl_else____a___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template repeat.for=\"i of 3\"><template if.bind=\"true\"><template if.bind=\"false\"></template><template else>a</template></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$01$145 tpl.repeat x3 > (tpl.else > tpl.else > \"a\")", function $01$145_tpl_repeat_x3____tpl_else___tpl_else____a__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template repeat.for=\"i of 3\"><template if.bind=\"false\"></template><template else><template if.bind=\"false\"></template><template else>a</template></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$01$147 tpl.repeat x3 > ((tpl.if.false > \"\") + (tpl.else > tpl.if.true > \"a\"))", function $01$147_tpl_repeat_x3_____tpl_if_false__________tpl_else___tpl_if_true____a___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template repeat.for=\"i of 3\"><template if.bind=\"false\"></template><template else><template if.bind=\"true\">a</template></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$01$148 tpl.repeat x3 > ((tpl.if.false > \"\") + (tpl.else +> tpl.if.true > \"a\"))", function $01$148_tpl_repeat_x3_____tpl_if_false__________tpl_else____tpl_if_true____a___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template repeat.for=\"i of 3\"><template if.bind=\"false\"></template><template else if.bind=\"true\">a</template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$01$161 tpl.repeat x3 +> (tpl.if.true > tpl.if.true > \"a\")", function $01$161_tpl_repeat_x3_____tpl_if_true___tpl_if_true____a__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template repeat.for=\"i of 3\" if.bind=\"true\"><template if.bind=\"true\">a</template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$01$162 tpl.if.true +> (tpl.repeat x3 > tpl.if.true > \"a\")", function $01$162_tpl_if_true_____tpl_repeat_x3___tpl_if_true____a__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\" repeat.for=\"i of 3\"><template if.bind=\"true\">a</template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$01$163 tpl.if.true > (tpl.repeat x3 +> (tpl.if.true > \"a\"))", function $01$163_tpl_if_true____tpl_repeat_x3_____tpl_if_true____a___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\"><template repeat.for=\"i of 3\" if.bind=\"true\">a</template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$01$164 tpl.if.true +> (tpl.if.true +> tpl.repeat x3 > \"a\")", function $01$164_tpl_if_true_____tpl_if_true____tpl_repeat_x3____a__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\"><template if.bind=\"true\" repeat.for=\"i of 3\">a</template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$01$165 tpl.repeat x3 +> (tpl.if.true > (tpl.repeat x3 +> (tpl.if.true > \"a\")))", function $01$165_tpl_repeat_x3_____tpl_if_true____tpl_repeat_x3_____tpl_if_true____a____() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template repeat.for=\"i of 3\" if.bind=\"true\"><template repeat.for=\"i of 3\" if.bind=\"true\">a</template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$01$166 tpl.if.true +> (tpl.repeat x3 > (tpl.repeat x3 +> (tpl.if.true > \"a\")))", function $01$166_tpl_if_true_____tpl_repeat_x3____tpl_repeat_x3_____tpl_if_true____a____() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\" repeat.for=\"i of 3\"><template repeat.for=\"i of 3\" if.bind=\"true\">a</template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$01$167 tpl.repeat x3 +> (tpl.if.true > (tpl.if.true +> tpl.repeat x3 > \"a\"))", function $01$167_tpl_repeat_x3_____tpl_if_true____tpl_if_true____tpl_repeat_x3____a___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template repeat.for=\"i of 3\" if.bind=\"true\"><template if.bind=\"true\" repeat.for=\"i of 3\">a</template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$01$168 tpl.if.true +> (tpl.repeat x3 > (tpl.if.true +> tpl.repeat x3 > \"a\"))", function $01$168_tpl_if_true_____tpl_repeat_x3____tpl_if_true____tpl_repeat_x3____a___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\" repeat.for=\"i of 3\"><template if.bind=\"true\" repeat.for=\"i of 3\">a</template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$01$201 (tpl.if.true > \"a\") + (else > \"b\")", function $01$201__tpl_if_true____a______else____b__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\">a</template><template else>b</template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$01$202 (tpl.if.false > \"b\") + (tpl.else > \"a\")", function $01$202__tpl_if_false____b______tpl_else____a__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"false\">b</template><template else>a</template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$01$221 tpl.if.true > ((tpl.if.true > \"a\") + (else > \"b\"))", function $01$221_tpl_if_true_____tpl_if_true____a______else____b___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\"><template if.bind=\"true\">a</template><template else>b</template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$01$222 (tpl.if.true > ((tpl.if.true > \"a\") + (else > \"b\"))) + (else > \"b\")", function $01$222__tpl_if_true_____tpl_if_true____a______else____b________else____b__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\"><template if.bind=\"true\">a</template><template else>b</template></template><template else>b</template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$01$223 tpl.if.true > ((tpl.if.false > \"b\") + (else > \"a\"))", function $01$223_tpl_if_true_____tpl_if_false____b______else____a___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\"><template if.bind=\"false\">b</template><template else>a</template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$01$224 (tpl.if.true > ((tpl.if.false > \"b\") + (else > \"a\"))) + (else > \"b\")", function $01$224__tpl_if_true_____tpl_if_false____b______else____a________else____b__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\"><template if.bind=\"false\">b</template><template else>a</template></template><template else>b</template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$01$225 (tpl.if.false > \"\") + (tpl.else > (if.bind=\"false\" > \"b\") + (tpl.else > \"a\"))", function $01$225__tpl_if_false__________tpl_else____if_bind__false_____b______tpl_else____a___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"false\"></template><template else><template if.bind=\"false\">b</template><template else>a</template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$01$226 (tpl.if.false > \"b\") + (tpl.else > (if.bind=\"false\" > \"b\") + (tpl.else > \"a\"))", function $01$226__tpl_if_false____b______tpl_else____if_bind__false_____b______tpl_else____a___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"false\">b</template><template else><template if.bind=\"false\">b</template><template else>a</template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$01$227 (tpl.if.false > \"b\") + (tpl.else > (if.bind=\"true\" > \"a\"))", function $01$227__tpl_if_false____b______tpl_else____if_bind__true_____a___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"false\">b</template><template else><template if.bind=\"true\">a</template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$01$228 (tpl.if.false > \"b\") + (tpl.else +> tpl.if.true > \"a\")", function $01$228__tpl_if_false____b______tpl_else____tpl_if_true____a__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"false\">b</template><template else if.bind=\"true\">a</template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
    });
    describe("$02$xxx template=\"a\", notTemplate=${notMsg} (tpl)", function $02$xxx_template__a___notTemplate_$_notMsg___tpl_() {
        it("$02$201 (tpl.if.true > \"a\") + (else > ${notMsg})", function $02$201__tpl_if_true____a______else___$_notMsg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\">a</template><template else>${notMsg}</template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$02$202 (tpl.if.false > ${notMsg}) + (tpl.else > \"a\")", function $02$202__tpl_if_false___$_notMsg______tpl_else____a__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"false\">${notMsg}</template><template else>a</template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$02$221 tpl.if.true > ((tpl.if.true > \"a\") + (else > ${notMsg}))", function $02$221_tpl_if_true_____tpl_if_true____a______else___$_notMsg___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\"><template if.bind=\"true\">a</template><template else>${notMsg}</template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$02$222 (tpl.if.true > ((tpl.if.true > \"a\") + (else > ${notMsg}))) + (else > ${notMsg})", function $02$222__tpl_if_true_____tpl_if_true____a______else___$_notMsg________else___$_notMsg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\"><template if.bind=\"true\">a</template><template else>${notMsg}</template></template><template else>${notMsg}</template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$02$223 tpl.if.true > ((tpl.if.false > ${notMsg}) + (else > \"a\"))", function $02$223_tpl_if_true_____tpl_if_false___$_notMsg______else____a___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\"><template if.bind=\"false\">${notMsg}</template><template else>a</template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$02$224 (tpl.if.true > ((tpl.if.false > ${notMsg}) + (else > \"a\"))) + (else > ${notMsg})", function $02$224__tpl_if_true_____tpl_if_false___$_notMsg______else____a________else___$_notMsg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\"><template if.bind=\"false\">${notMsg}</template><template else>a</template></template><template else>${notMsg}</template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$02$225 (tpl.if.false > \"\") + (tpl.else > (if.bind=\"false\" > ${notMsg}) + (tpl.else > \"a\"))", function $02$225__tpl_if_false__________tpl_else____if_bind__false____$_notMsg______tpl_else____a___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"false\"></template><template else><template if.bind=\"false\">${notMsg}</template><template else>a</template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$02$226 (tpl.if.false > ${notMsg}) + (tpl.else > (if.bind=\"false\" > ${notMsg}) + (tpl.else > \"a\"))", function $02$226__tpl_if_false___$_notMsg______tpl_else____if_bind__false____$_notMsg______tpl_else____a___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"false\">${notMsg}</template><template else><template if.bind=\"false\">${notMsg}</template><template else>a</template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$02$227 (tpl.if.false > ${notMsg}) + (tpl.else > (if.bind=\"true\" > \"a\"))", function $02$227__tpl_if_false___$_notMsg______tpl_else____if_bind__true_____a___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"false\">${notMsg}</template><template else><template if.bind=\"true\">a</template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$02$228 (tpl.if.false > ${notMsg}) + (tpl.else +> tpl.if.true > \"a\")", function $02$228__tpl_if_false___$_notMsg______tpl_else____tpl_if_true____a__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"false\">${notMsg}</template><template else if.bind=\"true\">a</template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
    });
    describe("$03$xxx template=${msg}, notTemplate=b (tpl)", function $03$xxx_template_$_msg___notTemplate_b__tpl_() {
        it("$03$001 ${msg}", function $03$001_$_msg_() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template>${msg}</template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$03$101 tpl.if.true > ${msg}", function $03$101_tpl_if_true___$_msg_() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\">${msg}</template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$03$102 (tpl.if.false > \"\") + (tpl.else > ${msg})", function $03$102__tpl_if_false__________tpl_else___$_msg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"false\"></template><template else>${msg}</template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$03$103 tpl.if.true +> tpl.repeat x3 > ${msg}", function $03$103_tpl_if_true____tpl_repeat_x3___$_msg_() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\" repeat.for=\"i of 3\">${msg}</template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$03$104 (tpl.if.false > \"\") + (tpl.else +> tpl.repeat x3 > ${msg})", function $03$104__tpl_if_false__________tpl_else____tpl_repeat_x3___$_msg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"false\"></template><template else repeat.for=\"i of 3\">${msg}</template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$03$105 tpl.repeat x3 +> tpl.if.true > ${msg}", function $03$105_tpl_repeat_x3____tpl_if_true___$_msg_() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template repeat.for=\"i of 3\" if.bind=\"true\">${msg}</template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$03$106 tpl.repeat x3 > tpl.if.true > ${msg}", function $03$106_tpl_repeat_x3___tpl_if_true___$_msg_() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template repeat.for=\"i of 3\"><template if.bind=\"true\">${msg}</template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$03$107 (tpl.if.false > \"\") + (tpl.else)", function $03$107__tpl_if_false__________tpl_else_() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template repeat.for=\"i of 3\"><template if.bind=\"false\"></template><template else>${msg}</template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$03$121 tpl.if.true > tpl.if.true > ${msg}", function $03$121_tpl_if_true___tpl_if_true___$_msg_() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\"><template if.bind=\"true\">${msg}</template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$03$123 tpl.if.true > (tpl.if.false > \"\") : (tpl.else > ${msg})", function $03$123_tpl_if_true____tpl_if_false__________tpl_else___$_msg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\"><template if.bind=\"false\"></template><template else>${msg}</template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$03$125 tpl.else > tpl.else > ${msg}", function $03$125_tpl_else___tpl_else___$_msg_() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"false\"></template><template else><template if.bind=\"false\"></template><template else>${msg}</template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$03$127 (tpl.if.false > \"\") + (tpl.else > tpl.if.true > ${msg})", function $03$127__tpl_if_false__________tpl_else___tpl_if_true___$_msg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"false\"></template><template else><template if.bind=\"true\">${msg}</template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$03$128 (tpl.if.false > \"\") + (tpl.else +> tpl.if.true > ${msg})", function $03$128__tpl_if_false__________tpl_else____tpl_if_true___$_msg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"false\"></template><template else if.bind=\"true\">${msg}</template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$03$141 tpl.repeat x3 > (tpl.if.true > tpl.if.true > ${msg})", function $03$141_tpl_repeat_x3____tpl_if_true___tpl_if_true___$_msg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template repeat.for=\"i of 3\"><template if.bind=\"true\"><template if.bind=\"true\">${msg}</template></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$03$143 tpl.repeat x3 > (tpl.if.true > (tpl.if.false > \"\") : (tpl.else > ${msg}))", function $03$143_tpl_repeat_x3____tpl_if_true____tpl_if_false__________tpl_else___$_msg___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template repeat.for=\"i of 3\"><template if.bind=\"true\"><template if.bind=\"false\"></template><template else>${msg}</template></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$03$145 tpl.repeat x3 > (tpl.else > tpl.else > ${msg})", function $03$145_tpl_repeat_x3____tpl_else___tpl_else___$_msg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template repeat.for=\"i of 3\"><template if.bind=\"false\"></template><template else><template if.bind=\"false\"></template><template else>${msg}</template></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$03$147 tpl.repeat x3 > ((tpl.if.false > \"\") + (tpl.else > tpl.if.true > ${msg}))", function $03$147_tpl_repeat_x3_____tpl_if_false__________tpl_else___tpl_if_true___$_msg___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template repeat.for=\"i of 3\"><template if.bind=\"false\"></template><template else><template if.bind=\"true\">${msg}</template></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$03$148 tpl.repeat x3 > ((tpl.if.false > \"\") + (tpl.else +> tpl.if.true > ${msg}))", function $03$148_tpl_repeat_x3_____tpl_if_false__________tpl_else____tpl_if_true___$_msg___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template repeat.for=\"i of 3\"><template if.bind=\"false\"></template><template else if.bind=\"true\">${msg}</template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$03$161 tpl.repeat x3 +> (tpl.if.true > tpl.if.true > ${msg})", function $03$161_tpl_repeat_x3_____tpl_if_true___tpl_if_true___$_msg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template repeat.for=\"i of 3\" if.bind=\"true\"><template if.bind=\"true\">${msg}</template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$03$162 tpl.if.true +> (tpl.repeat x3 > tpl.if.true > ${msg})", function $03$162_tpl_if_true_____tpl_repeat_x3___tpl_if_true___$_msg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\" repeat.for=\"i of 3\"><template if.bind=\"true\">${msg}</template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$03$163 tpl.if.true > (tpl.repeat x3 +> (tpl.if.true > ${msg}))", function $03$163_tpl_if_true____tpl_repeat_x3_____tpl_if_true___$_msg___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\"><template repeat.for=\"i of 3\" if.bind=\"true\">${msg}</template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$03$164 tpl.if.true +> (tpl.if.true +> tpl.repeat x3 > ${msg})", function $03$164_tpl_if_true_____tpl_if_true____tpl_repeat_x3___$_msg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\"><template if.bind=\"true\" repeat.for=\"i of 3\">${msg}</template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$03$165 tpl.repeat x3 +> (tpl.if.true > (tpl.repeat x3 +> (tpl.if.true > ${msg})))", function $03$165_tpl_repeat_x3_____tpl_if_true____tpl_repeat_x3_____tpl_if_true___$_msg____() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template repeat.for=\"i of 3\" if.bind=\"true\"><template repeat.for=\"i of 3\" if.bind=\"true\">${msg}</template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$03$166 tpl.if.true +> (tpl.repeat x3 > (tpl.repeat x3 +> (tpl.if.true > ${msg})))", function $03$166_tpl_if_true_____tpl_repeat_x3____tpl_repeat_x3_____tpl_if_true___$_msg____() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\" repeat.for=\"i of 3\"><template repeat.for=\"i of 3\" if.bind=\"true\">${msg}</template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$03$167 tpl.repeat x3 +> (tpl.if.true > (tpl.if.true +> tpl.repeat x3 > ${msg}))", function $03$167_tpl_repeat_x3_____tpl_if_true____tpl_if_true____tpl_repeat_x3___$_msg___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template repeat.for=\"i of 3\" if.bind=\"true\"><template if.bind=\"true\" repeat.for=\"i of 3\">${msg}</template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$03$168 tpl.if.true +> (tpl.repeat x3 > (tpl.if.true +> tpl.repeat x3 > ${msg}))", function $03$168_tpl_if_true_____tpl_repeat_x3____tpl_if_true____tpl_repeat_x3___$_msg___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\" repeat.for=\"i of 3\"><template if.bind=\"true\" repeat.for=\"i of 3\">${msg}</template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$03$201 (tpl.if.true > ${msg}) + (else > \"b\")", function $03$201__tpl_if_true___$_msg______else____b__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\">${msg}</template><template else>b</template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$03$202 (tpl.if.false > \"b\") + (tpl.else > ${msg})", function $03$202__tpl_if_false____b______tpl_else___$_msg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"false\">b</template><template else>${msg}</template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$03$221 tpl.if.true > ((tpl.if.true > ${msg}) + (else > \"b\"))", function $03$221_tpl_if_true_____tpl_if_true___$_msg______else____b___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\"><template if.bind=\"true\">${msg}</template><template else>b</template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$03$222 (tpl.if.true > ((tpl.if.true > ${msg}) + (else > \"b\"))) + (else > \"b\")", function $03$222__tpl_if_true_____tpl_if_true___$_msg______else____b________else____b__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\"><template if.bind=\"true\">${msg}</template><template else>b</template></template><template else>b</template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$03$223 tpl.if.true > ((tpl.if.false > \"b\") + (else > ${msg}))", function $03$223_tpl_if_true_____tpl_if_false____b______else___$_msg___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\"><template if.bind=\"false\">b</template><template else>${msg}</template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$03$224 (tpl.if.true > ((tpl.if.false > \"b\") + (else > ${msg}))) + (else > \"b\")", function $03$224__tpl_if_true_____tpl_if_false____b______else___$_msg________else____b__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\"><template if.bind=\"false\">b</template><template else>${msg}</template></template><template else>b</template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$03$225 (tpl.if.false > \"\") + (tpl.else > (if.bind=\"false\" > \"b\") + (tpl.else > ${msg}))", function $03$225__tpl_if_false__________tpl_else____if_bind__false_____b______tpl_else___$_msg___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"false\"></template><template else><template if.bind=\"false\">b</template><template else>${msg}</template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$03$226 (tpl.if.false > \"b\") + (tpl.else > (if.bind=\"false\" > \"b\") + (tpl.else > ${msg}))", function $03$226__tpl_if_false____b______tpl_else____if_bind__false_____b______tpl_else___$_msg___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"false\">b</template><template else><template if.bind=\"false\">b</template><template else>${msg}</template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$03$227 (tpl.if.false > \"b\") + (tpl.else > (if.bind=\"true\" > ${msg}))", function $03$227__tpl_if_false____b______tpl_else____if_bind__true____$_msg___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"false\">b</template><template else><template if.bind=\"true\">${msg}</template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$03$228 (tpl.if.false > \"b\") + (tpl.else +> tpl.if.true > ${msg})", function $03$228__tpl_if_false____b______tpl_else____tpl_if_true___$_msg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"false\">b</template><template else if.bind=\"true\">${msg}</template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
    });
    describe("$04$xxx template=${msg}, notTemplate=${notMsg} (tpl)", function $04$xxx_template_$_msg___notTemplate_$_notMsg___tpl_() {
        it("$04$201 (tpl.if.true > ${msg}) + (else > ${notMsg})", function $04$201__tpl_if_true___$_msg______else___$_notMsg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\">${msg}</template><template else>${notMsg}</template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$04$202 (tpl.if.false > ${notMsg}) + (tpl.else > ${msg})", function $04$202__tpl_if_false___$_notMsg______tpl_else___$_msg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"false\">${notMsg}</template><template else>${msg}</template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$04$221 tpl.if.true > ((tpl.if.true > ${msg}) + (else > ${notMsg}))", function $04$221_tpl_if_true_____tpl_if_true___$_msg______else___$_notMsg___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\"><template if.bind=\"true\">${msg}</template><template else>${notMsg}</template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$04$222 (tpl.if.true > ((tpl.if.true > ${msg}) + (else > ${notMsg}))) + (else > ${notMsg})", function $04$222__tpl_if_true_____tpl_if_true___$_msg______else___$_notMsg________else___$_notMsg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\"><template if.bind=\"true\">${msg}</template><template else>${notMsg}</template></template><template else>${notMsg}</template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$04$223 tpl.if.true > ((tpl.if.false > ${notMsg}) + (else > ${msg}))", function $04$223_tpl_if_true_____tpl_if_false___$_notMsg______else___$_msg___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\"><template if.bind=\"false\">${notMsg}</template><template else>${msg}</template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$04$224 (tpl.if.true > ((tpl.if.false > ${notMsg}) + (else > ${msg}))) + (else > ${notMsg})", function $04$224__tpl_if_true_____tpl_if_false___$_notMsg______else___$_msg________else___$_notMsg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\"><template if.bind=\"false\">${notMsg}</template><template else>${msg}</template></template><template else>${notMsg}</template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$04$225 (tpl.if.false > \"\") + (tpl.else > (if.bind=\"false\" > ${notMsg}) + (tpl.else > ${msg}))", function $04$225__tpl_if_false__________tpl_else____if_bind__false____$_notMsg______tpl_else___$_msg___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"false\"></template><template else><template if.bind=\"false\">${notMsg}</template><template else>${msg}</template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$04$226 (tpl.if.false > ${notMsg}) + (tpl.else > (if.bind=\"false\" > ${notMsg}) + (tpl.else > ${msg}))", function $04$226__tpl_if_false___$_notMsg______tpl_else____if_bind__false____$_notMsg______tpl_else___$_msg___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"false\">${notMsg}</template><template else><template if.bind=\"false\">${notMsg}</template><template else>${msg}</template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$04$227 (tpl.if.false > ${notMsg}) + (tpl.else > (if.bind=\"true\" > ${msg}))", function $04$227__tpl_if_false___$_notMsg______tpl_else____if_bind__true____$_msg___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"false\">${notMsg}</template><template else><template if.bind=\"true\">${msg}</template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$04$228 (tpl.if.false > ${notMsg}) + (tpl.else +> tpl.if.true > ${msg})", function $04$228__tpl_if_false___$_notMsg______tpl_else____tpl_if_true___$_msg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"false\">${notMsg}</template><template else if.bind=\"true\">${msg}</template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("a", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
    });
    describe("$05$xxx template=div.repeat x3 > \"a\", notTemplate=<div repeat.for=\"i of 3\">b</div> (tpl)", function $05$xxx_template_div_repeat_x3____a___notTemplate__div_repeat_for__i_of_3__b__div___tpl_() {
        it("$05$001 div.repeat x3 > \"a\"", function $05$001_div_repeat_x3____a_() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><div repeat.for=\"i of 3\">a</div></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$05$101 tpl.if.true > div.repeat x3 > \"a\"", function $05$101_tpl_if_true___div_repeat_x3____a_() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\"><div repeat.for=\"i of 3\">a</div></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$05$102 (tpl.if.false > \"\") + (tpl.else > div.repeat x3 > \"a\")", function $05$102__tpl_if_false__________tpl_else___div_repeat_x3____a__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"false\"></template><template else><div repeat.for=\"i of 3\">a</div></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$05$103 tpl.if.true +> tpl.repeat x3 > div.repeat x3 > \"a\"", function $05$103_tpl_if_true____tpl_repeat_x3___div_repeat_x3____a_() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\" repeat.for=\"i of 3\"><div repeat.for=\"i of 3\">a</div></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$05$104 (tpl.if.false > \"\") + (tpl.else +> tpl.repeat x3 > div.repeat x3 > \"a\")", function $05$104__tpl_if_false__________tpl_else____tpl_repeat_x3___div_repeat_x3____a__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"false\"></template><template else repeat.for=\"i of 3\"><div repeat.for=\"i of 3\">a</div></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$05$105 tpl.repeat x3 +> tpl.if.true > div.repeat x3 > \"a\"", function $05$105_tpl_repeat_x3____tpl_if_true___div_repeat_x3____a_() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template repeat.for=\"i of 3\" if.bind=\"true\"><div repeat.for=\"i of 3\">a</div></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$05$106 tpl.repeat x3 > tpl.if.true > div.repeat x3 > \"a\"", function $05$106_tpl_repeat_x3___tpl_if_true___div_repeat_x3____a_() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template repeat.for=\"i of 3\"><template if.bind=\"true\"><div repeat.for=\"i of 3\">a</div></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$05$107 (tpl.if.false > \"\") + (tpl.else)", function $05$107__tpl_if_false__________tpl_else_() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template repeat.for=\"i of 3\"><template if.bind=\"false\"></template><template else><div repeat.for=\"i of 3\">a</div></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$05$121 tpl.if.true > tpl.if.true > div.repeat x3 > \"a\"", function $05$121_tpl_if_true___tpl_if_true___div_repeat_x3____a_() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\"><template if.bind=\"true\"><div repeat.for=\"i of 3\">a</div></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$05$123 tpl.if.true > (tpl.if.false > \"\") : (tpl.else > div.repeat x3 > \"a\")", function $05$123_tpl_if_true____tpl_if_false__________tpl_else___div_repeat_x3____a__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\"><template if.bind=\"false\"></template><template else><div repeat.for=\"i of 3\">a</div></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$05$125 tpl.else > tpl.else > div.repeat x3 > \"a\"", function $05$125_tpl_else___tpl_else___div_repeat_x3____a_() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"false\"></template><template else><template if.bind=\"false\"></template><template else><div repeat.for=\"i of 3\">a</div></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$05$127 (tpl.if.false > \"\") + (tpl.else > tpl.if.true > div.repeat x3 > \"a\")", function $05$127__tpl_if_false__________tpl_else___tpl_if_true___div_repeat_x3____a__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"false\"></template><template else><template if.bind=\"true\"><div repeat.for=\"i of 3\">a</div></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$05$128 (tpl.if.false > \"\") + (tpl.else +> tpl.if.true > div.repeat x3 > \"a\")", function $05$128__tpl_if_false__________tpl_else____tpl_if_true___div_repeat_x3____a__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"false\"></template><template else if.bind=\"true\"><div repeat.for=\"i of 3\">a</div></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$05$141 tpl.repeat x3 > (tpl.if.true > tpl.if.true > div.repeat x3 > \"a\")", function $05$141_tpl_repeat_x3____tpl_if_true___tpl_if_true___div_repeat_x3____a__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template repeat.for=\"i of 3\"><template if.bind=\"true\"><template if.bind=\"true\"><div repeat.for=\"i of 3\">a</div></template></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$05$143 tpl.repeat x3 > (tpl.if.true > (tpl.if.false > \"\") : (tpl.else > div.repeat x3 > \"a\"))", function $05$143_tpl_repeat_x3____tpl_if_true____tpl_if_false__________tpl_else___div_repeat_x3____a___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template repeat.for=\"i of 3\"><template if.bind=\"true\"><template if.bind=\"false\"></template><template else><div repeat.for=\"i of 3\">a</div></template></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$05$145 tpl.repeat x3 > (tpl.else > tpl.else > div.repeat x3 > \"a\")", function $05$145_tpl_repeat_x3____tpl_else___tpl_else___div_repeat_x3____a__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template repeat.for=\"i of 3\"><template if.bind=\"false\"></template><template else><template if.bind=\"false\"></template><template else><div repeat.for=\"i of 3\">a</div></template></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$05$147 tpl.repeat x3 > ((tpl.if.false > \"\") + (tpl.else > tpl.if.true > div.repeat x3 > \"a\"))", function $05$147_tpl_repeat_x3_____tpl_if_false__________tpl_else___tpl_if_true___div_repeat_x3____a___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template repeat.for=\"i of 3\"><template if.bind=\"false\"></template><template else><template if.bind=\"true\"><div repeat.for=\"i of 3\">a</div></template></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$05$148 tpl.repeat x3 > ((tpl.if.false > \"\") + (tpl.else +> tpl.if.true > div.repeat x3 > \"a\"))", function $05$148_tpl_repeat_x3_____tpl_if_false__________tpl_else____tpl_if_true___div_repeat_x3____a___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template repeat.for=\"i of 3\"><template if.bind=\"false\"></template><template else if.bind=\"true\"><div repeat.for=\"i of 3\">a</div></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$05$161 tpl.repeat x3 +> (tpl.if.true > tpl.if.true > div.repeat x3 > \"a\")", function $05$161_tpl_repeat_x3_____tpl_if_true___tpl_if_true___div_repeat_x3____a__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template repeat.for=\"i of 3\" if.bind=\"true\"><template if.bind=\"true\"><div repeat.for=\"i of 3\">a</div></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$05$162 tpl.if.true +> (tpl.repeat x3 > tpl.if.true > div.repeat x3 > \"a\")", function $05$162_tpl_if_true_____tpl_repeat_x3___tpl_if_true___div_repeat_x3____a__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\" repeat.for=\"i of 3\"><template if.bind=\"true\"><div repeat.for=\"i of 3\">a</div></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$05$163 tpl.if.true > (tpl.repeat x3 +> (tpl.if.true > div.repeat x3 > \"a\"))", function $05$163_tpl_if_true____tpl_repeat_x3_____tpl_if_true___div_repeat_x3____a___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\"><template repeat.for=\"i of 3\" if.bind=\"true\"><div repeat.for=\"i of 3\">a</div></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$05$164 tpl.if.true +> (tpl.if.true +> tpl.repeat x3 > div.repeat x3 > \"a\")", function $05$164_tpl_if_true_____tpl_if_true____tpl_repeat_x3___div_repeat_x3____a__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\"><template if.bind=\"true\" repeat.for=\"i of 3\"><div repeat.for=\"i of 3\">a</div></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$05$165 tpl.repeat x3 +> (tpl.if.true > (tpl.repeat x3 +> (tpl.if.true > div.repeat x3 > \"a\")))", function $05$165_tpl_repeat_x3_____tpl_if_true____tpl_repeat_x3_____tpl_if_true___div_repeat_x3____a____() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template repeat.for=\"i of 3\" if.bind=\"true\"><template repeat.for=\"i of 3\" if.bind=\"true\"><div repeat.for=\"i of 3\">a</div></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaaaaaaaaaaaaaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$05$166 tpl.if.true +> (tpl.repeat x3 > (tpl.repeat x3 +> (tpl.if.true > div.repeat x3 > \"a\")))", function $05$166_tpl_if_true_____tpl_repeat_x3____tpl_repeat_x3_____tpl_if_true___div_repeat_x3____a____() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\" repeat.for=\"i of 3\"><template repeat.for=\"i of 3\" if.bind=\"true\"><div repeat.for=\"i of 3\">a</div></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaaaaaaaaaaaaaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$05$167 tpl.repeat x3 +> (tpl.if.true > (tpl.if.true +> tpl.repeat x3 > div.repeat x3 > \"a\"))", function $05$167_tpl_repeat_x3_____tpl_if_true____tpl_if_true____tpl_repeat_x3___div_repeat_x3____a___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template repeat.for=\"i of 3\" if.bind=\"true\"><template if.bind=\"true\" repeat.for=\"i of 3\"><div repeat.for=\"i of 3\">a</div></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaaaaaaaaaaaaaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$05$168 tpl.if.true +> (tpl.repeat x3 > (tpl.if.true +> tpl.repeat x3 > div.repeat x3 > \"a\"))", function $05$168_tpl_if_true_____tpl_repeat_x3____tpl_if_true____tpl_repeat_x3___div_repeat_x3____a___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\" repeat.for=\"i of 3\"><template if.bind=\"true\" repeat.for=\"i of 3\"><div repeat.for=\"i of 3\">a</div></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaaaaaaaaaaaaaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$05$201 (tpl.if.true > div.repeat x3 > \"a\") + (else > div.repeat x3 > \"b\")", function $05$201__tpl_if_true___div_repeat_x3____a______else___div_repeat_x3____b__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\"><div repeat.for=\"i of 3\">a</div></template><template else><div repeat.for=\"i of 3\">b</div></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$05$202 (tpl.if.false > div.repeat x3 > \"b\") + (tpl.else > div.repeat x3 > \"a\")", function $05$202__tpl_if_false___div_repeat_x3____b______tpl_else___div_repeat_x3____a__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"false\"><div repeat.for=\"i of 3\">b</div></template><template else><div repeat.for=\"i of 3\">a</div></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$05$221 tpl.if.true > ((tpl.if.true > div.repeat x3 > \"a\") + (else > div.repeat x3 > \"b\"))", function $05$221_tpl_if_true_____tpl_if_true___div_repeat_x3____a______else___div_repeat_x3____b___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\"><template if.bind=\"true\"><div repeat.for=\"i of 3\">a</div></template><template else><div repeat.for=\"i of 3\">b</div></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$05$222 (tpl.if.true > ((tpl.if.true > div.repeat x3 > \"a\") + (else > div.repeat x3 > \"b\"))) + (else > div.repeat x3 > \"b\")", function $05$222__tpl_if_true_____tpl_if_true___div_repeat_x3____a______else___div_repeat_x3____b________else___div_repeat_x3____b__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\"><template if.bind=\"true\"><div repeat.for=\"i of 3\">a</div></template><template else><div repeat.for=\"i of 3\">b</div></template></template><template else><div repeat.for=\"i of 3\">b</div></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$05$223 tpl.if.true > ((tpl.if.false > div.repeat x3 > \"b\") + (else > div.repeat x3 > \"a\"))", function $05$223_tpl_if_true_____tpl_if_false___div_repeat_x3____b______else___div_repeat_x3____a___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\"><template if.bind=\"false\"><div repeat.for=\"i of 3\">b</div></template><template else><div repeat.for=\"i of 3\">a</div></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$05$224 (tpl.if.true > ((tpl.if.false > div.repeat x3 > \"b\") + (else > div.repeat x3 > \"a\"))) + (else > div.repeat x3 > \"b\")", function $05$224__tpl_if_true_____tpl_if_false___div_repeat_x3____b______else___div_repeat_x3____a________else___div_repeat_x3____b__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\"><template if.bind=\"false\"><div repeat.for=\"i of 3\">b</div></template><template else><div repeat.for=\"i of 3\">a</div></template></template><template else><div repeat.for=\"i of 3\">b</div></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$05$225 (tpl.if.false > \"\") + (tpl.else > (if.bind=\"false\" > div.repeat x3 > \"b\") + (tpl.else > div.repeat x3 > \"a\"))", function $05$225__tpl_if_false__________tpl_else____if_bind__false____div_repeat_x3____b______tpl_else___div_repeat_x3____a___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"false\"></template><template else><template if.bind=\"false\"><div repeat.for=\"i of 3\">b</div></template><template else><div repeat.for=\"i of 3\">a</div></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$05$226 (tpl.if.false > div.repeat x3 > \"b\") + (tpl.else > (if.bind=\"false\" > div.repeat x3 > \"b\") + (tpl.else > div.repeat x3 > \"a\"))", function $05$226__tpl_if_false___div_repeat_x3____b______tpl_else____if_bind__false____div_repeat_x3____b______tpl_else___div_repeat_x3____a___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"false\"><div repeat.for=\"i of 3\">b</div></template><template else><template if.bind=\"false\"><div repeat.for=\"i of 3\">b</div></template><template else><div repeat.for=\"i of 3\">a</div></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$05$227 (tpl.if.false > div.repeat x3 > \"b\") + (tpl.else > (if.bind=\"true\" > div.repeat x3 > \"a\"))", function $05$227__tpl_if_false___div_repeat_x3____b______tpl_else____if_bind__true____div_repeat_x3____a___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"false\"><div repeat.for=\"i of 3\">b</div></template><template else><template if.bind=\"true\"><div repeat.for=\"i of 3\">a</div></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$05$228 (tpl.if.false > div.repeat x3 > \"b\") + (tpl.else +> tpl.if.true > div.repeat x3 > \"a\")", function $05$228__tpl_if_false___div_repeat_x3____b______tpl_else____tpl_if_true___div_repeat_x3____a__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"false\"><div repeat.for=\"i of 3\">b</div></template><template else if.bind=\"true\"><div repeat.for=\"i of 3\">a</div></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
    });
    describe("$06$xxx template=div.repeat x3 > \"a\", notTemplate=<div repeat.for=\"i of 3\">${notMsg}</div> (tpl)", function $06$xxx_template_div_repeat_x3____a___notTemplate__div_repeat_for__i_of_3__$_notMsg___div___tpl_() {
        it("$06$201 (tpl.if.true > div.repeat x3 > \"a\") + (else > div.repeat x3 > ${notMsg})", function $06$201__tpl_if_true___div_repeat_x3____a______else___div_repeat_x3___$_notMsg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\"><div repeat.for=\"i of 3\">a</div></template><template else><div repeat.for=\"i of 3\">${notMsg}</div></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$06$202 (tpl.if.false > div.repeat x3 > ${notMsg}) + (tpl.else > div.repeat x3 > \"a\")", function $06$202__tpl_if_false___div_repeat_x3___$_notMsg______tpl_else___div_repeat_x3____a__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"false\"><div repeat.for=\"i of 3\">${notMsg}</div></template><template else><div repeat.for=\"i of 3\">a</div></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$06$221 tpl.if.true > ((tpl.if.true > div.repeat x3 > \"a\") + (else > div.repeat x3 > ${notMsg}))", function $06$221_tpl_if_true_____tpl_if_true___div_repeat_x3____a______else___div_repeat_x3___$_notMsg___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\"><template if.bind=\"true\"><div repeat.for=\"i of 3\">a</div></template><template else><div repeat.for=\"i of 3\">${notMsg}</div></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$06$222 (tpl.if.true > ((tpl.if.true > div.repeat x3 > \"a\") + (else > div.repeat x3 > ${notMsg}))) + (else > div.repeat x3 > ${notMsg})", function $06$222__tpl_if_true_____tpl_if_true___div_repeat_x3____a______else___div_repeat_x3___$_notMsg________else___div_repeat_x3___$_notMsg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\"><template if.bind=\"true\"><div repeat.for=\"i of 3\">a</div></template><template else><div repeat.for=\"i of 3\">${notMsg}</div></template></template><template else><div repeat.for=\"i of 3\">${notMsg}</div></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$06$223 tpl.if.true > ((tpl.if.false > div.repeat x3 > ${notMsg}) + (else > div.repeat x3 > \"a\"))", function $06$223_tpl_if_true_____tpl_if_false___div_repeat_x3___$_notMsg______else___div_repeat_x3____a___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\"><template if.bind=\"false\"><div repeat.for=\"i of 3\">${notMsg}</div></template><template else><div repeat.for=\"i of 3\">a</div></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$06$224 (tpl.if.true > ((tpl.if.false > div.repeat x3 > ${notMsg}) + (else > div.repeat x3 > \"a\"))) + (else > div.repeat x3 > ${notMsg})", function $06$224__tpl_if_true_____tpl_if_false___div_repeat_x3___$_notMsg______else___div_repeat_x3____a________else___div_repeat_x3___$_notMsg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\"><template if.bind=\"false\"><div repeat.for=\"i of 3\">${notMsg}</div></template><template else><div repeat.for=\"i of 3\">a</div></template></template><template else><div repeat.for=\"i of 3\">${notMsg}</div></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$06$225 (tpl.if.false > \"\") + (tpl.else > (if.bind=\"false\" > div.repeat x3 > ${notMsg}) + (tpl.else > div.repeat x3 > \"a\"))", function $06$225__tpl_if_false__________tpl_else____if_bind__false____div_repeat_x3___$_notMsg______tpl_else___div_repeat_x3____a___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"false\"></template><template else><template if.bind=\"false\"><div repeat.for=\"i of 3\">${notMsg}</div></template><template else><div repeat.for=\"i of 3\">a</div></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$06$226 (tpl.if.false > div.repeat x3 > ${notMsg}) + (tpl.else > (if.bind=\"false\" > div.repeat x3 > ${notMsg}) + (tpl.else > div.repeat x3 > \"a\"))", function $06$226__tpl_if_false___div_repeat_x3___$_notMsg______tpl_else____if_bind__false____div_repeat_x3___$_notMsg______tpl_else___div_repeat_x3____a___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"false\"><div repeat.for=\"i of 3\">${notMsg}</div></template><template else><template if.bind=\"false\"><div repeat.for=\"i of 3\">${notMsg}</div></template><template else><div repeat.for=\"i of 3\">a</div></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$06$227 (tpl.if.false > div.repeat x3 > ${notMsg}) + (tpl.else > (if.bind=\"true\" > div.repeat x3 > \"a\"))", function $06$227__tpl_if_false___div_repeat_x3___$_notMsg______tpl_else____if_bind__true____div_repeat_x3____a___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"false\"><div repeat.for=\"i of 3\">${notMsg}</div></template><template else><template if.bind=\"true\"><div repeat.for=\"i of 3\">a</div></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$06$228 (tpl.if.false > div.repeat x3 > ${notMsg}) + (tpl.else +> tpl.if.true > div.repeat x3 > \"a\")", function $06$228__tpl_if_false___div_repeat_x3___$_notMsg______tpl_else____tpl_if_true___div_repeat_x3____a__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"false\"><div repeat.for=\"i of 3\">${notMsg}</div></template><template else if.bind=\"true\"><div repeat.for=\"i of 3\">a</div></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
    });
    describe("$07$xxx template=div.repeat x3 > ${msg}, notTemplate=<div repeat.for=\"i of 3\">b</div> (tpl)", function $07$xxx_template_div_repeat_x3___$_msg___notTemplate__div_repeat_for__i_of_3__b__div___tpl_() {
        it("$07$001 div.repeat x3 > ${msg}", function $07$001_div_repeat_x3___$_msg_() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><div repeat.for=\"i of 3\">${msg}</div></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$07$101 tpl.if.true > div.repeat x3 > ${msg}", function $07$101_tpl_if_true___div_repeat_x3___$_msg_() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\"><div repeat.for=\"i of 3\">${msg}</div></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$07$102 (tpl.if.false > \"\") + (tpl.else > div.repeat x3 > ${msg})", function $07$102__tpl_if_false__________tpl_else___div_repeat_x3___$_msg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"false\"></template><template else><div repeat.for=\"i of 3\">${msg}</div></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$07$103 tpl.if.true +> tpl.repeat x3 > div.repeat x3 > ${msg}", function $07$103_tpl_if_true____tpl_repeat_x3___div_repeat_x3___$_msg_() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\" repeat.for=\"i of 3\"><div repeat.for=\"i of 3\">${msg}</div></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$07$104 (tpl.if.false > \"\") + (tpl.else +> tpl.repeat x3 > div.repeat x3 > ${msg})", function $07$104__tpl_if_false__________tpl_else____tpl_repeat_x3___div_repeat_x3___$_msg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"false\"></template><template else repeat.for=\"i of 3\"><div repeat.for=\"i of 3\">${msg}</div></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$07$105 tpl.repeat x3 +> tpl.if.true > div.repeat x3 > ${msg}", function $07$105_tpl_repeat_x3____tpl_if_true___div_repeat_x3___$_msg_() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template repeat.for=\"i of 3\" if.bind=\"true\"><div repeat.for=\"i of 3\">${msg}</div></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$07$106 tpl.repeat x3 > tpl.if.true > div.repeat x3 > ${msg}", function $07$106_tpl_repeat_x3___tpl_if_true___div_repeat_x3___$_msg_() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template repeat.for=\"i of 3\"><template if.bind=\"true\"><div repeat.for=\"i of 3\">${msg}</div></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$07$107 (tpl.if.false > \"\") + (tpl.else)", function $07$107__tpl_if_false__________tpl_else_() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template repeat.for=\"i of 3\"><template if.bind=\"false\"></template><template else><div repeat.for=\"i of 3\">${msg}</div></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$07$121 tpl.if.true > tpl.if.true > div.repeat x3 > ${msg}", function $07$121_tpl_if_true___tpl_if_true___div_repeat_x3___$_msg_() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\"><template if.bind=\"true\"><div repeat.for=\"i of 3\">${msg}</div></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$07$123 tpl.if.true > (tpl.if.false > \"\") : (tpl.else > div.repeat x3 > ${msg})", function $07$123_tpl_if_true____tpl_if_false__________tpl_else___div_repeat_x3___$_msg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\"><template if.bind=\"false\"></template><template else><div repeat.for=\"i of 3\">${msg}</div></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$07$125 tpl.else > tpl.else > div.repeat x3 > ${msg}", function $07$125_tpl_else___tpl_else___div_repeat_x3___$_msg_() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"false\"></template><template else><template if.bind=\"false\"></template><template else><div repeat.for=\"i of 3\">${msg}</div></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$07$127 (tpl.if.false > \"\") + (tpl.else > tpl.if.true > div.repeat x3 > ${msg})", function $07$127__tpl_if_false__________tpl_else___tpl_if_true___div_repeat_x3___$_msg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"false\"></template><template else><template if.bind=\"true\"><div repeat.for=\"i of 3\">${msg}</div></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$07$128 (tpl.if.false > \"\") + (tpl.else +> tpl.if.true > div.repeat x3 > ${msg})", function $07$128__tpl_if_false__________tpl_else____tpl_if_true___div_repeat_x3___$_msg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"false\"></template><template else if.bind=\"true\"><div repeat.for=\"i of 3\">${msg}</div></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$07$141 tpl.repeat x3 > (tpl.if.true > tpl.if.true > div.repeat x3 > ${msg})", function $07$141_tpl_repeat_x3____tpl_if_true___tpl_if_true___div_repeat_x3___$_msg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template repeat.for=\"i of 3\"><template if.bind=\"true\"><template if.bind=\"true\"><div repeat.for=\"i of 3\">${msg}</div></template></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$07$143 tpl.repeat x3 > (tpl.if.true > (tpl.if.false > \"\") : (tpl.else > div.repeat x3 > ${msg}))", function $07$143_tpl_repeat_x3____tpl_if_true____tpl_if_false__________tpl_else___div_repeat_x3___$_msg___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template repeat.for=\"i of 3\"><template if.bind=\"true\"><template if.bind=\"false\"></template><template else><div repeat.for=\"i of 3\">${msg}</div></template></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$07$145 tpl.repeat x3 > (tpl.else > tpl.else > div.repeat x3 > ${msg})", function $07$145_tpl_repeat_x3____tpl_else___tpl_else___div_repeat_x3___$_msg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template repeat.for=\"i of 3\"><template if.bind=\"false\"></template><template else><template if.bind=\"false\"></template><template else><div repeat.for=\"i of 3\">${msg}</div></template></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$07$147 tpl.repeat x3 > ((tpl.if.false > \"\") + (tpl.else > tpl.if.true > div.repeat x3 > ${msg}))", function $07$147_tpl_repeat_x3_____tpl_if_false__________tpl_else___tpl_if_true___div_repeat_x3___$_msg___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template repeat.for=\"i of 3\"><template if.bind=\"false\"></template><template else><template if.bind=\"true\"><div repeat.for=\"i of 3\">${msg}</div></template></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$07$148 tpl.repeat x3 > ((tpl.if.false > \"\") + (tpl.else +> tpl.if.true > div.repeat x3 > ${msg}))", function $07$148_tpl_repeat_x3_____tpl_if_false__________tpl_else____tpl_if_true___div_repeat_x3___$_msg___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template repeat.for=\"i of 3\"><template if.bind=\"false\"></template><template else if.bind=\"true\"><div repeat.for=\"i of 3\">${msg}</div></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$07$161 tpl.repeat x3 +> (tpl.if.true > tpl.if.true > div.repeat x3 > ${msg})", function $07$161_tpl_repeat_x3_____tpl_if_true___tpl_if_true___div_repeat_x3___$_msg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template repeat.for=\"i of 3\" if.bind=\"true\"><template if.bind=\"true\"><div repeat.for=\"i of 3\">${msg}</div></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$07$162 tpl.if.true +> (tpl.repeat x3 > tpl.if.true > div.repeat x3 > ${msg})", function $07$162_tpl_if_true_____tpl_repeat_x3___tpl_if_true___div_repeat_x3___$_msg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\" repeat.for=\"i of 3\"><template if.bind=\"true\"><div repeat.for=\"i of 3\">${msg}</div></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$07$163 tpl.if.true > (tpl.repeat x3 +> (tpl.if.true > div.repeat x3 > ${msg}))", function $07$163_tpl_if_true____tpl_repeat_x3_____tpl_if_true___div_repeat_x3___$_msg___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\"><template repeat.for=\"i of 3\" if.bind=\"true\"><div repeat.for=\"i of 3\">${msg}</div></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$07$164 tpl.if.true +> (tpl.if.true +> tpl.repeat x3 > div.repeat x3 > ${msg})", function $07$164_tpl_if_true_____tpl_if_true____tpl_repeat_x3___div_repeat_x3___$_msg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\"><template if.bind=\"true\" repeat.for=\"i of 3\"><div repeat.for=\"i of 3\">${msg}</div></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$07$165 tpl.repeat x3 +> (tpl.if.true > (tpl.repeat x3 +> (tpl.if.true > div.repeat x3 > ${msg})))", function $07$165_tpl_repeat_x3_____tpl_if_true____tpl_repeat_x3_____tpl_if_true___div_repeat_x3___$_msg____() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template repeat.for=\"i of 3\" if.bind=\"true\"><template repeat.for=\"i of 3\" if.bind=\"true\"><div repeat.for=\"i of 3\">${msg}</div></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaaaaaaaaaaaaaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$07$166 tpl.if.true +> (tpl.repeat x3 > (tpl.repeat x3 +> (tpl.if.true > div.repeat x3 > ${msg})))", function $07$166_tpl_if_true_____tpl_repeat_x3____tpl_repeat_x3_____tpl_if_true___div_repeat_x3___$_msg____() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\" repeat.for=\"i of 3\"><template repeat.for=\"i of 3\" if.bind=\"true\"><div repeat.for=\"i of 3\">${msg}</div></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaaaaaaaaaaaaaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$07$167 tpl.repeat x3 +> (tpl.if.true > (tpl.if.true +> tpl.repeat x3 > div.repeat x3 > ${msg}))", function $07$167_tpl_repeat_x3_____tpl_if_true____tpl_if_true____tpl_repeat_x3___div_repeat_x3___$_msg___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template repeat.for=\"i of 3\" if.bind=\"true\"><template if.bind=\"true\" repeat.for=\"i of 3\"><div repeat.for=\"i of 3\">${msg}</div></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaaaaaaaaaaaaaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$07$168 tpl.if.true +> (tpl.repeat x3 > (tpl.if.true +> tpl.repeat x3 > div.repeat x3 > ${msg}))", function $07$168_tpl_if_true_____tpl_repeat_x3____tpl_if_true____tpl_repeat_x3___div_repeat_x3___$_msg___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\" repeat.for=\"i of 3\"><template if.bind=\"true\" repeat.for=\"i of 3\"><div repeat.for=\"i of 3\">${msg}</div></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaaaaaaaaaaaaaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$07$201 (tpl.if.true > div.repeat x3 > ${msg}) + (else > div.repeat x3 > \"b\")", function $07$201__tpl_if_true___div_repeat_x3___$_msg______else___div_repeat_x3____b__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\"><div repeat.for=\"i of 3\">${msg}</div></template><template else><div repeat.for=\"i of 3\">b</div></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$07$202 (tpl.if.false > div.repeat x3 > \"b\") + (tpl.else > div.repeat x3 > ${msg})", function $07$202__tpl_if_false___div_repeat_x3____b______tpl_else___div_repeat_x3___$_msg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"false\"><div repeat.for=\"i of 3\">b</div></template><template else><div repeat.for=\"i of 3\">${msg}</div></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$07$221 tpl.if.true > ((tpl.if.true > div.repeat x3 > ${msg}) + (else > div.repeat x3 > \"b\"))", function $07$221_tpl_if_true_____tpl_if_true___div_repeat_x3___$_msg______else___div_repeat_x3____b___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\"><template if.bind=\"true\"><div repeat.for=\"i of 3\">${msg}</div></template><template else><div repeat.for=\"i of 3\">b</div></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$07$222 (tpl.if.true > ((tpl.if.true > div.repeat x3 > ${msg}) + (else > div.repeat x3 > \"b\"))) + (else > div.repeat x3 > \"b\")", function $07$222__tpl_if_true_____tpl_if_true___div_repeat_x3___$_msg______else___div_repeat_x3____b________else___div_repeat_x3____b__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\"><template if.bind=\"true\"><div repeat.for=\"i of 3\">${msg}</div></template><template else><div repeat.for=\"i of 3\">b</div></template></template><template else><div repeat.for=\"i of 3\">b</div></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$07$223 tpl.if.true > ((tpl.if.false > div.repeat x3 > \"b\") + (else > div.repeat x3 > ${msg}))", function $07$223_tpl_if_true_____tpl_if_false___div_repeat_x3____b______else___div_repeat_x3___$_msg___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\"><template if.bind=\"false\"><div repeat.for=\"i of 3\">b</div></template><template else><div repeat.for=\"i of 3\">${msg}</div></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$07$224 (tpl.if.true > ((tpl.if.false > div.repeat x3 > \"b\") + (else > div.repeat x3 > ${msg}))) + (else > div.repeat x3 > \"b\")", function $07$224__tpl_if_true_____tpl_if_false___div_repeat_x3____b______else___div_repeat_x3___$_msg________else___div_repeat_x3____b__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\"><template if.bind=\"false\"><div repeat.for=\"i of 3\">b</div></template><template else><div repeat.for=\"i of 3\">${msg}</div></template></template><template else><div repeat.for=\"i of 3\">b</div></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$07$225 (tpl.if.false > \"\") + (tpl.else > (if.bind=\"false\" > div.repeat x3 > \"b\") + (tpl.else > div.repeat x3 > ${msg}))", function $07$225__tpl_if_false__________tpl_else____if_bind__false____div_repeat_x3____b______tpl_else___div_repeat_x3___$_msg___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"false\"></template><template else><template if.bind=\"false\"><div repeat.for=\"i of 3\">b</div></template><template else><div repeat.for=\"i of 3\">${msg}</div></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$07$226 (tpl.if.false > div.repeat x3 > \"b\") + (tpl.else > (if.bind=\"false\" > div.repeat x3 > \"b\") + (tpl.else > div.repeat x3 > ${msg}))", function $07$226__tpl_if_false___div_repeat_x3____b______tpl_else____if_bind__false____div_repeat_x3____b______tpl_else___div_repeat_x3___$_msg___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"false\"><div repeat.for=\"i of 3\">b</div></template><template else><template if.bind=\"false\"><div repeat.for=\"i of 3\">b</div></template><template else><div repeat.for=\"i of 3\">${msg}</div></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$07$227 (tpl.if.false > div.repeat x3 > \"b\") + (tpl.else > (if.bind=\"true\" > div.repeat x3 > ${msg}))", function $07$227__tpl_if_false___div_repeat_x3____b______tpl_else____if_bind__true____div_repeat_x3___$_msg___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"false\"><div repeat.for=\"i of 3\">b</div></template><template else><template if.bind=\"true\"><div repeat.for=\"i of 3\">${msg}</div></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$07$228 (tpl.if.false > div.repeat x3 > \"b\") + (tpl.else +> tpl.if.true > div.repeat x3 > ${msg})", function $07$228__tpl_if_false___div_repeat_x3____b______tpl_else____tpl_if_true___div_repeat_x3___$_msg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"false\"><div repeat.for=\"i of 3\">b</div></template><template else if.bind=\"true\"><div repeat.for=\"i of 3\">${msg}</div></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
    });
    describe("$08$xxx template=div.repeat x3 > ${msg}, notTemplate=<div repeat.for=\"i of 3\">${notMsg}</div> (tpl)", function $08$xxx_template_div_repeat_x3___$_msg___notTemplate__div_repeat_for__i_of_3__$_notMsg___div___tpl_() {
        it("$08$201 (tpl.if.true > div.repeat x3 > ${msg}) + (else > div.repeat x3 > ${notMsg})", function $08$201__tpl_if_true___div_repeat_x3___$_msg______else___div_repeat_x3___$_notMsg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\"><div repeat.for=\"i of 3\">${msg}</div></template><template else><div repeat.for=\"i of 3\">${notMsg}</div></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$08$202 (tpl.if.false > div.repeat x3 > ${notMsg}) + (tpl.else > div.repeat x3 > ${msg})", function $08$202__tpl_if_false___div_repeat_x3___$_notMsg______tpl_else___div_repeat_x3___$_msg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"false\"><div repeat.for=\"i of 3\">${notMsg}</div></template><template else><div repeat.for=\"i of 3\">${msg}</div></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$08$221 tpl.if.true > ((tpl.if.true > div.repeat x3 > ${msg}) + (else > div.repeat x3 > ${notMsg}))", function $08$221_tpl_if_true_____tpl_if_true___div_repeat_x3___$_msg______else___div_repeat_x3___$_notMsg___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\"><template if.bind=\"true\"><div repeat.for=\"i of 3\">${msg}</div></template><template else><div repeat.for=\"i of 3\">${notMsg}</div></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$08$222 (tpl.if.true > ((tpl.if.true > div.repeat x3 > ${msg}) + (else > div.repeat x3 > ${notMsg}))) + (else > div.repeat x3 > ${notMsg})", function $08$222__tpl_if_true_____tpl_if_true___div_repeat_x3___$_msg______else___div_repeat_x3___$_notMsg________else___div_repeat_x3___$_notMsg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\"><template if.bind=\"true\"><div repeat.for=\"i of 3\">${msg}</div></template><template else><div repeat.for=\"i of 3\">${notMsg}</div></template></template><template else><div repeat.for=\"i of 3\">${notMsg}</div></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$08$223 tpl.if.true > ((tpl.if.false > div.repeat x3 > ${notMsg}) + (else > div.repeat x3 > ${msg}))", function $08$223_tpl_if_true_____tpl_if_false___div_repeat_x3___$_notMsg______else___div_repeat_x3___$_msg___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\"><template if.bind=\"false\"><div repeat.for=\"i of 3\">${notMsg}</div></template><template else><div repeat.for=\"i of 3\">${msg}</div></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$08$224 (tpl.if.true > ((tpl.if.false > div.repeat x3 > ${notMsg}) + (else > div.repeat x3 > ${msg}))) + (else > div.repeat x3 > ${notMsg})", function $08$224__tpl_if_true_____tpl_if_false___div_repeat_x3___$_notMsg______else___div_repeat_x3___$_msg________else___div_repeat_x3___$_notMsg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\"><template if.bind=\"false\"><div repeat.for=\"i of 3\">${notMsg}</div></template><template else><div repeat.for=\"i of 3\">${msg}</div></template></template><template else><div repeat.for=\"i of 3\">${notMsg}</div></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$08$225 (tpl.if.false > \"\") + (tpl.else > (if.bind=\"false\" > div.repeat x3 > ${notMsg}) + (tpl.else > div.repeat x3 > ${msg}))", function $08$225__tpl_if_false__________tpl_else____if_bind__false____div_repeat_x3___$_notMsg______tpl_else___div_repeat_x3___$_msg___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"false\"></template><template else><template if.bind=\"false\"><div repeat.for=\"i of 3\">${notMsg}</div></template><template else><div repeat.for=\"i of 3\">${msg}</div></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$08$226 (tpl.if.false > div.repeat x3 > ${notMsg}) + (tpl.else > (if.bind=\"false\" > div.repeat x3 > ${notMsg}) + (tpl.else > div.repeat x3 > ${msg}))", function $08$226__tpl_if_false___div_repeat_x3___$_notMsg______tpl_else____if_bind__false____div_repeat_x3___$_notMsg______tpl_else___div_repeat_x3___$_msg___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"false\"><div repeat.for=\"i of 3\">${notMsg}</div></template><template else><template if.bind=\"false\"><div repeat.for=\"i of 3\">${notMsg}</div></template><template else><div repeat.for=\"i of 3\">${msg}</div></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$08$227 (tpl.if.false > div.repeat x3 > ${notMsg}) + (tpl.else > (if.bind=\"true\" > div.repeat x3 > ${msg}))", function $08$227__tpl_if_false___div_repeat_x3___$_notMsg______tpl_else____if_bind__true____div_repeat_x3___$_msg___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"false\"><div repeat.for=\"i of 3\">${notMsg}</div></template><template else><template if.bind=\"true\"><div repeat.for=\"i of 3\">${msg}</div></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$08$228 (tpl.if.false > div.repeat x3 > ${notMsg}) + (tpl.else +> tpl.if.true > div.repeat x3 > ${msg})", function $08$228__tpl_if_false___div_repeat_x3___$_notMsg______tpl_else____tpl_if_true___div_repeat_x3___$_msg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"false\"><div repeat.for=\"i of 3\">${notMsg}</div></template><template else if.bind=\"true\"><div repeat.for=\"i of 3\">${msg}</div></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
    });
    describe("$09$xxx template=tpl.repeat x3 > \"a\", notTemplate=<template repeat.for=\"i of 3\">b</template> (tpl)", function $09$xxx_template_tpl_repeat_x3____a___notTemplate__template_repeat_for__i_of_3__b__template___tpl_() {
        it("$09$001 tpl.repeat x3 > \"a\"", function $09$001_tpl_repeat_x3____a_() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template repeat.for=\"i of 3\">a</template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$09$101 tpl.if.true > tpl.repeat x3 > \"a\"", function $09$101_tpl_if_true___tpl_repeat_x3____a_() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\"><template repeat.for=\"i of 3\">a</template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$09$102 (tpl.if.false > \"\") + (tpl.else > tpl.repeat x3 > \"a\")", function $09$102__tpl_if_false__________tpl_else___tpl_repeat_x3____a__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"false\"></template><template else><template repeat.for=\"i of 3\">a</template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$09$103 tpl.if.true +> tpl.repeat x3 > tpl.repeat x3 > \"a\"", function $09$103_tpl_if_true____tpl_repeat_x3___tpl_repeat_x3____a_() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\" repeat.for=\"i of 3\"><template repeat.for=\"i of 3\">a</template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$09$104 (tpl.if.false > \"\") + (tpl.else +> tpl.repeat x3 > tpl.repeat x3 > \"a\")", function $09$104__tpl_if_false__________tpl_else____tpl_repeat_x3___tpl_repeat_x3____a__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"false\"></template><template else repeat.for=\"i of 3\"><template repeat.for=\"i of 3\">a</template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$09$105 tpl.repeat x3 +> tpl.if.true > tpl.repeat x3 > \"a\"", function $09$105_tpl_repeat_x3____tpl_if_true___tpl_repeat_x3____a_() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template repeat.for=\"i of 3\" if.bind=\"true\"><template repeat.for=\"i of 3\">a</template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$09$106 tpl.repeat x3 > tpl.if.true > tpl.repeat x3 > \"a\"", function $09$106_tpl_repeat_x3___tpl_if_true___tpl_repeat_x3____a_() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template repeat.for=\"i of 3\"><template if.bind=\"true\"><template repeat.for=\"i of 3\">a</template></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$09$107 (tpl.if.false > \"\") + (tpl.else)", function $09$107__tpl_if_false__________tpl_else_() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template repeat.for=\"i of 3\"><template if.bind=\"false\"></template><template else><template repeat.for=\"i of 3\">a</template></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$09$121 tpl.if.true > tpl.if.true > tpl.repeat x3 > \"a\"", function $09$121_tpl_if_true___tpl_if_true___tpl_repeat_x3____a_() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\"><template if.bind=\"true\"><template repeat.for=\"i of 3\">a</template></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$09$123 tpl.if.true > (tpl.if.false > \"\") : (tpl.else > tpl.repeat x3 > \"a\")", function $09$123_tpl_if_true____tpl_if_false__________tpl_else___tpl_repeat_x3____a__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\"><template if.bind=\"false\"></template><template else><template repeat.for=\"i of 3\">a</template></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$09$125 tpl.else > tpl.else > tpl.repeat x3 > \"a\"", function $09$125_tpl_else___tpl_else___tpl_repeat_x3____a_() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"false\"></template><template else><template if.bind=\"false\"></template><template else><template repeat.for=\"i of 3\">a</template></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$09$127 (tpl.if.false > \"\") + (tpl.else > tpl.if.true > tpl.repeat x3 > \"a\")", function $09$127__tpl_if_false__________tpl_else___tpl_if_true___tpl_repeat_x3____a__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"false\"></template><template else><template if.bind=\"true\"><template repeat.for=\"i of 3\">a</template></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$09$128 (tpl.if.false > \"\") + (tpl.else +> tpl.if.true > tpl.repeat x3 > \"a\")", function $09$128__tpl_if_false__________tpl_else____tpl_if_true___tpl_repeat_x3____a__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"false\"></template><template else if.bind=\"true\"><template repeat.for=\"i of 3\">a</template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$09$141 tpl.repeat x3 > (tpl.if.true > tpl.if.true > tpl.repeat x3 > \"a\")", function $09$141_tpl_repeat_x3____tpl_if_true___tpl_if_true___tpl_repeat_x3____a__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template repeat.for=\"i of 3\"><template if.bind=\"true\"><template if.bind=\"true\"><template repeat.for=\"i of 3\">a</template></template></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$09$143 tpl.repeat x3 > (tpl.if.true > (tpl.if.false > \"\") : (tpl.else > tpl.repeat x3 > \"a\"))", function $09$143_tpl_repeat_x3____tpl_if_true____tpl_if_false__________tpl_else___tpl_repeat_x3____a___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template repeat.for=\"i of 3\"><template if.bind=\"true\"><template if.bind=\"false\"></template><template else><template repeat.for=\"i of 3\">a</template></template></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$09$145 tpl.repeat x3 > (tpl.else > tpl.else > tpl.repeat x3 > \"a\")", function $09$145_tpl_repeat_x3____tpl_else___tpl_else___tpl_repeat_x3____a__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template repeat.for=\"i of 3\"><template if.bind=\"false\"></template><template else><template if.bind=\"false\"></template><template else><template repeat.for=\"i of 3\">a</template></template></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$09$147 tpl.repeat x3 > ((tpl.if.false > \"\") + (tpl.else > tpl.if.true > tpl.repeat x3 > \"a\"))", function $09$147_tpl_repeat_x3_____tpl_if_false__________tpl_else___tpl_if_true___tpl_repeat_x3____a___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template repeat.for=\"i of 3\"><template if.bind=\"false\"></template><template else><template if.bind=\"true\"><template repeat.for=\"i of 3\">a</template></template></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$09$148 tpl.repeat x3 > ((tpl.if.false > \"\") + (tpl.else +> tpl.if.true > tpl.repeat x3 > \"a\"))", function $09$148_tpl_repeat_x3_____tpl_if_false__________tpl_else____tpl_if_true___tpl_repeat_x3____a___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template repeat.for=\"i of 3\"><template if.bind=\"false\"></template><template else if.bind=\"true\"><template repeat.for=\"i of 3\">a</template></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$09$161 tpl.repeat x3 +> (tpl.if.true > tpl.if.true > tpl.repeat x3 > \"a\")", function $09$161_tpl_repeat_x3_____tpl_if_true___tpl_if_true___tpl_repeat_x3____a__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template repeat.for=\"i of 3\" if.bind=\"true\"><template if.bind=\"true\"><template repeat.for=\"i of 3\">a</template></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$09$162 tpl.if.true +> (tpl.repeat x3 > tpl.if.true > tpl.repeat x3 > \"a\")", function $09$162_tpl_if_true_____tpl_repeat_x3___tpl_if_true___tpl_repeat_x3____a__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\" repeat.for=\"i of 3\"><template if.bind=\"true\"><template repeat.for=\"i of 3\">a</template></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$09$163 tpl.if.true > (tpl.repeat x3 +> (tpl.if.true > tpl.repeat x3 > \"a\"))", function $09$163_tpl_if_true____tpl_repeat_x3_____tpl_if_true___tpl_repeat_x3____a___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\"><template repeat.for=\"i of 3\" if.bind=\"true\"><template repeat.for=\"i of 3\">a</template></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$09$164 tpl.if.true +> (tpl.if.true +> tpl.repeat x3 > tpl.repeat x3 > \"a\")", function $09$164_tpl_if_true_____tpl_if_true____tpl_repeat_x3___tpl_repeat_x3____a__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\"><template if.bind=\"true\" repeat.for=\"i of 3\"><template repeat.for=\"i of 3\">a</template></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$09$165 tpl.repeat x3 +> (tpl.if.true > (tpl.repeat x3 +> (tpl.if.true > tpl.repeat x3 > \"a\")))", function $09$165_tpl_repeat_x3_____tpl_if_true____tpl_repeat_x3_____tpl_if_true___tpl_repeat_x3____a____() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template repeat.for=\"i of 3\" if.bind=\"true\"><template repeat.for=\"i of 3\" if.bind=\"true\"><template repeat.for=\"i of 3\">a</template></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaaaaaaaaaaaaaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$09$166 tpl.if.true +> (tpl.repeat x3 > (tpl.repeat x3 +> (tpl.if.true > tpl.repeat x3 > \"a\")))", function $09$166_tpl_if_true_____tpl_repeat_x3____tpl_repeat_x3_____tpl_if_true___tpl_repeat_x3____a____() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\" repeat.for=\"i of 3\"><template repeat.for=\"i of 3\" if.bind=\"true\"><template repeat.for=\"i of 3\">a</template></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaaaaaaaaaaaaaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$09$167 tpl.repeat x3 +> (tpl.if.true > (tpl.if.true +> tpl.repeat x3 > tpl.repeat x3 > \"a\"))", function $09$167_tpl_repeat_x3_____tpl_if_true____tpl_if_true____tpl_repeat_x3___tpl_repeat_x3____a___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template repeat.for=\"i of 3\" if.bind=\"true\"><template if.bind=\"true\" repeat.for=\"i of 3\"><template repeat.for=\"i of 3\">a</template></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaaaaaaaaaaaaaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$09$168 tpl.if.true +> (tpl.repeat x3 > (tpl.if.true +> tpl.repeat x3 > tpl.repeat x3 > \"a\"))", function $09$168_tpl_if_true_____tpl_repeat_x3____tpl_if_true____tpl_repeat_x3___tpl_repeat_x3____a___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\" repeat.for=\"i of 3\"><template if.bind=\"true\" repeat.for=\"i of 3\"><template repeat.for=\"i of 3\">a</template></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaaaaaaaaaaaaaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$09$201 (tpl.if.true > tpl.repeat x3 > \"a\") + (else > tpl.repeat x3 > \"b\")", function $09$201__tpl_if_true___tpl_repeat_x3____a______else___tpl_repeat_x3____b__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\"><template repeat.for=\"i of 3\">a</template></template><template else><template repeat.for=\"i of 3\">b</template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$09$202 (tpl.if.false > tpl.repeat x3 > \"b\") + (tpl.else > tpl.repeat x3 > \"a\")", function $09$202__tpl_if_false___tpl_repeat_x3____b______tpl_else___tpl_repeat_x3____a__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"false\"><template repeat.for=\"i of 3\">b</template></template><template else><template repeat.for=\"i of 3\">a</template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$09$221 tpl.if.true > ((tpl.if.true > tpl.repeat x3 > \"a\") + (else > tpl.repeat x3 > \"b\"))", function $09$221_tpl_if_true_____tpl_if_true___tpl_repeat_x3____a______else___tpl_repeat_x3____b___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\"><template if.bind=\"true\"><template repeat.for=\"i of 3\">a</template></template><template else><template repeat.for=\"i of 3\">b</template></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$09$222 (tpl.if.true > ((tpl.if.true > tpl.repeat x3 > \"a\") + (else > tpl.repeat x3 > \"b\"))) + (else > tpl.repeat x3 > \"b\")", function $09$222__tpl_if_true_____tpl_if_true___tpl_repeat_x3____a______else___tpl_repeat_x3____b________else___tpl_repeat_x3____b__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\"><template if.bind=\"true\"><template repeat.for=\"i of 3\">a</template></template><template else><template repeat.for=\"i of 3\">b</template></template></template><template else><template repeat.for=\"i of 3\">b</template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$09$223 tpl.if.true > ((tpl.if.false > tpl.repeat x3 > \"b\") + (else > tpl.repeat x3 > \"a\"))", function $09$223_tpl_if_true_____tpl_if_false___tpl_repeat_x3____b______else___tpl_repeat_x3____a___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\"><template if.bind=\"false\"><template repeat.for=\"i of 3\">b</template></template><template else><template repeat.for=\"i of 3\">a</template></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$09$224 (tpl.if.true > ((tpl.if.false > tpl.repeat x3 > \"b\") + (else > tpl.repeat x3 > \"a\"))) + (else > tpl.repeat x3 > \"b\")", function $09$224__tpl_if_true_____tpl_if_false___tpl_repeat_x3____b______else___tpl_repeat_x3____a________else___tpl_repeat_x3____b__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\"><template if.bind=\"false\"><template repeat.for=\"i of 3\">b</template></template><template else><template repeat.for=\"i of 3\">a</template></template></template><template else><template repeat.for=\"i of 3\">b</template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$09$225 (tpl.if.false > \"\") + (tpl.else > (if.bind=\"false\" > tpl.repeat x3 > \"b\") + (tpl.else > tpl.repeat x3 > \"a\"))", function $09$225__tpl_if_false__________tpl_else____if_bind__false____tpl_repeat_x3____b______tpl_else___tpl_repeat_x3____a___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"false\"></template><template else><template if.bind=\"false\"><template repeat.for=\"i of 3\">b</template></template><template else><template repeat.for=\"i of 3\">a</template></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$09$226 (tpl.if.false > tpl.repeat x3 > \"b\") + (tpl.else > (if.bind=\"false\" > tpl.repeat x3 > \"b\") + (tpl.else > tpl.repeat x3 > \"a\"))", function $09$226__tpl_if_false___tpl_repeat_x3____b______tpl_else____if_bind__false____tpl_repeat_x3____b______tpl_else___tpl_repeat_x3____a___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"false\"><template repeat.for=\"i of 3\">b</template></template><template else><template if.bind=\"false\"><template repeat.for=\"i of 3\">b</template></template><template else><template repeat.for=\"i of 3\">a</template></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$09$227 (tpl.if.false > tpl.repeat x3 > \"b\") + (tpl.else > (if.bind=\"true\" > tpl.repeat x3 > \"a\"))", function $09$227__tpl_if_false___tpl_repeat_x3____b______tpl_else____if_bind__true____tpl_repeat_x3____a___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"false\"><template repeat.for=\"i of 3\">b</template></template><template else><template if.bind=\"true\"><template repeat.for=\"i of 3\">a</template></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$09$228 (tpl.if.false > tpl.repeat x3 > \"b\") + (tpl.else +> tpl.if.true > tpl.repeat x3 > \"a\")", function $09$228__tpl_if_false___tpl_repeat_x3____b______tpl_else____tpl_if_true___tpl_repeat_x3____a__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"false\"><template repeat.for=\"i of 3\">b</template></template><template else if.bind=\"true\"><template repeat.for=\"i of 3\">a</template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
    });
    describe("$10$xxx template=tpl.repeat x3 > \"a\", notTemplate=<template repeat.for=\"i of 3\">${notMsg}</template> (tpl)", function $10$xxx_template_tpl_repeat_x3____a___notTemplate__template_repeat_for__i_of_3__$_notMsg___template___tpl_() {
        it("$10$201 (tpl.if.true > tpl.repeat x3 > \"a\") + (else > tpl.repeat x3 > ${notMsg})", function $10$201__tpl_if_true___tpl_repeat_x3____a______else___tpl_repeat_x3___$_notMsg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\"><template repeat.for=\"i of 3\">a</template></template><template else><template repeat.for=\"i of 3\">${notMsg}</template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$10$202 (tpl.if.false > tpl.repeat x3 > ${notMsg}) + (tpl.else > tpl.repeat x3 > \"a\")", function $10$202__tpl_if_false___tpl_repeat_x3___$_notMsg______tpl_else___tpl_repeat_x3____a__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"false\"><template repeat.for=\"i of 3\">${notMsg}</template></template><template else><template repeat.for=\"i of 3\">a</template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$10$221 tpl.if.true > ((tpl.if.true > tpl.repeat x3 > \"a\") + (else > tpl.repeat x3 > ${notMsg}))", function $10$221_tpl_if_true_____tpl_if_true___tpl_repeat_x3____a______else___tpl_repeat_x3___$_notMsg___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\"><template if.bind=\"true\"><template repeat.for=\"i of 3\">a</template></template><template else><template repeat.for=\"i of 3\">${notMsg}</template></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$10$222 (tpl.if.true > ((tpl.if.true > tpl.repeat x3 > \"a\") + (else > tpl.repeat x3 > ${notMsg}))) + (else > tpl.repeat x3 > ${notMsg})", function $10$222__tpl_if_true_____tpl_if_true___tpl_repeat_x3____a______else___tpl_repeat_x3___$_notMsg________else___tpl_repeat_x3___$_notMsg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\"><template if.bind=\"true\"><template repeat.for=\"i of 3\">a</template></template><template else><template repeat.for=\"i of 3\">${notMsg}</template></template></template><template else><template repeat.for=\"i of 3\">${notMsg}</template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$10$223 tpl.if.true > ((tpl.if.false > tpl.repeat x3 > ${notMsg}) + (else > tpl.repeat x3 > \"a\"))", function $10$223_tpl_if_true_____tpl_if_false___tpl_repeat_x3___$_notMsg______else___tpl_repeat_x3____a___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\"><template if.bind=\"false\"><template repeat.for=\"i of 3\">${notMsg}</template></template><template else><template repeat.for=\"i of 3\">a</template></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$10$224 (tpl.if.true > ((tpl.if.false > tpl.repeat x3 > ${notMsg}) + (else > tpl.repeat x3 > \"a\"))) + (else > tpl.repeat x3 > ${notMsg})", function $10$224__tpl_if_true_____tpl_if_false___tpl_repeat_x3___$_notMsg______else___tpl_repeat_x3____a________else___tpl_repeat_x3___$_notMsg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\"><template if.bind=\"false\"><template repeat.for=\"i of 3\">${notMsg}</template></template><template else><template repeat.for=\"i of 3\">a</template></template></template><template else><template repeat.for=\"i of 3\">${notMsg}</template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$10$225 (tpl.if.false > \"\") + (tpl.else > (if.bind=\"false\" > tpl.repeat x3 > ${notMsg}) + (tpl.else > tpl.repeat x3 > \"a\"))", function $10$225__tpl_if_false__________tpl_else____if_bind__false____tpl_repeat_x3___$_notMsg______tpl_else___tpl_repeat_x3____a___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"false\"></template><template else><template if.bind=\"false\"><template repeat.for=\"i of 3\">${notMsg}</template></template><template else><template repeat.for=\"i of 3\">a</template></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$10$226 (tpl.if.false > tpl.repeat x3 > ${notMsg}) + (tpl.else > (if.bind=\"false\" > tpl.repeat x3 > ${notMsg}) + (tpl.else > tpl.repeat x3 > \"a\"))", function $10$226__tpl_if_false___tpl_repeat_x3___$_notMsg______tpl_else____if_bind__false____tpl_repeat_x3___$_notMsg______tpl_else___tpl_repeat_x3____a___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"false\"><template repeat.for=\"i of 3\">${notMsg}</template></template><template else><template if.bind=\"false\"><template repeat.for=\"i of 3\">${notMsg}</template></template><template else><template repeat.for=\"i of 3\">a</template></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$10$227 (tpl.if.false > tpl.repeat x3 > ${notMsg}) + (tpl.else > (if.bind=\"true\" > tpl.repeat x3 > \"a\"))", function $10$227__tpl_if_false___tpl_repeat_x3___$_notMsg______tpl_else____if_bind__true____tpl_repeat_x3____a___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"false\"><template repeat.for=\"i of 3\">${notMsg}</template></template><template else><template if.bind=\"true\"><template repeat.for=\"i of 3\">a</template></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$10$228 (tpl.if.false > tpl.repeat x3 > ${notMsg}) + (tpl.else +> tpl.if.true > tpl.repeat x3 > \"a\")", function $10$228__tpl_if_false___tpl_repeat_x3___$_notMsg______tpl_else____tpl_if_true___tpl_repeat_x3____a__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"false\"><template repeat.for=\"i of 3\">${notMsg}</template></template><template else if.bind=\"true\"><template repeat.for=\"i of 3\">a</template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
    });
    describe("$11$xxx template=tpl.repeat x3 > ${msg}, notTemplate=<template repeat.for=\"i of 3\">b</template> (tpl)", function $11$xxx_template_tpl_repeat_x3___$_msg___notTemplate__template_repeat_for__i_of_3__b__template___tpl_() {
        it("$11$001 tpl.repeat x3 > ${msg}", function $11$001_tpl_repeat_x3___$_msg_() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template repeat.for=\"i of 3\">${msg}</template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$11$101 tpl.if.true > tpl.repeat x3 > ${msg}", function $11$101_tpl_if_true___tpl_repeat_x3___$_msg_() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\"><template repeat.for=\"i of 3\">${msg}</template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$11$102 (tpl.if.false > \"\") + (tpl.else > tpl.repeat x3 > ${msg})", function $11$102__tpl_if_false__________tpl_else___tpl_repeat_x3___$_msg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"false\"></template><template else><template repeat.for=\"i of 3\">${msg}</template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$11$103 tpl.if.true +> tpl.repeat x3 > tpl.repeat x3 > ${msg}", function $11$103_tpl_if_true____tpl_repeat_x3___tpl_repeat_x3___$_msg_() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\" repeat.for=\"i of 3\"><template repeat.for=\"i of 3\">${msg}</template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$11$104 (tpl.if.false > \"\") + (tpl.else +> tpl.repeat x3 > tpl.repeat x3 > ${msg})", function $11$104__tpl_if_false__________tpl_else____tpl_repeat_x3___tpl_repeat_x3___$_msg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"false\"></template><template else repeat.for=\"i of 3\"><template repeat.for=\"i of 3\">${msg}</template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$11$105 tpl.repeat x3 +> tpl.if.true > tpl.repeat x3 > ${msg}", function $11$105_tpl_repeat_x3____tpl_if_true___tpl_repeat_x3___$_msg_() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template repeat.for=\"i of 3\" if.bind=\"true\"><template repeat.for=\"i of 3\">${msg}</template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$11$106 tpl.repeat x3 > tpl.if.true > tpl.repeat x3 > ${msg}", function $11$106_tpl_repeat_x3___tpl_if_true___tpl_repeat_x3___$_msg_() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template repeat.for=\"i of 3\"><template if.bind=\"true\"><template repeat.for=\"i of 3\">${msg}</template></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$11$107 (tpl.if.false > \"\") + (tpl.else)", function $11$107__tpl_if_false__________tpl_else_() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template repeat.for=\"i of 3\"><template if.bind=\"false\"></template><template else><template repeat.for=\"i of 3\">${msg}</template></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$11$121 tpl.if.true > tpl.if.true > tpl.repeat x3 > ${msg}", function $11$121_tpl_if_true___tpl_if_true___tpl_repeat_x3___$_msg_() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\"><template if.bind=\"true\"><template repeat.for=\"i of 3\">${msg}</template></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$11$123 tpl.if.true > (tpl.if.false > \"\") : (tpl.else > tpl.repeat x3 > ${msg})", function $11$123_tpl_if_true____tpl_if_false__________tpl_else___tpl_repeat_x3___$_msg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\"><template if.bind=\"false\"></template><template else><template repeat.for=\"i of 3\">${msg}</template></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$11$125 tpl.else > tpl.else > tpl.repeat x3 > ${msg}", function $11$125_tpl_else___tpl_else___tpl_repeat_x3___$_msg_() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"false\"></template><template else><template if.bind=\"false\"></template><template else><template repeat.for=\"i of 3\">${msg}</template></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$11$127 (tpl.if.false > \"\") + (tpl.else > tpl.if.true > tpl.repeat x3 > ${msg})", function $11$127__tpl_if_false__________tpl_else___tpl_if_true___tpl_repeat_x3___$_msg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"false\"></template><template else><template if.bind=\"true\"><template repeat.for=\"i of 3\">${msg}</template></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$11$128 (tpl.if.false > \"\") + (tpl.else +> tpl.if.true > tpl.repeat x3 > ${msg})", function $11$128__tpl_if_false__________tpl_else____tpl_if_true___tpl_repeat_x3___$_msg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"false\"></template><template else if.bind=\"true\"><template repeat.for=\"i of 3\">${msg}</template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$11$141 tpl.repeat x3 > (tpl.if.true > tpl.if.true > tpl.repeat x3 > ${msg})", function $11$141_tpl_repeat_x3____tpl_if_true___tpl_if_true___tpl_repeat_x3___$_msg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template repeat.for=\"i of 3\"><template if.bind=\"true\"><template if.bind=\"true\"><template repeat.for=\"i of 3\">${msg}</template></template></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$11$143 tpl.repeat x3 > (tpl.if.true > (tpl.if.false > \"\") : (tpl.else > tpl.repeat x3 > ${msg}))", function $11$143_tpl_repeat_x3____tpl_if_true____tpl_if_false__________tpl_else___tpl_repeat_x3___$_msg___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template repeat.for=\"i of 3\"><template if.bind=\"true\"><template if.bind=\"false\"></template><template else><template repeat.for=\"i of 3\">${msg}</template></template></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$11$145 tpl.repeat x3 > (tpl.else > tpl.else > tpl.repeat x3 > ${msg})", function $11$145_tpl_repeat_x3____tpl_else___tpl_else___tpl_repeat_x3___$_msg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template repeat.for=\"i of 3\"><template if.bind=\"false\"></template><template else><template if.bind=\"false\"></template><template else><template repeat.for=\"i of 3\">${msg}</template></template></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$11$147 tpl.repeat x3 > ((tpl.if.false > \"\") + (tpl.else > tpl.if.true > tpl.repeat x3 > ${msg}))", function $11$147_tpl_repeat_x3_____tpl_if_false__________tpl_else___tpl_if_true___tpl_repeat_x3___$_msg___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template repeat.for=\"i of 3\"><template if.bind=\"false\"></template><template else><template if.bind=\"true\"><template repeat.for=\"i of 3\">${msg}</template></template></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$11$148 tpl.repeat x3 > ((tpl.if.false > \"\") + (tpl.else +> tpl.if.true > tpl.repeat x3 > ${msg}))", function $11$148_tpl_repeat_x3_____tpl_if_false__________tpl_else____tpl_if_true___tpl_repeat_x3___$_msg___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template repeat.for=\"i of 3\"><template if.bind=\"false\"></template><template else if.bind=\"true\"><template repeat.for=\"i of 3\">${msg}</template></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$11$161 tpl.repeat x3 +> (tpl.if.true > tpl.if.true > tpl.repeat x3 > ${msg})", function $11$161_tpl_repeat_x3_____tpl_if_true___tpl_if_true___tpl_repeat_x3___$_msg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template repeat.for=\"i of 3\" if.bind=\"true\"><template if.bind=\"true\"><template repeat.for=\"i of 3\">${msg}</template></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$11$162 tpl.if.true +> (tpl.repeat x3 > tpl.if.true > tpl.repeat x3 > ${msg})", function $11$162_tpl_if_true_____tpl_repeat_x3___tpl_if_true___tpl_repeat_x3___$_msg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\" repeat.for=\"i of 3\"><template if.bind=\"true\"><template repeat.for=\"i of 3\">${msg}</template></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$11$163 tpl.if.true > (tpl.repeat x3 +> (tpl.if.true > tpl.repeat x3 > ${msg}))", function $11$163_tpl_if_true____tpl_repeat_x3_____tpl_if_true___tpl_repeat_x3___$_msg___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\"><template repeat.for=\"i of 3\" if.bind=\"true\"><template repeat.for=\"i of 3\">${msg}</template></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$11$164 tpl.if.true +> (tpl.if.true +> tpl.repeat x3 > tpl.repeat x3 > ${msg})", function $11$164_tpl_if_true_____tpl_if_true____tpl_repeat_x3___tpl_repeat_x3___$_msg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\"><template if.bind=\"true\" repeat.for=\"i of 3\"><template repeat.for=\"i of 3\">${msg}</template></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$11$165 tpl.repeat x3 +> (tpl.if.true > (tpl.repeat x3 +> (tpl.if.true > tpl.repeat x3 > ${msg})))", function $11$165_tpl_repeat_x3_____tpl_if_true____tpl_repeat_x3_____tpl_if_true___tpl_repeat_x3___$_msg____() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template repeat.for=\"i of 3\" if.bind=\"true\"><template repeat.for=\"i of 3\" if.bind=\"true\"><template repeat.for=\"i of 3\">${msg}</template></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaaaaaaaaaaaaaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$11$166 tpl.if.true +> (tpl.repeat x3 > (tpl.repeat x3 +> (tpl.if.true > tpl.repeat x3 > ${msg})))", function $11$166_tpl_if_true_____tpl_repeat_x3____tpl_repeat_x3_____tpl_if_true___tpl_repeat_x3___$_msg____() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\" repeat.for=\"i of 3\"><template repeat.for=\"i of 3\" if.bind=\"true\"><template repeat.for=\"i of 3\">${msg}</template></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaaaaaaaaaaaaaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$11$167 tpl.repeat x3 +> (tpl.if.true > (tpl.if.true +> tpl.repeat x3 > tpl.repeat x3 > ${msg}))", function $11$167_tpl_repeat_x3_____tpl_if_true____tpl_if_true____tpl_repeat_x3___tpl_repeat_x3___$_msg___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template repeat.for=\"i of 3\" if.bind=\"true\"><template if.bind=\"true\" repeat.for=\"i of 3\"><template repeat.for=\"i of 3\">${msg}</template></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaaaaaaaaaaaaaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$11$168 tpl.if.true +> (tpl.repeat x3 > (tpl.if.true +> tpl.repeat x3 > tpl.repeat x3 > ${msg}))", function $11$168_tpl_if_true_____tpl_repeat_x3____tpl_if_true____tpl_repeat_x3___tpl_repeat_x3___$_msg___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\" repeat.for=\"i of 3\"><template if.bind=\"true\" repeat.for=\"i of 3\"><template repeat.for=\"i of 3\">${msg}</template></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaaaaaaaaaaaaaaaaaaaaaaaaaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$11$201 (tpl.if.true > tpl.repeat x3 > ${msg}) + (else > tpl.repeat x3 > \"b\")", function $11$201__tpl_if_true___tpl_repeat_x3___$_msg______else___tpl_repeat_x3____b__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\"><template repeat.for=\"i of 3\">${msg}</template></template><template else><template repeat.for=\"i of 3\">b</template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$11$202 (tpl.if.false > tpl.repeat x3 > \"b\") + (tpl.else > tpl.repeat x3 > ${msg})", function $11$202__tpl_if_false___tpl_repeat_x3____b______tpl_else___tpl_repeat_x3___$_msg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"false\"><template repeat.for=\"i of 3\">b</template></template><template else><template repeat.for=\"i of 3\">${msg}</template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$11$221 tpl.if.true > ((tpl.if.true > tpl.repeat x3 > ${msg}) + (else > tpl.repeat x3 > \"b\"))", function $11$221_tpl_if_true_____tpl_if_true___tpl_repeat_x3___$_msg______else___tpl_repeat_x3____b___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\"><template if.bind=\"true\"><template repeat.for=\"i of 3\">${msg}</template></template><template else><template repeat.for=\"i of 3\">b</template></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$11$222 (tpl.if.true > ((tpl.if.true > tpl.repeat x3 > ${msg}) + (else > tpl.repeat x3 > \"b\"))) + (else > tpl.repeat x3 > \"b\")", function $11$222__tpl_if_true_____tpl_if_true___tpl_repeat_x3___$_msg______else___tpl_repeat_x3____b________else___tpl_repeat_x3____b__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\"><template if.bind=\"true\"><template repeat.for=\"i of 3\">${msg}</template></template><template else><template repeat.for=\"i of 3\">b</template></template></template><template else><template repeat.for=\"i of 3\">b</template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$11$223 tpl.if.true > ((tpl.if.false > tpl.repeat x3 > \"b\") + (else > tpl.repeat x3 > ${msg}))", function $11$223_tpl_if_true_____tpl_if_false___tpl_repeat_x3____b______else___tpl_repeat_x3___$_msg___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\"><template if.bind=\"false\"><template repeat.for=\"i of 3\">b</template></template><template else><template repeat.for=\"i of 3\">${msg}</template></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$11$224 (tpl.if.true > ((tpl.if.false > tpl.repeat x3 > \"b\") + (else > tpl.repeat x3 > ${msg}))) + (else > tpl.repeat x3 > \"b\")", function $11$224__tpl_if_true_____tpl_if_false___tpl_repeat_x3____b______else___tpl_repeat_x3___$_msg________else___tpl_repeat_x3____b__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\"><template if.bind=\"false\"><template repeat.for=\"i of 3\">b</template></template><template else><template repeat.for=\"i of 3\">${msg}</template></template></template><template else><template repeat.for=\"i of 3\">b</template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$11$225 (tpl.if.false > \"\") + (tpl.else > (if.bind=\"false\" > tpl.repeat x3 > \"b\") + (tpl.else > tpl.repeat x3 > ${msg}))", function $11$225__tpl_if_false__________tpl_else____if_bind__false____tpl_repeat_x3____b______tpl_else___tpl_repeat_x3___$_msg___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"false\"></template><template else><template if.bind=\"false\"><template repeat.for=\"i of 3\">b</template></template><template else><template repeat.for=\"i of 3\">${msg}</template></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$11$226 (tpl.if.false > tpl.repeat x3 > \"b\") + (tpl.else > (if.bind=\"false\" > tpl.repeat x3 > \"b\") + (tpl.else > tpl.repeat x3 > ${msg}))", function $11$226__tpl_if_false___tpl_repeat_x3____b______tpl_else____if_bind__false____tpl_repeat_x3____b______tpl_else___tpl_repeat_x3___$_msg___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"false\"><template repeat.for=\"i of 3\">b</template></template><template else><template if.bind=\"false\"><template repeat.for=\"i of 3\">b</template></template><template else><template repeat.for=\"i of 3\">${msg}</template></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$11$227 (tpl.if.false > tpl.repeat x3 > \"b\") + (tpl.else > (if.bind=\"true\" > tpl.repeat x3 > ${msg}))", function $11$227__tpl_if_false___tpl_repeat_x3____b______tpl_else____if_bind__true____tpl_repeat_x3___$_msg___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"false\"><template repeat.for=\"i of 3\">b</template></template><template else><template if.bind=\"true\"><template repeat.for=\"i of 3\">${msg}</template></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$11$228 (tpl.if.false > tpl.repeat x3 > \"b\") + (tpl.else +> tpl.if.true > tpl.repeat x3 > ${msg})", function $11$228__tpl_if_false___tpl_repeat_x3____b______tpl_else____tpl_if_true___tpl_repeat_x3___$_msg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"false\"><template repeat.for=\"i of 3\">b</template></template><template else if.bind=\"true\"><template repeat.for=\"i of 3\">${msg}</template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
    });
    describe("$12$xxx template=tpl.repeat x3 > ${msg}, notTemplate=<template repeat.for=\"i of 3\">${notMsg}</template> (tpl)", function $12$xxx_template_tpl_repeat_x3___$_msg___notTemplate__template_repeat_for__i_of_3__$_notMsg___template___tpl_() {
        it("$12$201 (tpl.if.true > tpl.repeat x3 > ${msg}) + (else > tpl.repeat x3 > ${notMsg})", function $12$201__tpl_if_true___tpl_repeat_x3___$_msg______else___tpl_repeat_x3___$_notMsg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\"><template repeat.for=\"i of 3\">${msg}</template></template><template else><template repeat.for=\"i of 3\">${notMsg}</template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$12$202 (tpl.if.false > tpl.repeat x3 > ${notMsg}) + (tpl.else > tpl.repeat x3 > ${msg})", function $12$202__tpl_if_false___tpl_repeat_x3___$_notMsg______tpl_else___tpl_repeat_x3___$_msg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"false\"><template repeat.for=\"i of 3\">${notMsg}</template></template><template else><template repeat.for=\"i of 3\">${msg}</template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$12$221 tpl.if.true > ((tpl.if.true > tpl.repeat x3 > ${msg}) + (else > tpl.repeat x3 > ${notMsg}))", function $12$221_tpl_if_true_____tpl_if_true___tpl_repeat_x3___$_msg______else___tpl_repeat_x3___$_notMsg___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\"><template if.bind=\"true\"><template repeat.for=\"i of 3\">${msg}</template></template><template else><template repeat.for=\"i of 3\">${notMsg}</template></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$12$222 (tpl.if.true > ((tpl.if.true > tpl.repeat x3 > ${msg}) + (else > tpl.repeat x3 > ${notMsg}))) + (else > tpl.repeat x3 > ${notMsg})", function $12$222__tpl_if_true_____tpl_if_true___tpl_repeat_x3___$_msg______else___tpl_repeat_x3___$_notMsg________else___tpl_repeat_x3___$_notMsg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\"><template if.bind=\"true\"><template repeat.for=\"i of 3\">${msg}</template></template><template else><template repeat.for=\"i of 3\">${notMsg}</template></template></template><template else><template repeat.for=\"i of 3\">${notMsg}</template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$12$223 tpl.if.true > ((tpl.if.false > tpl.repeat x3 > ${notMsg}) + (else > tpl.repeat x3 > ${msg}))", function $12$223_tpl_if_true_____tpl_if_false___tpl_repeat_x3___$_notMsg______else___tpl_repeat_x3___$_msg___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\"><template if.bind=\"false\"><template repeat.for=\"i of 3\">${notMsg}</template></template><template else><template repeat.for=\"i of 3\">${msg}</template></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$12$224 (tpl.if.true > ((tpl.if.false > tpl.repeat x3 > ${notMsg}) + (else > tpl.repeat x3 > ${msg}))) + (else > tpl.repeat x3 > ${notMsg})", function $12$224__tpl_if_true_____tpl_if_false___tpl_repeat_x3___$_notMsg______else___tpl_repeat_x3___$_msg________else___tpl_repeat_x3___$_notMsg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"true\"><template if.bind=\"false\"><template repeat.for=\"i of 3\">${notMsg}</template></template><template else><template repeat.for=\"i of 3\">${msg}</template></template></template><template else><template repeat.for=\"i of 3\">${notMsg}</template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$12$225 (tpl.if.false > \"\") + (tpl.else > (if.bind=\"false\" > tpl.repeat x3 > ${notMsg}) + (tpl.else > tpl.repeat x3 > ${msg}))", function $12$225__tpl_if_false__________tpl_else____if_bind__false____tpl_repeat_x3___$_notMsg______tpl_else___tpl_repeat_x3___$_msg___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"false\"></template><template else><template if.bind=\"false\"><template repeat.for=\"i of 3\">${notMsg}</template></template><template else><template repeat.for=\"i of 3\">${msg}</template></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$12$226 (tpl.if.false > tpl.repeat x3 > ${notMsg}) + (tpl.else > (if.bind=\"false\" > tpl.repeat x3 > ${notMsg}) + (tpl.else > tpl.repeat x3 > ${msg}))", function $12$226__tpl_if_false___tpl_repeat_x3___$_notMsg______tpl_else____if_bind__false____tpl_repeat_x3___$_notMsg______tpl_else___tpl_repeat_x3___$_msg___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"false\"><template repeat.for=\"i of 3\">${notMsg}</template></template><template else><template if.bind=\"false\"><template repeat.for=\"i of 3\">${notMsg}</template></template><template else><template repeat.for=\"i of 3\">${msg}</template></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$12$227 (tpl.if.false > tpl.repeat x3 > ${notMsg}) + (tpl.else > (if.bind=\"true\" > tpl.repeat x3 > ${msg}))", function $12$227__tpl_if_false___tpl_repeat_x3___$_notMsg______tpl_else____if_bind__true____tpl_repeat_x3___$_msg___() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"false\"><template repeat.for=\"i of 3\">${notMsg}</template></template><template else><template if.bind=\"true\"><template repeat.for=\"i of 3\">${msg}</template></template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
        it("$12$228 (tpl.if.false > tpl.repeat x3 > ${notMsg}) + (tpl.else +> tpl.if.true > tpl.repeat x3 > ${msg})", function $12$228__tpl_if_false___tpl_repeat_x3___$_notMsg______tpl_else____tpl_if_true___tpl_repeat_x3___$_msg__() {
            const { au, host } = setup();
            const name = "app";
            const template = "<template><template if.bind=\"false\"><template repeat.for=\"i of 3\">${notMsg}</template></template><template else if.bind=\"true\"><template repeat.for=\"i of 3\">${msg}</template></template></template>";
            const App = CustomElementResource.define({ name, template }, class {
                msg = "a";
                notMsg = "b";
            });
            const component = new App();
            au.app({ host, component });
            au.start();
            expect(host.textContent).to.equal("aaa", "after start");
            au.stop();
            expect(host.textContent).to.equal("", "after stop");
        });
    });
});
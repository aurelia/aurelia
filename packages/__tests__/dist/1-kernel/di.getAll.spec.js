var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { all, DI, resolve, newInstanceOf, Registration } from '@aurelia/kernel';
import { assert } from '@aurelia/testing';
describe('1-kernel/di.getAll.spec.ts', function () {
    let container;
    beforeEach(function () {
        container = DI.createContainer();
    });
    describe('good', function () {
        // eslint-disable
        for (const searchAncestors of [true, false])
            for (const regInChild of [true, false])
                for (const regInParent of [true, false]) {
                    // eslint-enable
                    it(`@all(_, ${searchAncestors}) + [child ${regInChild}] + [parent ${regInParent}]`, function () {
                        let Foo = class Foo {
                            constructor(test) {
                                this.test = test;
                            }
                        };
                        Foo = __decorate([
                            __param(0, all('test', searchAncestors)),
                            __metadata("design:paramtypes", [Array])
                        ], Foo);
                        const child = container.createChild();
                        if (regInParent) {
                            container.register(Registration.instance('test', 'test1'));
                        }
                        if (regInChild) {
                            child.register(Registration.instance('test', 'test0'));
                        }
                        const expectation = regInChild ? ['test0'] : [];
                        if (regInParent && (searchAncestors || !regInChild)) {
                            expectation.push('test1');
                        }
                        assert.deepStrictEqual(child.get(Foo).test, expectation);
                    });
                }
    });
    describe('realistic usage', function () {
        const IAttrPattern = DI.createInterface('IAttrPattern');
        // eslint-disable
        for (const searchAncestors of [true, false])
            for (const regInChild of [true, false])
                for (const regInParent of [true, false]) {
                    // eslint-enable
                    it(`@all(IAttrPattern, ${searchAncestors}) + [child ${regInChild}] + [parent ${regInParent}]`, function () {
                        let Foo = class Foo {
                            constructor(attrPatterns) {
                                this.attrPatterns = attrPatterns;
                            }
                            patterns() {
                                return this.attrPatterns.map(ap => ap.id);
                            }
                        };
                        Foo = __decorate([
                            __param(0, all(IAttrPattern, searchAncestors)),
                            __metadata("design:paramtypes", [Array])
                        ], Foo);
                        const child = container.createChild();
                        if (regInParent) {
                            Array
                                .from({ length: 5 }, (_, idx) => class {
                                constructor() {
                                    this.id = idx;
                                }
                                static register(c) {
                                    Registration.singleton(IAttrPattern, this).register(c);
                                }
                            })
                                .forEach(klass => container.register(klass));
                        }
                        if (regInChild) {
                            Array
                                .from({ length: 5 }, (_, idx) => class {
                                constructor() {
                                    this.id = idx + 5;
                                }
                                static register(c) {
                                    Registration.singleton(IAttrPattern, this).register(c);
                                }
                            })
                                .forEach(klass => child.register(klass));
                        }
                        let parentExpectation = [];
                        const childExpectation = regInChild ? [5, 6, 7, 8, 9] : [];
                        if (regInParent) {
                            if (searchAncestors || !regInChild) {
                                childExpectation.push(0, 1, 2, 3, 4);
                            }
                            parentExpectation.push(0, 1, 2, 3, 4);
                        }
                        if (regInChild) {
                            parentExpectation = childExpectation;
                        }
                        assert.deepStrictEqual(child.get(Foo).patterns(), childExpectation, `Deps in [child] should have been ${JSON.stringify(childExpectation)}`);
                        assert.deepStrictEqual(container.get(Foo).patterns(), parentExpectation, `Deps in [parent] should have been ${JSON.stringify(regInChild ? childExpectation : parentExpectation)}`);
                    });
                }
    });
    describe('resolve()', function () {
        it('works with .getAll()', function () {
            let id = 0;
            const II = DI.createInterface();
            class Model {
                constructor() {
                    this.id = ++id;
                }
            }
            container.register(Registration.transient(II, class I1 {
                constructor() {
                    this.a = resolve(Model);
                }
            }), Registration.transient(II, class I2 {
                constructor() {
                    this.a = resolve(newInstanceOf(Model));
                }
            }));
            const iis = container.getAll(II);
            assert.deepStrictEqual(iis.map(a => a.a.id), [1, 2]);
        });
    });
});
//# sourceMappingURL=di.getAll.spec.js.map
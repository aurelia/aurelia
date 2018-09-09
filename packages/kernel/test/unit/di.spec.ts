import { DI, Container, PLATFORM } from "../../src";
import { expect } from "chai";
import { _ } from "./util";

function assertIsMutableArray(arr: any[], length: number): void {
  expect(Array.isArray(arr)).to.be.true;
  expect(arr instanceof Array).to.be.true;
  expect(arr).not.to.equal(PLATFORM.emptyArray);
  expect(arr.length).to.equal(length);
  arr.push(null);
  expect(arr.length).to.equal(length + 1);
  arr.pop();
  expect(arr.length).to.equal(length);
}

describe(`DI`, () => {
  function decorator(): ClassDecorator { return (target: any) => target; }

  describe(`createContainer()`, () => {
    it(`returns an instance of Container`, () => {
      const actual = DI.createContainer();
      expect(actual).to.be.instanceof(Container);
    });

    it(`returns a new container every time`, () => {
      expect(DI.createContainer()).not.to.equal(DI.createContainer());
    });
  });

  describe(`getDesignParamTypes()`, () => {
    it(`returns PLATFORM.emptyArray if the class has no constructor or decorators`, () => {
      class Foo {}
      const actual = DI.getDesignParamTypes(Foo);
      expect(actual).to.equal(PLATFORM.emptyArray);
    });
    it(`returns PLATFORM.emptyArray if the class has a decorator but no constructor`, () => {
      @decorator()
      class Foo {}
      const actual = DI.getDesignParamTypes(Foo);
      expect(actual).to.equal(PLATFORM.emptyArray);
    });

    it(`returns PLATFORM.emptyArray if the class has no constructor args or decorators`, () => {
      class Foo { constructor() {} }
      const actual = DI.getDesignParamTypes(Foo);
      expect(actual).to.equal(PLATFORM.emptyArray);
    });

    it(`returns PLATFORM.emptyArray if the class has constructor args but no decorators`, () => {
      class Bar {}
      class Foo { constructor(public bar: Bar) {} }
      const actual = DI.getDesignParamTypes(Foo);
      expect(actual).to.equal(PLATFORM.emptyArray);
    });

    it(`returns PLATFORM.emptyArray if the class has constructor args and the decorator is applied via a function call`, () => {
      class Bar {}
      class Foo { constructor(public bar: Bar) {} }
      decorator()(Foo)
      const actual = DI.getDesignParamTypes(Foo);
      expect(actual).to.equal(PLATFORM.emptyArray);
    });

    it(`returns PLATFORM.emptyArray if the class is declared as an anonymous variable, even if it has ctor args and decorator is applied properly`, () => {
      class Bar {}
      @decorator()
      const FooInline = class{ constructor(public bar: Bar) {} }
      const actual = DI.getDesignParamTypes(FooInline);
      expect(actual).to.equal(PLATFORM.emptyArray);
    });

    it(`returns PLATFORM.emptyArray if the class is declared as a named variable, even if it has ctor args and decorator is applied properly`, () => {
      class Bar {}
      @decorator()
      const FooInline = class Foo{ constructor(public bar: Bar) {} }
      const actual = DI.getDesignParamTypes(FooInline);
      expect(actual).to.equal(PLATFORM.emptyArray);
    });

    describe(`returns an empty array if the class has a decorator but no constructor args`, () => {
      @decorator()
      class Foo { constructor() {} }

      it(_`${Foo}`, () => {
        const actual = DI.getDesignParamTypes(Foo);
        assertIsMutableArray(actual, 0);
      });


      it(_`${class{}}`, () => {
        let cls;
        function anonDecorator(): ClassDecorator { return (target: any) => cls = target; }
        @anonDecorator()
        class{ constructor() {} };
        const actual = DI.getDesignParamTypes(cls);
        assertIsMutableArray(actual, 0);
      });
    });

    describe(`falls back to Object for declarations that cannot be statically analyzed`, () => {
      interface argCtor{}
      for (const argCtor of <any[]>[
        class Bar{},
        function(){},
        ()=>{},
        class{},
        {},
        Error,
        Array,
        (class Bar{}).prototype,
        (class Bar{}).prototype.constructor
      ]) {
        @decorator()
        class FooDecoratorInvocation{ constructor(public arg: argCtor){} }

        it(_`${FooDecoratorInvocation} { constructor(${argCtor}) }`, () => {
          const actual = DI.getDesignParamTypes(FooDecoratorInvocation);
          assertIsMutableArray(actual, 1);
          expect(actual[0]).to.equal(Object);
        });

        @(<any>decorator)
        class FooDecoratorNonInvocation{ constructor(public arg: argCtor){} }

        it(_`${FooDecoratorNonInvocation} { constructor(${argCtor}) }`, () => {
          const actual = DI.getDesignParamTypes(FooDecoratorInvocation);
          assertIsMutableArray(actual, 1);
          expect(actual[0]).to.equal(Object);
        });
      }
    });

    describe(`falls back to Object for mismatched declarations`, () => {

      // Technically we're testing TypeScript here, but it's still useful to have an in-place fixture to validate our assumptions
      // And also to have an alert mechanism for when the functionality in TypeScript changes, without having to read the changelogs

      // What we're verifying here is under which circumstances a function object will or won't be properly resolved as a
      // designParamType, and it seems like the presence of a same-name interface actually breaks this in some situations

      // Note: the order of declaration (interface first or other thing first) doesn't seem to matter here
      // But whether or not there is a direct type cast, does seem to matter in the case of AnonClass (note the negative assertion)

      // It's unclear whether the difference between AnonClass (which works) and AnonClassInterface (which doesn't work) is a bug in TS or not,
      // but it has ramifications we need to keep in mind.

      interface Bar {}
      class Bar{}

      interface AnonClass {}
      const AnonClass = class{};

      interface AnonClassInterface {}
      const AnonClassInterface: AnonClassInterface = class{};

      interface VarFunc {}
      const VarFunc = function(){};

      interface VarFuncInterface {}
      const VarFuncInterface: VarFuncInterface = function(){};

      interface Func {}
      function Func(){}

      interface Arrow {}
      const Arrow = () => {};

      interface ArrowInterface {}
      const ArrowInterface: ArrowInterface = () => {};

      describe(`decorator invocation`, () => {
        @decorator()
        class FooBar{ constructor(public arg: Bar){} }

        // Note: this is a negative assertion meant to make it easier to compare this describe with the one below
        it(_`NOT ${FooBar} { constructor(public ${Bar}) }`, () => {
          const actual = DI.getDesignParamTypes(FooBar);
          assertIsMutableArray(actual, 1);
          expect(actual[0]).to.equal(Bar);
        });

        @decorator()
        class FooAnonClass{ constructor(public arg: AnonClass){} }

        // Note: this is a negative assertion meant to make it easier to compare this describe with the one below
        it(_`NOT ${FooAnonClass} { constructor(public ${AnonClass}) }`, () => {
          const actual = DI.getDesignParamTypes(FooAnonClass);
          assertIsMutableArray(actual, 1);
          expect(actual[0]).to.equal(AnonClass);
        });

        @decorator()
        class FooAnonClassInterface{ constructor(public arg: AnonClassInterface){} }

        // this one is particularly interesting..
        it(_`${FooAnonClassInterface} { constructor(public ${AnonClassInterface}) }`, () => {
          const actual = DI.getDesignParamTypes(FooAnonClassInterface);
          assertIsMutableArray(actual, 1);
          expect(actual[0]).to.equal(Object);
        });

        @decorator()
        class FooVarFunc{ constructor(public arg: VarFunc){} }

        it(_`${FooVarFunc} { constructor(public ${VarFunc}) }`, () => {
          const actual = DI.getDesignParamTypes(FooVarFunc);
          assertIsMutableArray(actual, 1);
          expect(actual[0]).to.equal(Object);
        });

        @decorator()
        class FooVarFuncInterface{ constructor(public arg: VarFuncInterface){} }

        it(_`${FooVarFuncInterface} { constructor(public ${VarFuncInterface}) }`, () => {
          const actual = DI.getDesignParamTypes(FooVarFuncInterface);
          assertIsMutableArray(actual, 1);
          expect(actual[0]).to.equal(Object);
        });

        @decorator()
        class FooFunc{ constructor(public arg: Func){} }

        it(_`${FooFunc} { constructor(public ${Func}) }`, () => {
          const actual = DI.getDesignParamTypes(FooFunc);
          assertIsMutableArray(actual, 1);
          expect(actual[0]).to.equal(Object);
        });

        @decorator()
        class FooArrow{ constructor(public arg: Arrow){} }

        it(_`${FooArrow} { constructor(public ${Arrow}) }`, () => {
          const actual = DI.getDesignParamTypes(FooArrow);
          assertIsMutableArray(actual, 1);
          expect(actual[0]).to.equal(Object);
        });

        @decorator()
        class FooArrowInterface{ constructor(public arg: ArrowInterface){} }

        it(_`${FooArrowInterface} { constructor(public ${ArrowInterface}) }`, () => {
          const actual = DI.getDesignParamTypes(FooArrowInterface);
          assertIsMutableArray(actual, 1);
          expect(actual[0]).to.equal(Object);
        });
      });
    });

    describe(`returns the correct types for valid declarations`, () => {
      class Bar{}

      const AnonClass = class{};

      const VarFunc = function(){};

      function Func(){}

      const Arrow = () => {};

      describe(`decorator invocation`, () => {
        @decorator()
        class FooBar{ constructor(public arg: Bar){} }

        it(_`${FooBar} { constructor(public ${Bar}) }`, () => {
          const actual = DI.getDesignParamTypes(FooBar);
          assertIsMutableArray(actual, 1);
          expect(actual[0]).to.equal(Bar);
        });

        @decorator()
        class FooAnonClass{ constructor(public arg: AnonClass){} }

        it(_`${FooAnonClass} { constructor(public ${AnonClass}) }`, () => {
          const actual = DI.getDesignParamTypes(FooAnonClass);
          assertIsMutableArray(actual, 1);
          expect(actual[0]).to.equal(AnonClass);
        });

        @decorator()
        class FooVarFunc{ constructor(public arg: VarFunc){} }

        it(_`${FooVarFunc} { constructor(public ${VarFunc}) }`, () => {
          const actual = DI.getDesignParamTypes(FooVarFunc);
          assertIsMutableArray(actual, 1);
          expect(actual[0]).to.equal(VarFunc);
        });

        @decorator()
        class FooFunc{ constructor(public arg: Func){} }

        it(_`${FooFunc} { constructor(public ${Func}) }`, () => {
          const actual = DI.getDesignParamTypes(FooFunc);
          assertIsMutableArray(actual, 1);
          expect(actual[0]).to.equal(Func);
        });

        @decorator()
        class FooArrow{ constructor(public arg: Arrow){} }

        it(_`${FooArrow} { constructor(public ${Arrow}) }`, () => {
          const actual = DI.getDesignParamTypes(FooArrow);
          assertIsMutableArray(actual, 1);
          expect(actual[0]).to.equal(Arrow);
        });
      });
    });
  });

  describe(`getDependencies()`, () => {

  });

  describe(`createInterface()`, () => {

  });

  describe(`inject()`, () => {

  });
});

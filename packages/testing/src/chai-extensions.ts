import { State } from '@aurelia/runtime';
import * as chai from 'chai';

export function initializeChaiExtensions(): void {
  chai.use(function(_chai: any, utils: any): void {
    const Assertion = _chai.Assertion;

    Assertion.addProperty('$state');
    function getStateFlagName(state: State): string {
      if (state === 0) return 'none';
      const names = [];
      if (state & State.isBinding) names.push('isBinding');
      if (state & State.isBound) names.push('isBound');
      if (state & State.isAttaching) names.push('isAttaching');
      if (state & State.isAttached) names.push('isAttached');
      if (state & State.isMounted) names.push('isMounted');
      if (state & State.isDetaching) names.push('isDetaching');
      if (state & State.isUnbinding) names.push('isUnbinding');
      if (state & State.isCached) names.push('isCached');
      return names.join('|');
    }

    for (const stateFlag of [
      State.none,
      State.isBinding,
      State.isBound,
      State.isAttaching,
      State.isAttached,
      State.isMounted,
      State.isDetaching,
      State.isUnbinding,
      State.isCached,
    ]) {
      const flagName = getStateFlagName(stateFlag);
      Assertion.addChainableMethod(
        flagName,
        function (this: any, msg: string): void {
          msg = msg === undefined ? '' : `${msg} - `;
          const state = this._obj['$state'];
          let currentFlag = stateFlag;
          if (utils.flag(this, 'isBinding')) currentFlag |= State.isBinding;
          if (utils.flag(this, 'isBound')) currentFlag |= State.isBound;
          if (utils.flag(this, 'isAttaching')) currentFlag |= State.isAttaching;
          if (utils.flag(this, 'isAttached')) currentFlag |= State.isAttached;
          if (utils.flag(this, 'isMounted')) currentFlag |= State.isMounted;
          if (utils.flag(this, 'isDetaching')) currentFlag |= State.isDetaching;
          if (utils.flag(this, 'isUnbinding')) currentFlag |= State.isUnbinding;
          if (utils.flag(this, 'isCached')) currentFlag |= State.isCached;

          this.assert(
            (state & currentFlag) === currentFlag,
            `${msg}expected $state to have flags [${getStateFlagName(currentFlag)}], but got [${getStateFlagName(state)}]`,
            `${msg}expected $state to NOT have flags [${getStateFlagName(currentFlag)}], but got [${getStateFlagName(state)}]`);
        },
        function (this: any): void {
          utils.flag(this, flagName, true);
        }
      );
    }
  });

  chai.use(function (_chai: any, utils: any): void {
    const slice = Array.prototype.slice;

    function isSpy(putativeSpy: any): boolean {
      return typeof putativeSpy === 'function' &&
        typeof putativeSpy.getCall === 'function' &&
        typeof putativeSpy.calledWithExactly === 'function';
    }

    function timesInWords(count: number): string {
      switch (count) {
        case 1: {
          return 'once';
        }
        case 2: {
          return 'twice';
        }
        case 3: {
          return 'thrice';
        }
        default: {
          return `${(count || 0)} times`;
        }
      }
    }

    function isCall(putativeCall: any): boolean {
      return putativeCall && isSpy(putativeCall.proxy);
    }

    function assertCanWorkWith(assertion: any): void {
      if (!isSpy(assertion._obj) && !isCall(assertion._obj)) {
        throw new TypeError(`${utils.inspect(assertion._obj)} is not a spy or a call to a spy!`);
      }
    }

    function getMessages(spy: any, action: any, nonNegatedSuffix: any, always: any, args?: any): {
      affirmative(): void;
      negative(): void;
    } {
      const verbPhrase = always ? 'always have ' : 'have ';
      nonNegatedSuffix = nonNegatedSuffix || "";
      if (isSpy(spy.proxy)) {
        spy = spy.proxy;
      }

      function printfArray(array: any): any {
        return spy.printf.apply(spy, array);
      }

      return {
        affirmative: function (): any {
          return printfArray(['expected %n to ' + verbPhrase + action + nonNegatedSuffix].concat(args));
        },
        negative: function (): any {
          return printfArray(['expected %n to not ' + verbPhrase + action].concat(args));
        }
      };
    }

    function sinonProperty(name: any, action: any, nonNegatedSuffix: any): void {
      utils.addProperty(_chai.Assertion.prototype, name, function (this: any): void {
        assertCanWorkWith(this);

        const messages = getMessages(this._obj, action, nonNegatedSuffix, false);
        this.assert(this._obj[name], messages.affirmative, messages.negative);
      });
    }

    function sinonPropertyAsBooleanMethod(name: any, action: any, nonNegatedSuffix: any): void {
      utils.addMethod(_chai.Assertion.prototype, name, function (this: any, arg: any): void {
        assertCanWorkWith(this);

        const messages = getMessages(this._obj, action, nonNegatedSuffix, false, [timesInWords(arg)]);
        this.assert(this._obj[name] === arg, messages.affirmative, messages.negative);
      });
    }

    function createSinonMethodHandler(sinonName: any, action: any, nonNegatedSuffix: any): () => void {
      return function (this: any): void {
        assertCanWorkWith(this);

        const alwaysSinonMethod = `always${sinonName[0].toUpperCase()}${sinonName.substring(1)}`;
        const shouldBeAlways = utils.flag(this, 'always') && typeof this._obj[alwaysSinonMethod] === 'function';
        const sinonMethodName = shouldBeAlways ? alwaysSinonMethod : sinonName;

        const messages = getMessages(this._obj, action, nonNegatedSuffix, shouldBeAlways, slice.call(arguments));
        this.assert(
          this._obj[sinonMethodName].apply(this._obj, arguments),
          messages.affirmative,
          messages.negative
        );
      };
    }

    function sinonMethodAsProperty(name: any, action: any, nonNegatedSuffix?: any): void {
      const handler = createSinonMethodHandler(name, action, nonNegatedSuffix);
      utils.addProperty(_chai.Assertion.prototype, name, handler);
    }

    function exceptionalSinonMethod(chaiName: any, sinonName: any, action: any, nonNegatedSuffix?: any): void {
      const handler = createSinonMethodHandler(sinonName, action, nonNegatedSuffix);
      utils.addMethod(_chai.Assertion.prototype, chaiName, handler);
    }

    function sinonMethod(name: any, action: any, nonNegatedSuffix?: any): void {
      exceptionalSinonMethod(name, name, action, nonNegatedSuffix);
    }

    utils.addProperty(_chai.Assertion.prototype, 'always', function (this: any): void {
      utils.flag(this, 'always', true);
    });

    sinonProperty('called', 'been called', ' at least once, but it was never called');
    sinonPropertyAsBooleanMethod('callCount', 'been called exactly %1', ', but it was called %c%C');
    sinonProperty('calledOnce', 'been called exactly once', ', but it was called %c%C');
    sinonProperty('calledTwice', 'been called exactly twice', ', but it was called %c%C');
    sinonProperty('calledThrice', 'been called exactly thrice', ', but it was called %c%C');
    sinonMethodAsProperty('calledWithNew', 'been called with new');
    sinonMethod('calledBefore', 'been called before %1');
    sinonMethod('calledAfter', 'been called after %1');
    sinonMethod('calledImmediatelyBefore', 'been called immediately before %1');
    sinonMethod('calledImmediatelyAfter', 'been called immediately after %1');
    sinonMethod('calledOn', 'been called with %1 as this', ', but it was called with %t instead');
    sinonMethod('calledWith', 'been called with arguments %*', '%D');
    sinonMethod('calledOnceWith', 'been called exactly once with arguments %*', '%D');
    sinonMethod('calledWithExactly', 'been called with exact arguments %*', '%D');
    sinonMethod('calledOnceWithExactly', 'been called exactly once with exact arguments %*', '%D');
    sinonMethod('calledWithMatch', 'been called with arguments matching %*', '%D');
    sinonMethod('returned', 'returned %1');
    exceptionalSinonMethod('thrown', 'threw', 'thrown %1');
  });
}

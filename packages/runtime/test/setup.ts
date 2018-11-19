import * as chai from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { State } from "../src";


chai.should();
chai.use(sinonChai);
chai.use(function(_chai, utils) {
  const Assertion = _chai['Assertion'];

  Assertion.addProperty('$state');
  function getStateFlagName(state) {
    if (state === 0) return 'none';
    let names = [];
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
      function(msg) {
        msg = msg === undefined ? '' : msg + ' - ';
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
      function() {
        utils.flag(this, flagName, true);
      }
    );
  }
})

Error.stackTraceLimit = Infinity;

const unitTests: any = (require as any).context('./unit', true, /\.spec/);
unitTests.keys().forEach(unitTests);

const integrationTests: any = (require as any).context('./integration', true, /\.spec/);
integrationTests.keys().forEach(integrationTests);



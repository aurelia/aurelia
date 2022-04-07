import {
  ISignaler,
  LifecycleFlags
} from '@aurelia/runtime';
import {
  MockPropertySubscriber,
  eachCartesianJoinFactory,
  assert,
} from '@aurelia/testing';
import { DI } from '@aurelia/kernel';

describe('ISignaler', function () {
  type $1 = [string, ISignaler, MockPropertySubscriber[]];
  type $2 = [string, string[]];
  type $3 = [string, LifecycleFlags];
  type $4 = [string, (sut: ISignaler) => void];
  type $5 = [string, (sut: ISignaler) => void];

  const sutVariations: (() => [string, ISignaler, MockPropertySubscriber[]])[] = [
    () => {
      const sut = DI.createContainer().get(ISignaler);
      const subscribers = [
        new MockPropertySubscriber()
      ];
      return [`1 subscriber  `, sut, subscribers];
    },
    () => {
      const sut = DI.createContainer().get(ISignaler);
      const subscribers = [
        new MockPropertySubscriber(),
        new MockPropertySubscriber(),
        new MockPropertySubscriber()
      ];
      return [`3 subscribers `, sut, subscribers];
    }
  ];

  const signalsVariations: (($1: $1) => [string, string[]])[] = [
    () => {
      const signals = [];
      return [`[]                            `, signals];
    },
    () => {
      const signals = ['foo'];
      return [`['foo']                       `, signals];
    },
    () => {
      const signals = ['foo', 'bar', 'baz'];
      return [`['foo', 'bar', 'baz']         `, signals];
    },
    () => {
      const signals = [1, 2, 3];
      return [`[1, 2, 3]                     `, signals];
    },
    () => {
      const signals = [Symbol(), Symbol(), Symbol()];
      return [`[Symbol(), Symbol(), Symbol()]`, signals];
    },
    () => {
      const signals = ['foo', 1, Symbol()];
      return [`['foo', 1, Symbol()]          `, signals];
    }
  ];

  const flagsVariations: (($1: $1, $2: $2) => [string, LifecycleFlags])[] = [
    () => {
      const flags = undefined;
      return [`undefined`, flags];
    },
  ];

  const addSignalVariations: (($1: $1, $2: $2, $3: $3) => [string, (sut: ISignaler) => void])[] = [
    ([_$11, _$12, mocks], [_$21, signals], [_$31, _flags]) => [`addSignalListener   `, sut => {
      for (let i = 0, ii = signals.length; i < ii; ++i) {
        const signal = signals[i];
        for (let j = 0, jj = mocks.length; j < jj; ++j) {
          const mock = mocks[j];
          sut.addSignalListener(signal, mock);
        }
      }
      for (const signal of signals) {
        assert.strictEqual(sut['signals'][signal].size, mocks.length, `sut['signals'][signal].size`);
      }
    }],
    ([_$11, _$12, mocks], [_$21, signals], [_$31, _flags]) => [`addSignalListener x2`, sut => {
      for (let i = 0, ii = signals.length; i < ii; ++i) {
        const signal = signals[i];
        for (let j = 0, jj = mocks.length; j < jj; ++j) {
          const mock = mocks[j];
          sut.addSignalListener(signal, mock);
          sut.addSignalListener(signal, mock);
        }
      }
      for (const signal of signals) {
        assert.strictEqual(sut['signals'][signal].size, mocks.length, `sut['signals'][signal].size`);
      }
    }]
  ];

  const dispatchSignalVariations: (($1: $1, $2: $2, $3: $3, $4: $4) => [string, (sut: ISignaler) => void])[] = [
    ([_$11, _$12, mocks], [_$21, _signals], [_$31, flags]) => [`dispatch nonexisting signal`, sut => {
      sut.dispatchSignal('asdf', flags);
      for (let j = 0, jj = mocks.length; j < jj; ++j) {
        const mock = mocks[j];
        assert.strictEqual(mock.calls.length, 0, `mock.calls.length`);
      }
    }],
    ([_$11, _$12, mocks], [_$21, signals], [_$31, flags]) => [`dispatchSignal             `, sut => {
      for (let i = 0, ii = signals.length; i < ii; ++i) {
        const signal = signals[i];
        sut.dispatchSignal(signal, flags);
        for (let j = 0, jj = mocks.length; j < jj; ++j) {
          const mock = mocks[j];
          assert.strictEqual(mock.calls.length, i + 1, `mock.calls.length`);
          assert.strictEqual(mock.calls[i][0], 'handleChange', `mock.calls[i][0]`);
          assert.strictEqual(mock.calls[i][1], undefined, `mock.calls[i][1]`);
          assert.strictEqual(mock.calls[i][2], undefined, `mock.calls[i][2]`);
          assert.strictEqual(mock.calls[i][3], flags, `mock.calls[i][3]`);
        }
      }
    }],
    ([_$11, _$12, mocks], [_$21, signals], [_$31, flags]) => [`dispatchSignal x2          `, sut => {
      for (let i = 0, ii = signals.length; i < ii; ++i) {
        const signal = signals[i];
        sut.dispatchSignal(signal, flags);
        sut.dispatchSignal(signal, flags);
        for (let j = 0, jj = mocks.length; j < jj; ++j) {
          const mock = mocks[j];
          assert.strictEqual(mock.calls.length, i * 2 + 2, `mock.calls.length`);
          assert.strictEqual(mock.calls[i][0], 'handleChange', `mock.calls[i][0]`);
          assert.strictEqual(mock.calls[i][1], undefined, `mock.calls[i][1]`);
          assert.strictEqual(mock.calls[i][2], undefined, `mock.calls[i][2]`);
          assert.strictEqual(mock.calls[i][3], flags, `mock.calls[i][3]`);
          assert.strictEqual(mock.calls[i * 2 + 1][0], 'handleChange', `mock.calls[i * 2 + 1][0]`);
          assert.strictEqual(mock.calls[i * 2 + 1][1], undefined, `mock.calls[i * 2 + 1][1]`);
          assert.strictEqual(mock.calls[i * 2 + 1][2], undefined, `mock.calls[i * 2 + 1][2]`);
          assert.strictEqual(mock.calls[i * 2 + 1][3], flags, `mock.calls[i * 2 + 1][3]`);
        }
      }
    }]
  ];

  const removeSignalVariations: (($1: $1, $2: $2, $3: $3, $4: $4, $5: $5) => [string, (sut: ISignaler) => void])[] = [
    ([_$11, _$12, mocks], [_$21, signals], [_$31, flags]) => [`removeSignalListener     -> dispatchSignal`, sut => {
      for (let i = 0, ii = mocks.length; i < ii; ++i) {
        const mock = mocks[i];
        for (let j = 0, jj = signals.length; j < jj; ++j) {
          const signal = signals[j];
          sut.removeSignalListener(signal, mock);
        }
        mock.calls = [];
      }
      for (const signal of signals) {
        assert.strictEqual(sut['signals'][signal].size, 0, `sut['signals'][signal].size`);
      }
      for (let i = 0, ii = signals.length; i < ii; ++i) {
        const signal = signals[i];
        sut.dispatchSignal(signal, flags);
        for (let j = 0, jj = mocks.length; j < jj; ++j) {
          const mock = mocks[j];
          assert.strictEqual(mock.calls.length, 0, `mock.calls.length`);
        }
      }
    }],
    ([_$11, _$12, mocks], [_$21, signals], [_$31, flags]) => [`remove nonexisting signal -> dispatchSignal`, sut => {
      for (let i = 0, ii = mocks.length; i < ii; ++i) {
        const mock = mocks[i];
        sut.removeSignalListener('asdf', mock);
        mock.calls = [];
      }
      for (const signal of signals) {
        assert.strictEqual(sut['signals'][signal].size, mocks.length, `sut['signals'][signal].size`);
      }
      for (let i = 0, ii = signals.length; i < ii; ++i) {
        const signal = signals[i];
        sut.dispatchSignal(signal, flags);
        for (let j = 0, jj = mocks.length; j < jj; ++j) {
          const mock = mocks[j];
          assert.strictEqual(mock.calls.length, i + 1, `mock.calls.length`);
        }
      }
    }]
  ];

  const inputs: [typeof sutVariations, typeof signalsVariations, typeof flagsVariations, typeof addSignalVariations, typeof dispatchSignalVariations, typeof removeSignalVariations]
    = [sutVariations, signalsVariations, flagsVariations, addSignalVariations, dispatchSignalVariations, removeSignalVariations];

  eachCartesianJoinFactory(inputs, ([t1, sut, _mocks], [t2, _signals], [t3, _flags], [t4, addSignalListener], [t5, dispatchSignal], [t6, removeSignalListener]) => {
      it(`${t1}, signals=${t2}, flags=${t3} -> ${t4} -> ${t5} -> ${t6}`, function () {
        addSignalListener(sut);
        dispatchSignal(sut);
        removeSignalListener(sut);
      });
    }
  );
});

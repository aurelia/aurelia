import { TestContext, assert } from '@aurelia/testing';

describe('3-runtime-html/dom-queue.spec.ts', function () {
  const platform = TestContext.create().platform;

  const sut = platform.domQueue;
  describe(`can queue task`, function () {
    it('basic', function (done) {
      sut.queueTask(() => {
        assert.areTaskQueuesEmpty();

        done();
      });
    });

    it('read', function (done) {
      sut.queueRead(() => {
        assert.areTaskQueuesEmpty();

        done();
      });
    });

    it('write', function (done) {
      sut.queueWrite(() => {
        assert.areTaskQueuesEmpty();

        done();
      });
    });

    it('read -> write', function (done) {
      const result = [];

      sut.queueRead(() => {
        result.push('read');

        assert.deepStrictEqual(result, ['read']);
      });

      sut.queueWrite(() => {
        result.push('write');

        assert.deepStrictEqual(result, ['read', 'write']);
        assert.areTaskQueuesEmpty();
        done();
      });
    });

    it('read -> write -> write', function (done) {
      const result = [];

      sut.queueRead(() => {
        result.push('read');

        assert.deepStrictEqual(result, ['read']);
      });

      sut.queueWrite(() => {
        result.push('write');

        assert.deepStrictEqual(result, ['read', 'write']);
      });

      sut.queueWrite(() => {
        result.push('write');

        assert.deepStrictEqual(result, ['read', 'write', 'write']);
        assert.areTaskQueuesEmpty();
        done();
      });
    });

    it('write -> read', function (done) {
      const result = [];

      sut.queueWrite(() => {
        result.push('write');

        assert.deepStrictEqual(result, ['read', 'write']);
        assert.areTaskQueuesEmpty();
        done();
      });

      sut.queueRead(() => {
        result.push('read');

        assert.deepStrictEqual(result, ['read']);
      });
    });

    it('read -> write -> read', function (done) {
      const result = [];

      sut.queueRead(() => {
        result.push('read');

        assert.deepStrictEqual(result, ['read']);
      });

      sut.queueWrite(() => {
        result.push('write');

        assert.deepStrictEqual(result, ['read', 'read', 'write']);
        assert.areTaskQueuesEmpty();
        done();
      });

      sut.queueRead(() => {
        result.push('read');
      });
    });

    it('write -> read -> write', function (done) {
      const result = [];

      sut.queueWrite(() => {
        result.push('write');

        assert.deepStrictEqual(result, ['read', 'write']);
      });

      sut.queueRead(() => {
        result.push('read');

        assert.deepStrictEqual(result, ['read']);
      });

      sut.queueWrite(() => {
        result.push('write');

        assert.deepStrictEqual(result, ['read', 'write', 'write']);
        assert.areTaskQueuesEmpty();
        done();
      });
    });
  });

  describe(`can cancel task`, function () {
    it('basic', function () {
      const task = sut.queueTask(() => {
        assert.fail('should have been cancelled');
      });

      task.cancel();
      assert.areTaskQueuesEmpty();
    });

    it('read', function () {
      const task = sut.queueRead(() => {
        assert.fail('should have been cancelled');
      });

      task.cancel();
      assert.areTaskQueuesEmpty();
    });

    it('write', function () {
      const task = sut.queueWrite(() => {
        assert.fail('should have been cancelled');
      });

      task.cancel();
      assert.areTaskQueuesEmpty();
    });

    it('read(cancel) -> write', function (done) {
      const result = [];

      const read = sut.queueRead(() => {
        assert.fail('should have been cancelled');
      });

      sut.queueWrite(() => {
        result.push('write');

        assert.deepStrictEqual(result, ['write']);
        assert.areTaskQueuesEmpty();
        done();
      });

      read.cancel();
    });

    it('read -> write(cancel)', function (done) {
      const result = [];

      sut.queueRead(() => {
        result.push('read');

        assert.deepStrictEqual(result, ['read']);
        assert.areTaskQueuesEmpty();
        done();
      });

      const write = sut.queueWrite(() => {
        assert.fail('should have been cancelled');
      });

      write.cancel();
    });

    it('read(cancel) -> write(cancel)', function () {
      const read = sut.queueRead(() => {
        assert.fail('should have been cancelled');
      });

      const write = sut.queueWrite(() => {
        assert.fail('should have been cancelled');
      });

      read.cancel();
      write.cancel();
      assert.areTaskQueuesEmpty();
    });
  });

  describe(`can yield`, function () {
    it('basic', async function () {
      const result = [];

      sut.queueTask(() => {
        result.push('write');
      });

      await sut.yield();
      assert.deepStrictEqual(result, ['write']);
      assert.areTaskQueuesEmpty();
    });

    it('read', async function () {
      const result = [];

      sut.queueRead(() => {
        result.push('read');
      });

      await sut.yield();
      assert.deepStrictEqual(result, ['read']);
      assert.areTaskQueuesEmpty();
    });

    it('write', async function () {
      const result = [];

      sut.queueWrite(() => {
        result.push('write');
      });

      await sut.yield();
      assert.deepStrictEqual(result, ['write']);
      assert.areTaskQueuesEmpty();
    });

    it('read -> write', async function () {
      const result = [];

      sut.queueRead(() => {
        result.push('read');
      });

      sut.queueWrite(() => {
        result.push('write');
      });

      await sut.yield();
      assert.deepStrictEqual(result, ['read', 'write']);
      assert.areTaskQueuesEmpty();
    });
  });

  describe('nested flush', function () {
    it('read1(read2)', async function () {
      const result = [];

      sut.queueRead(() => {
        result.push('read1');
        sut.queueRead(() => {
          result.push('read2');
        });
      });

      await sut.yield();
      assert.deepStrictEqual(result, ['read1']);

      await sut.yield();
      assert.deepStrictEqual(result, ['read1', 'read2']);

      assert.areTaskQueuesEmpty();
    });

    it('write1(write2)', async function () {
      const result = [];

      sut.queueWrite(() => {
        result.push('write1');
        sut.queueWrite(() => {
          result.push('write2');
        });
      });

      await sut.yield();
      assert.deepStrictEqual(result, ['write1']);

      await sut.yield();
      assert.deepStrictEqual(result, ['write1', 'write2']);

      assert.areTaskQueuesEmpty();
    });

    it('write1(read2)', async function () {
      const result = [];

      sut.queueWrite(() => {
        result.push('write1');
        sut.queueRead(() => {
          result.push('read2');
        });
      });

      await sut.yield();
      assert.deepStrictEqual(result, ['write1']);

      await sut.yield();
      assert.deepStrictEqual(result, ['write1', 'read2']);

      assert.areTaskQueuesEmpty();
    });

    it('read1(write1)', async function () {
      const result = [];

      sut.queueRead(() => {
        result.push('read1');
        // executes within same flush cycle
        sut.queueWrite(() => {
          result.push('write1');
        });
      });

      await sut.yield();
      assert.deepStrictEqual(result, ['read1', 'write1']);

      assert.areTaskQueuesEmpty();
    });

    it('read1(write1(read2))', async function () {
      const result = [];

      sut.queueRead(() => {
        result.push('read1');
        // executes within same flush cycle
        sut.queueWrite(() => {
          result.push('write1');
          // goes to next cycle
          sut.queueWrite(() => {
            result.push('write2');
          });
        });
      });

      await sut.yield();
      assert.deepStrictEqual(result, ['read1', 'write1']);

      await sut.yield();
      assert.deepStrictEqual(result, ['read1', 'write1', 'write2']);

      assert.areTaskQueuesEmpty();
    });
  });
});

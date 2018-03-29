import { registerTimes, resolveTimes, createClasses } from './util';
import { PLATFORM } from 'aurelia-pal';
import { Container } from 'aurelia-dependency-injection';

describe('Container', () => {
  let sut: Container;

  beforeEach(() => {
    sut = new Container();
  });

  /**
   * Resolve classes (cold)
   */
  it('should resolve unregistered class in <1ms when the graph has 1 root, width 1, depth 250', () => {
    testColdResolutionPerformance(sut, { count: 1, depth: 250, width: 1, maxResTime: 1 });
  });

  it('should resolve unregistered class in <1ms when the graph has 250 roots, width 1, depth 1', () => {
    testColdResolutionPerformance(sut, { count: 250, depth: 1, width: 1, maxResTime: 1 });
  });

  it('should resolve unregistered class in <1ms when the graph has 25 roots, width 10, depth 1', () => {
    testColdResolutionPerformance(sut, { count: 25, depth: 1, width: 10, maxResTime: 1 });
  });

  it('should resolve unregistered class in <1ms when the graph has 1 root, width 4, depth 5', () => {
    testColdResolutionPerformance(sut, { count: 1, depth: 5, width: 4, maxResTime: 1 });
  });

  it('should resolve unregistered class in <1ms when the graph has 5 roots, width 5, depth 2', () => {
    testColdResolutionPerformance(sut, { count: 5, depth: 2, width: 5, maxResTime: 1 });
  });

  /**
   * Resolve classes (warm, transient)
   */
  it('should resolve registered transient class in <0.1ms when the graph has 1 root, width 1, depth 100', () => {
    testWarmResolutionPerformance(sut, { count: 1, depth: 100, width: 1, maxResTime: 0.1 });
  });

  it('should resolve registered transient class in <0.1ms when the graph has 100 roots, width 1, depth 1', () => {
    testWarmResolutionPerformance(sut, { count: 100, depth: 1, width: 1, maxResTime: 0.1 });
  });

  it('should resolve registered transient class in <0.1ms when the graph has 10 roots, width 10, depth 1', () => {
    testWarmResolutionPerformance(sut, { count: 10, depth: 1, width: 10, maxResTime: 0.1 });
  });

  it('should resolve registered transient class in <0.1ms when the graph has 1 root, width 3, depth 5', () => {
    testWarmResolutionPerformance(sut, { count: 1, depth: 5, width: 3, maxResTime: 0.1 });
  });

  it('should resolve registered transient class in <0.1ms when the graph has 5 roots, width 4, depth 2', () => {
    testWarmResolutionPerformance(sut, { count: 5, depth: 2, width: 4, maxResTime: 0.1 });
  });

  /**
   * Resolve strings
   */
  it('should resolve 100 keys in <150ms (cold)', () => {
    const container = sut;
    const actual = resolveTimes(100, container as Container);
    expect(actual).toBeLessThan(150);
  });

  it('should resolve 10k keys in <100ms (warm)', () => {
    const container = sut;
    const actual = resolveTimes(10000, container as Container, true);
    expect(actual).toBeLessThan(100);
  });
});

function testWarmResolutionPerformance(container: Container, params: { [key: string]: any }): void {
  params.allClasses = [];
  const { count, depth, width, maxResTime, allClasses } = params;
  const classes = createClasses(params as any);
  for (const $class of allClasses) {
    container.registerTransient($class);
  }
  for (let i = 0; i < count; i++) {
    container.get(classes[i]);
  }
  const start = PLATFORM.performance.now();
  for (let i = 0; i < count; i++) {
    container.get(classes[i]);
  }
  const actual = PLATFORM.performance.now() - start;
  const resCount = allClasses.length;
  const timeEach = actual / resCount;
  const timeTotal = parseInt(actual as any, 10);
  console.log(`${resCount} resolutions (${count}x${width}x${depth}) in ${timeTotal}ms (${timeEach}ms each)`);
  expect(timeEach).toBeLessThan(maxResTime);
}

function testColdResolutionPerformance(container: Container, params: { [key: string]: any }): void {
  params.allClasses = [];
  const { count, depth, width, maxResTime, allClasses } = params;
  const classes = createClasses(params as any);
  const start = PLATFORM.performance.now();
  for (let i = 0; i < count; i++) {
    container.get(classes[i]);
  }
  const actual = PLATFORM.performance.now() - start;
  const resCount = allClasses.length;
  const timeEach = actual / resCount;
  const timeTotal = parseInt(actual as any, 10);
  console.log(`${resCount} resolutions (${count}x${width}x${depth}) in ${timeTotal}ms (${timeEach}ms each)`);
  expect(timeEach).toBeLessThan(maxResTime);
}

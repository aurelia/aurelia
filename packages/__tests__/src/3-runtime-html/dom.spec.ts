import { customElement, FragmentNodeSequence, isRenderLocation, refs, IRenderLocation, findMatchingEndMarker, partitionSiblingNodes } from '@aurelia/runtime-html';
import { TestContext, assert, createFixture } from '@aurelia/testing';

describe('3-runtime-html/dom.spec.ts', function () {
  this.beforeEach(function () {
    refs.hideProp = false;
  });

  describe('refs', function () {
    it('does not set $aurelia on host if refs.hideProp is true', function () {
      refs.hideProp = true;
      const { appHost } = createFixture('', class {});

      assert.strictEqual(appHost['$aurelia'], undefined);
    });

    it('does not set $au on host if refs.hideProp is true', function () {
      refs.hideProp = true;
      const { assertText, appHost } = createFixture('<el>', class {}, [@customElement({ name: 'el', template: 'ell'}) class {}]);
      assertText('ell');
      assert.strictEqual(appHost.querySelector('el')['$au'], undefined);
    });
  });

  const ctx = TestContext.create();
  let sut: FragmentNodeSequence;

  const widthArr = [1, 2, 3];
  const depthArr = [0, 1, 2, 3];

  describe('[UNIT] findTargets - <!--au--> marker system', function () {
    it('finds element targets via <!--au--> marker', function () {
      const node = ctx.doc.createElement('div');
      node.innerHTML = `<template><!--au--><div></div></template>`;
      const fragment = (node.firstElementChild as HTMLTemplateElement).content;
      sut = new FragmentNodeSequence(ctx.platform, fragment);
      const actual = sut.findTargets();

      assert.strictEqual(actual.length, 1, 'should find 1 target');
      assert.strictEqual((actual[0] as Element).tagName, 'DIV', 'target should be the div');
    });

    it('finds multiple element targets in document order', function () {
      const node = ctx.doc.createElement('div');
      node.innerHTML = `<template><!--au--><div></div><!--au--><span></span><!--au--><p></p></template>`;
      const fragment = (node.firstElementChild as HTMLTemplateElement).content;
      sut = new FragmentNodeSequence(ctx.platform, fragment);
      const actual = sut.findTargets();

      assert.strictEqual(actual.length, 3, 'should find 3 targets');
      assert.strictEqual((actual[0] as Element).tagName, 'DIV', 'target 0 should be div');
      assert.strictEqual((actual[1] as Element).tagName, 'SPAN', 'target 1 should be span');
      assert.strictEqual((actual[2] as Element).tagName, 'P', 'target 2 should be p');
    });

    it('finds comment marker targets (text interpolation)', function () {
      const node = ctx.doc.createElement('div');
      // <!--au--> followed by text node (space)
      node.innerHTML = `<template><!--au--> </template>`;
      const fragment = (node.firstElementChild as HTMLTemplateElement).content;
      sut = new FragmentNodeSequence(ctx.platform, fragment);
      const actual = sut.findTargets();

      assert.strictEqual(actual.length, 1, 'should find 1 target');
      assert.strictEqual(actual[0].nodeType, 3, 'target should be text node');
      assert.strictEqual((actual[0] as Text).textContent, ' ', 'target should be the space text');
    });

    it('finds render location targets (containerless/TC)', function () {
      const node = ctx.doc.createElement('div');
      // <!--au--><!--au-start--><!--au-end-->
      node.innerHTML = `<template><!--au--><!--au-start--><!--au-end--></template>`;
      const fragment = (node.firstElementChild as HTMLTemplateElement).content;
      sut = new FragmentNodeSequence(ctx.platform, fragment);
      const actual = sut.findTargets();

      assert.strictEqual(actual.length, 1, 'should find 1 target');
      assert.strictEqual(isRenderLocation(actual[0]), true, 'target should be render location');
      const loc = actual[0] as IRenderLocation;
      assert.strictEqual(loc.nodeType, 8, 'render location should be comment');
      assert.strictEqual((loc as unknown as Comment).textContent, 'au-end', 'should be au-end');
      assert.strictEqual(loc.$start?.textContent, 'au-start', 'should have $start pointing to au-start');
    });

    it('finds mixed element and comment targets with correct indices', function () {
      const node = ctx.doc.createElement('div');
      // Mix: text interpolation, element, TC, element
      node.innerHTML = `<template><!--au--> <!--au--><div></div><!--au--><!--au-start--><!--au-end--><!--au--><span></span></template>`;
      const fragment = (node.firstElementChild as HTMLTemplateElement).content;
      sut = new FragmentNodeSequence(ctx.platform, fragment);
      const actual = sut.findTargets();

      assert.strictEqual(actual.length, 4, 'should find 4 targets');
      assert.strictEqual(actual[0].nodeType, 3, 'target 0 should be text node');
      assert.strictEqual((actual[1] as Element).tagName, 'DIV', 'target 1 should be div');
      assert.strictEqual(isRenderLocation(actual[2]), true, 'target 2 should be render location');
      assert.strictEqual((actual[3] as Element).tagName, 'SPAN', 'target 3 should be span');
    });

    it('finds deeply nested element targets', function () {
      const node = ctx.doc.createElement('div');
      node.innerHTML = `<template><div><span><!--au--><p></p></span></div></template>`;
      const fragment = (node.firstElementChild as HTMLTemplateElement).content;
      sut = new FragmentNodeSequence(ctx.platform, fragment);
      const actual = sut.findTargets();

      assert.strictEqual(actual.length, 1, 'should find 1 target');
      assert.strictEqual((actual[0] as Element).tagName, 'P', 'target should be the nested p');
    });

    it('finds targets in document order (implicit indexing)', function () {
      const node = ctx.doc.createElement('div');
      // 3 markers, targets in document order (0, 1, 2)
      node.innerHTML = `<template><!--au--><div></div><!--au--><span></span><!--au--><p></p></template>`;
      const fragment = (node.firstElementChild as HTMLTemplateElement).content;
      sut = new FragmentNodeSequence(ctx.platform, fragment);
      const actual = sut.findTargets();

      assert.strictEqual(actual.length, 3, 'should find 3 targets');
      assert.strictEqual((actual[0] as Element).tagName, 'DIV', 'target 0 should be div');
      assert.strictEqual((actual[1] as Element).tagName, 'SPAN', 'target 1 should be span');
      assert.strictEqual((actual[2] as Element).tagName, 'P', 'target 2 should be p');
    });

    it('handles 10+ targets correctly (implicit ordering)', function () {
      const node = ctx.doc.createElement('div');
      // Each <!--au--> marker is followed by a <div> target
      const elements = Array(12).fill(0).map(() => `<!--au--><div></div>`).join('');
      node.innerHTML = `<template>${elements}</template>`;
      const fragment = (node.firstElementChild as HTMLTemplateElement).content;
      sut = new FragmentNodeSequence(ctx.platform, fragment);
      const actual = sut.findTargets();

      assert.strictEqual(actual.length, 12, 'should find 12 targets');
      for (let i = 0; i < 12; i++) {
        assert.strictEqual((actual[i] as Element).tagName, 'DIV', `target ${i} should be div`);
      }
    });

    it('removes <!--au--> markers after processing', function () {
      const node = ctx.doc.createElement('div');
      node.innerHTML = `<template><!--au--> <!--au--> </template>`;
      const fragment = (node.firstElementChild as HTMLTemplateElement).content;
      sut = new FragmentNodeSequence(ctx.platform, fragment);
      sut.findTargets();

      // Check that <!--au--> markers are removed
      // NodeFilter.SHOW_COMMENT = 128
      const walker = ctx.doc.createTreeWalker(fragment, 128);
      const comments: string[] = [];
      while (walker.nextNode()) {
        comments.push((walker.currentNode as Comment).textContent!);
      }
      // No 'au' comments should remain
      assert.strictEqual(comments.filter(c => c === 'au').length, 0, 'no <!--au--> markers should remain');
    });

    it('preserves au-start/au-end comments for render locations', function () {
      const node = ctx.doc.createElement('div');
      node.innerHTML = `<template><!--au--><!--au-start--><!--au-end--></template>`;
      const fragment = (node.firstElementChild as HTMLTemplateElement).content;
      sut = new FragmentNodeSequence(ctx.platform, fragment);
      sut.findTargets();

      // Check that au-start and au-end remain
      // NodeFilter.SHOW_COMMENT = 128
      const walker = ctx.doc.createTreeWalker(fragment, 128);
      const comments: string[] = [];
      while (walker.nextNode()) {
        comments.push((walker.currentNode as Comment).textContent!);
      }
      assert.deepStrictEqual(comments, ['au-start', 'au-end'], 'au-start and au-end should remain');
    });
  });

  describe('[UNIT] insertBefore', function () {
    for (const width of widthArr) {
      for (const depth of depthArr.filter(d => d > 0)) {
        it(`should insert the view before the refNode under the parent of the refNode (depth=${depth},width=${width})`, function () {
          const node = ctx.doc.createElement('div');
          const fragment = createFragment(ctx, node, 0, depth, width);
          sut = new FragmentNodeSequence(ctx.platform, fragment);
          const parent = ctx.doc.createElement('div');
          const ref1 = ctx.doc.createElement('div');
          const ref2 = ctx.doc.createElement('div');
          parent.appendChild(ref1);
          parent.appendChild(ref2);
          sut.insertBefore(ref2 as HTMLDivElement & Comment);
          assert.strictEqual(parent.childNodes.length, width + 2, `parent.childNodes.length`);
          assert.strictEqual(fragment.childNodes.length, 0, `fragment.childNodes.length`);
          assert.strictEqual(parent.childNodes.item(0) === ref1, true, `parent.childNodes.item(0) === ref1`);
          let i = 0;
          while (i < width) {
            assert.strictEqual(parent.childNodes.item(i + 1) === sut.childNodes[i], true, `parent.childNodes.item(i + 1) === sut.childNodes[i]`);
            i++;
          }
          assert.strictEqual(parent.childNodes.item(width + 1) === ref2, true, `parent.childNodes.item(width + 1) === ref2`);
          assert.strictEqual(fragment.childNodes.length, 0, `fragment.childNodes.length`);
        });
      }
    }
  });

  describe('appendTo', function () {
    for (const width of widthArr) {
      for (const depth of depthArr.filter(d => d > 0)) {
        it(`should append the view to the parent (depth=${depth},width=${width})`, function () {
          const node = ctx.doc.createElement('div');
          const fragment = createFragment(ctx, node, 0, depth, width);
          sut = new FragmentNodeSequence(ctx.platform, fragment);
          const parent = ctx.doc.createElement('div');
          sut.appendTo(parent);
          assert.strictEqual(parent.childNodes.length, width, `parent.childNodes.length`);
          assert.strictEqual(fragment.childNodes.length, 0, `fragment.childNodes.length`);
          let i = 0;
          while (i < width) {
            assert.strictEqual(parent.childNodes.item(i) === sut.childNodes[i], true, `parent.childNodes.item(i) === sut.childNodes[i]`);
            i++;
          }
        });
      }
    }
  });

  // eslint-disable-next-line mocha/no-skipped-tests
  describe.skip('remove', function () {
    for (const width of widthArr) {
      for (const depth of depthArr.filter(d => d > 0)) {
        it(`should put the view back into the fragment (depth=${depth},width=${width})`, function () {
          const node = ctx.doc.createElement('div');
          const fragment = createFragment(ctx, node, 0, depth, width);
          sut = new FragmentNodeSequence(ctx.platform, fragment);
          const parent = ctx.doc.createElement('div');
          assert.strictEqual(parent.childNodes.length, 0, `parent.childNodes.length`);
          assert.strictEqual(fragment.childNodes.length, width, `fragment.childNodes.length`);
          parent.appendChild(fragment);
          assert.strictEqual(parent.childNodes.length, width, `parent.childNodes.length`);
          assert.strictEqual(fragment.childNodes.length, 0, `fragment.childNodes.length`);
          sut.remove();
          assert.strictEqual(parent.childNodes.length, 0, `parent.childNodes.length`);
          assert.strictEqual(fragment.childNodes.length, width, `fragment.childNodes.length`);
        });
      }
    }
  });
});

function createFragment(ctx: TestContext, node: HTMLElement, level: number, depth: number, width: number): DocumentFragment {
  const root: any = ctx.doc.createDocumentFragment();
  appendTree(root, node, level, depth, width);
  return root;
}

function appendTree(root: HTMLElement, node: HTMLElement, level: number, depth: number, width: number): void {
  if (level < depth) {
    const children = appendChildren(root, node, width);
    for (const child of children) {
      appendTree(child, node, level + 1, depth, width);
    }
  }
}

function appendChildren(parent: HTMLElement, child: HTMLElement, count: number): HTMLElement[] {
  const children = new Array(count);
  let i = 0;
  while (i < count) {
    const el = child.cloneNode(true);
    parent.appendChild(el);
    children[i] = el;
    i++;
  }
  return children;
}

// =============================================================================
// SSR Hydration DOM Primitives
// =============================================================================

describe('[UNIT] findMatchingEndMarker', function () {
  const ctx = TestContext.create();

  it('finds matching end for simple au-start/au-end pair', function () {
    const parent = ctx.doc.createElement('div');
    const start = ctx.doc.createComment('au-start');
    const content = ctx.doc.createElement('span');
    const end = ctx.doc.createComment('au-end');

    parent.appendChild(start);
    parent.appendChild(content);
    parent.appendChild(end);

    const result = findMatchingEndMarker(start);
    assert.strictEqual(result, end, 'should find the matching au-end');
  });

  it('handles nested au-start/au-end pairs correctly', function () {
    const parent = ctx.doc.createElement('div');
    // Outer: au-start ... au-end
    //   Inner: au-start ... au-end
    const outerStart = ctx.doc.createComment('au-start');
    const innerStart = ctx.doc.createComment('au-start');
    const innerContent = ctx.doc.createElement('span');
    const innerEnd = ctx.doc.createComment('au-end');
    const outerContent = ctx.doc.createElement('div');
    const outerEnd = ctx.doc.createComment('au-end');

    parent.appendChild(outerStart);
    parent.appendChild(innerStart);
    parent.appendChild(innerContent);
    parent.appendChild(innerEnd);
    parent.appendChild(outerContent);
    parent.appendChild(outerEnd);

    // Finding end for outer should skip the inner pair
    const resultOuter = findMatchingEndMarker(outerStart);
    assert.strictEqual(resultOuter, outerEnd, 'should find outer au-end, not inner');

    // Finding end for inner should find the inner end
    const resultInner = findMatchingEndMarker(innerStart);
    assert.strictEqual(resultInner, innerEnd, 'should find inner au-end');
  });

  it('handles deeply nested pairs (3 levels)', function () {
    const parent = ctx.doc.createElement('div');
    const level1Start = ctx.doc.createComment('au-start');
    const level2Start = ctx.doc.createComment('au-start');
    const level3Start = ctx.doc.createComment('au-start');
    const level3End = ctx.doc.createComment('au-end');
    const level2End = ctx.doc.createComment('au-end');
    const level1End = ctx.doc.createComment('au-end');

    parent.appendChild(level1Start);
    parent.appendChild(level2Start);
    parent.appendChild(level3Start);
    parent.appendChild(level3End);
    parent.appendChild(level2End);
    parent.appendChild(level1End);

    assert.strictEqual(findMatchingEndMarker(level1Start), level1End);
    assert.strictEqual(findMatchingEndMarker(level2Start), level2End);
    assert.strictEqual(findMatchingEndMarker(level3Start), level3End);
  });

  it('returns null when no matching end is found', function () {
    const parent = ctx.doc.createElement('div');
    const start = ctx.doc.createComment('au-start');
    const content = ctx.doc.createElement('span');
    // No au-end

    parent.appendChild(start);
    parent.appendChild(content);

    const result = findMatchingEndMarker(start);
    assert.strictEqual(result, null, 'should return null when no match');
  });

  it('returns null when unbalanced (more starts than ends)', function () {
    const parent = ctx.doc.createElement('div');
    const start1 = ctx.doc.createComment('au-start');
    const start2 = ctx.doc.createComment('au-start');
    const end1 = ctx.doc.createComment('au-end');
    // Missing second au-end

    parent.appendChild(start1);
    parent.appendChild(start2);
    parent.appendChild(end1);

    // start1 should not find a match (end1 belongs to start2)
    const result = findMatchingEndMarker(start1);
    assert.strictEqual(result, null, 'should return null for unbalanced pairs');
  });
});

describe('[UNIT] partitionSiblingNodes', function () {
  const ctx = TestContext.create();

  function createRenderLocation(parent: Element, children: Node[]): IRenderLocation<Comment> {
    const start = ctx.doc.createComment('au-start');
    const end = ctx.doc.createComment('au-end') as IRenderLocation<Comment>;
    end.$start = start;

    parent.appendChild(start);
    for (const child of children) {
      parent.appendChild(child);
    }
    parent.appendChild(end);

    return end;
  }

  it('partitions nodes according to nodeCounts', function () {
    const parent = ctx.doc.createElement('div');
    const nodes = [
      ctx.doc.createElement('span'),
      ctx.doc.createElement('span'),
      ctx.doc.createElement('span'),
      ctx.doc.createElement('span'),
    ];
    nodes[0].textContent = 'A';
    nodes[1].textContent = 'B';
    nodes[2].textContent = 'C';
    nodes[3].textContent = 'D';

    const location = createRenderLocation(parent, nodes);

    // Partition into groups of [1, 2, 1]
    const result = partitionSiblingNodes(location, [1, 2, 1]);

    assert.strictEqual(result.length, 3, 'should have 3 partitions');
    assert.strictEqual(result[0].length, 1, 'partition 0 should have 1 node');
    assert.strictEqual(result[1].length, 2, 'partition 1 should have 2 nodes');
    assert.strictEqual(result[2].length, 1, 'partition 2 should have 1 node');

    assert.strictEqual((result[0][0] as Element).textContent, 'A');
    assert.strictEqual((result[1][0] as Element).textContent, 'B');
    assert.strictEqual((result[1][1] as Element).textContent, 'C');
    assert.strictEqual((result[2][0] as Element).textContent, 'D');
  });

  it('handles empty nodeCounts array', function () {
    const parent = ctx.doc.createElement('div');
    const nodes = [ctx.doc.createElement('span')];
    const location = createRenderLocation(parent, nodes);

    const result = partitionSiblingNodes(location, []);

    assert.strictEqual(result.length, 0, 'should return empty array');
  });

  it('handles nodeCounts exceeding available nodes', function () {
    const parent = ctx.doc.createElement('div');
    const nodes = [ctx.doc.createElement('span'), ctx.doc.createElement('span')];
    const location = createRenderLocation(parent, nodes);

    // Request more nodes than available
    const result = partitionSiblingNodes(location, [5]);

    assert.strictEqual(result.length, 1, 'should have 1 partition');
    assert.strictEqual(result[0].length, 2, 'partition should have only available nodes');
  });

  it('handles zero in nodeCounts', function () {
    const parent = ctx.doc.createElement('div');
    const nodes = [ctx.doc.createElement('span'), ctx.doc.createElement('span')];
    const location = createRenderLocation(parent, nodes);

    const result = partitionSiblingNodes(location, [0, 1, 0, 1]);

    assert.strictEqual(result.length, 4, 'should have 4 partitions');
    assert.strictEqual(result[0].length, 0, 'partition 0 should be empty');
    assert.strictEqual(result[1].length, 1, 'partition 1 should have 1 node');
    assert.strictEqual(result[2].length, 0, 'partition 2 should be empty');
    assert.strictEqual(result[3].length, 1, 'partition 3 should have 1 node');
  });

  it('returns empty array when location has no $start', function () {
    const parent = ctx.doc.createElement('div');
    const end = ctx.doc.createComment('au-end') as IRenderLocation<Comment>;
    // Not setting $start
    parent.appendChild(end);

    const result = partitionSiblingNodes(end, [1, 2]);

    assert.strictEqual(result.length, 0, 'should return empty array');
  });
});

describe('[UNIT] FragmentNodeSequence.adoptChildren', function () {
  const ctx = TestContext.create();

  it('adopts all children from host element', function () {
    const host = ctx.doc.createElement('div');
    const child1 = ctx.doc.createElement('span');
    const child2 = ctx.doc.createElement('p');
    const child3 = ctx.doc.createTextNode('text');

    child1.textContent = 'span';
    child2.textContent = 'paragraph';

    host.appendChild(child1);
    host.appendChild(child2);
    host.appendChild(child3);

    const seq = FragmentNodeSequence.adoptChildren(ctx.platform, host);

    assert.strictEqual(seq.childNodes.length, 3, 'should have 3 children');
    assert.strictEqual(seq.firstChild, child1, 'firstChild should be span');
    assert.strictEqual(seq.lastChild, child3, 'lastChild should be text node');
  });

  it('collects <!--au--> markers as targets', function () {
    const host = ctx.doc.createElement('div');
    host.innerHTML = '<!--au--><span></span><!--au--><p></p>';

    const seq = FragmentNodeSequence.adoptChildren(ctx.platform, host);
    const targets = seq.findTargets();

    assert.strictEqual(targets.length, 2, 'should find 2 targets');
    assert.strictEqual((targets[0] as Element).tagName, 'SPAN');
    assert.strictEqual((targets[1] as Element).tagName, 'P');
  });

  it('handles render location targets in adopted content', function () {
    const host = ctx.doc.createElement('div');
    host.innerHTML = '<!--au--><!--au-start-->content<!--au-end-->';

    const seq = FragmentNodeSequence.adoptChildren(ctx.platform, host);
    const targets = seq.findTargets();

    assert.strictEqual(targets.length, 1, 'should find 1 target');
    assert.strictEqual(isRenderLocation(targets[0]), true, 'target should be render location');
  });

  it('handles empty host', function () {
    const host = ctx.doc.createElement('div');

    const seq = FragmentNodeSequence.adoptChildren(ctx.platform, host);

    assert.strictEqual(seq.childNodes.length, 0, 'should have no children');
    assert.strictEqual(seq.firstChild, null, 'firstChild should be null');
    assert.strictEqual(seq.lastChild, null, 'lastChild should be null');
  });
});

describe('[UNIT] FragmentNodeSequence.adoptSiblings', function () {
  const ctx = TestContext.create();

  it('adopts provided node array', function () {
    const node1 = ctx.doc.createElement('span');
    const node2 = ctx.doc.createElement('p');
    node1.textContent = 'span';
    node2.textContent = 'paragraph';

    const seq = FragmentNodeSequence.adoptSiblings(ctx.platform, [node1, node2]);

    assert.strictEqual(seq.childNodes.length, 2, 'should have 2 children');
    assert.strictEqual(seq.firstChild, node1, 'firstChild should be span');
    assert.strictEqual(seq.lastChild, node2, 'lastChild should be p');
  });

  it('handles empty node array', function () {
    const seq = FragmentNodeSequence.adoptSiblings(ctx.platform, []);

    assert.strictEqual(seq.childNodes.length, 0, 'should have no children');
    assert.strictEqual(seq.firstChild, null, 'firstChild should be null');
    assert.strictEqual(seq.lastChild, null, 'lastChild should be null');
  });

  it('collects targets from adopted siblings', function () {
    const parent = ctx.doc.createElement('div');
    parent.innerHTML = '<!--au--><span></span><!--au--><p></p>';
    const nodes = Array.from(parent.childNodes);

    const seq = FragmentNodeSequence.adoptSiblings(ctx.platform, nodes);
    const targets = seq.findTargets();

    assert.strictEqual(targets.length, 2, 'should find 2 targets');
    assert.strictEqual((targets[0] as Element).tagName, 'SPAN');
    assert.strictEqual((targets[1] as Element).tagName, 'P');
  });

  it('handles single node', function () {
    const node = ctx.doc.createElement('div');
    node.textContent = 'single';

    const seq = FragmentNodeSequence.adoptSiblings(ctx.platform, [node]);

    assert.strictEqual(seq.childNodes.length, 1, 'should have 1 child');
    assert.strictEqual(seq.firstChild, node, 'firstChild should be the node');
    assert.strictEqual(seq.lastChild, node, 'lastChild should be the same node');
  });
});

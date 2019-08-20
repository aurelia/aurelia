import { stripMetaData } from '@aurelia/plugin-conventions';
import { assert } from '@aurelia/testing';

describe('stripMetaData', function () {
  it('returns empty html', function() {
    assert.deepEqual(stripMetaData(' '), {
      html: ' ',
      shadowMode: null,
      deps: []
    });
  });

  it('strips import tag', function() {
    const html = `<import from="./a"></import>
<template>
  <p></p>
</template>
`;
    const expected = `
<template>
  <p></p>
</template>
`;

    assert.deepEqual(stripMetaData(html), {
      html: expected,
      shadowMode: null,
      deps: ['./a']
    });
  });

  it('strips import tags with wrong or missing close tag', function() {
    const html = `<import from="./a" />
<import from="b"></import>
<template>
  <import from="./c.css">
  <p></p>
</template>
`;
    const expected = `

<template>
${'  ' /* leading space is untouched */}
  <p></p>
</template>
`;

    assert.deepEqual(stripMetaData(html), {
      html: expected,
      shadowMode: null,
      deps: ['./a', 'b', './c.css']
    });
  });

  it('strips require tag', function() {
    const html = `<require from="./a"></require>
<template>
  <p></p>
</template>
`;
    const expected = `
<template>
  <p></p>
</template>
`;

    assert.deepEqual(stripMetaData(html), {
      html: expected,
      shadowMode: null,
      deps: ['./a']
    });
  });

  it('strips mixed import/require tags with wrong or missing close tag', function() {
    const html = `<import from="./a" /><import from="foo">
<require from="b"></require>
<template>
  <require from="./c.css">
  <p></p>
</template>
`;
    const expected = `

<template>
${'  ' /* leading space is untouched */}
  <p></p>
</template>
`;

    assert.deepEqual(stripMetaData(html), {
      html: expected,
      shadowMode: null,
      deps: ['./a', 'foo', 'b', './c.css']
    });
  });

  it('strips use-shadow-dom tag', function() {
    const html = `<use-shadow-dom></use-shadow-dom>
<template>
</template>
`;
    const expected = `
<template>
</template>
`;
    assert.deepEqual(stripMetaData(html), {
      html: expected,
      shadowMode: 'open',
      deps: []
    });
  });

  it('strips use-shadow-dom tag with mode attribute', function() {
    const html = `<use-shadow-dom mode="closed">
<template>
<require from="./a"></require>
</template>
`;
    const expected = `
<template>

</template>
`;
    assert.deepEqual(stripMetaData(html), {
      html: expected,
      shadowMode: 'closed',
      deps: ['./a']
    });
  });

  it('strips use-shadow-dom attribute', function() {
    const html = `<template use-shadow-dom>
</template>
`;
    const expected = `<template >
</template>
`;
    assert.deepEqual(stripMetaData(html), {
      html: expected,
      shadowMode: 'open',
      deps: []
    });
  });

  it('strips use-shadow-dom attribute with explicit mode', function() {
    const html = `<template use-shadow-dom="closed">
<require from="./a"></require>
</template>
`;
    const expected = `<template >

</template>
`;
    assert.deepEqual(stripMetaData(html), {
      html: expected,
      shadowMode: 'closed',
      deps: ['./a']
    });
  });
});

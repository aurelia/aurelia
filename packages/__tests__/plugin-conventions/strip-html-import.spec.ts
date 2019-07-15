import { stripHtmlImport } from '@aurelia/plugin-conventions';
import { assert } from '@aurelia/testing';

describe('stripHtmlImport', function () {
  it('returns empty html', function() {
    assert.deepEqual(stripHtmlImport(' '), {
      html: ' ',
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

    assert.deepEqual(stripHtmlImport(html), {
      html: expected,
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

    assert.deepEqual(stripHtmlImport(html), {
      html: expected,
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

    assert.deepEqual(stripHtmlImport(html), {
      html: expected,
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

    assert.deepEqual(stripHtmlImport(html), {
      html: expected,
      deps: ['./a', 'foo', 'b', './c.css']
    });
  });
});

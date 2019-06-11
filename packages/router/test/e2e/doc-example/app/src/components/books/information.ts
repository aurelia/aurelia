import { customElement } from '@aurelia/runtime';

@customElement({ name: 'information', template: `<template>
<h3>Information for book only</h3>
<div>This <pre>information</pre> component is local to the books folder and only imported by <pre>book</pre>.</div>
</template>` })
export class Information {}

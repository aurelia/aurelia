import { customElement } from '@aurelia/runtime';

@customElement({ name: 'information', template: `<template>
<h3>Information for author only</h3>
<div>This <pre>information</pre> component is local to the authors folder and only imported by <pre>author</pre>.</div>
</template>` })
export class Information {}

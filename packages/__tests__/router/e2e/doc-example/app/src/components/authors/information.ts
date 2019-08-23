import { customElement } from '@aurelia/runtime';

@customElement({ name: 'information', template: `<template>
<div>
<h3>Information for author only</h3>
<div>This <pre>information</pre> component is local to the authors folder and only imported by <pre>author</pre>.</div>
<div class="scrollbox">Space is big. Really big. You just won't believe how vastly, hugely, mind-bogglingly big it is.</div>
</div>
</template>` })
export class Information {}

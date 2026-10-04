---
"@aurelia/i18n": patch
---

Plain-text `t` translations now update the text node the binding wrote last time, instead of rebuilding the element's content through a `<template>` on every bind and locale change. The DOM output is the same. Code that watches mutations will now see `characterData` changes in place of `childList` replacements.

issue: #2525

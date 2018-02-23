const basichtml = require('basichtml');

export const Document: Document & { new(): Document } = basichtml.Document;
export const Element: Element = basichtml.Element;

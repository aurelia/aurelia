require('basichtml').init();

export const DOM = new class {
  parseHtml(html: string): Element {
    const div = document.createElement('div');
    div.innerHTML = html.trim();
    return div;
  }

  createTemplateFromMarkup(markup: string): Element {
    let parser = document.createElement('div');
    parser.innerHTML = markup;

    let temp = parser.firstElementChild;

    if (!temp || temp.nodeName !== 'TEMPLATE') {
      throw new Error('Template markup must be wrapped in a <template> element e.g. <template> <!-- markup here --> </template>');
    }

    return temp;
  }
}

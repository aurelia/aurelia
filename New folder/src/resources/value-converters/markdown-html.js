import marked from 'marked';

export class MarkdownHtmlValueConverter {
  toView(value) {
    return marked(value);
  }
}


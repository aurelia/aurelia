import marked from 'marked';

export class MarkdownHtmlValueConverter {
  toView(value: string) {
    return marked(value);
  }
}


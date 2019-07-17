import marked from 'marked';
import { valueConverter } from '@aurelia/runtime';
@valueConverter({ name: 'markdownHtml' })
export class MarkdownHtmlValueConverter {
  toView(value: string) {
    return marked(value);
  }
}


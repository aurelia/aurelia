import { valueConverter } from '@aurelia/runtime';
import * as marked from 'marked';
@valueConverter({ name: 'markdownHtml' })
export class MarkdownHtmlValueConverter {
  public toView(value: string) {
    return marked(value);
  }
}

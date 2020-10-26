import { valueConverter } from '@aurelia/runtime-html';

import * as marked from 'marked';

@valueConverter({ name: 'markdownHtml' })
export class MarkdownHtmlValueConverter {
  public toView(value: string) {
    return marked(value);
  }
}

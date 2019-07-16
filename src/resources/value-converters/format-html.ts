export class FormatHtmlValueConverter {
  toView(value: string) {
    return value.replace(/(?:\r\n|\r|\n)/g, '<br />');
  }
}


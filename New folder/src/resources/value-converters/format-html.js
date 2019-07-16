export class FormatHtmlValueConverter {
  toView(value) {
    return value.replace(/(?:\r\n|\r|\n)/g, '<br />');
  }
}


export class FormatHtmlValueConverter {
  public toView(value: string) {
    return value.replace(/(?:\r\n|\r|\n)/g, '<br />');
  }
}

export class FormatHtmlValueConverter {
  public toView(value: string): string {
    return value.replace(/(?:\r\n|\r|\n)/g, "<br />");
  }
}

export class App {
  public message = 'Hello World!';
  public iframeSrc: string;
  public iframeVisible: boolean;

  public static routes = [
    { path: 'route-home', component: 'home'},
  ];

  toggleIframe() {
    if (!this.iframeVisible) {
      this.iframeSrc = URL.createObjectURL(new Blob(
        [`<html><head></head><body><a target="_top" href="${origin}/#auth">Goto auth</a></body>`],
        { type: 'text/html' }
      ));
    }
    this.iframeVisible = !this.iframeVisible;
  }
}

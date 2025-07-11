import { IRouter } from '@aurelia/router-direct';
import { resolve } from 'aurelia';

export class App {

  public static routes = [
    { path: ['', 'home'], component: import('./pages/home') },
    { path: 'pages/one-route', component: import('./pages/one') },
    { path: 'pages/two-route', component: import('./pages/two') },
    { path: 'pages/params-route', component: import('./pages/params') },
  ];

  public message = 'Hello, World!';
  public iframeSrc: string;
  public iframeVisible: boolean;

  public readonly router: IRouter = (window as Window & { _auRouter?: IRouter })._auRouter = resolve(IRouter);

  public async toggleFragmentHash() {
    const useUrlFragmentHash = !this.router.configuration.options.useUrlFragmentHash;
    this.router.configuration.options.useUrlFragmentHash = useUrlFragmentHash;
    this.router.viewer.options.useUrlFragmentHash = useUrlFragmentHash;
  }

  toggleIframe() {
    if (!this.iframeVisible) {
      const fragmentHash = this.router.configuration.options.useUrlFragmentHash ? '#/' : '';
      this.iframeSrc = URL.createObjectURL(new Blob(
        [`<html><head></head><body><a target="_top" href="${origin}/${fragmentHash}auth">Goto auth</a></body>`],
        { type: 'text/html' }
      ));
    } else {
      this.iframeSrc = '';
    }
    this.iframeVisible = !this.iframeVisible;
  }
}

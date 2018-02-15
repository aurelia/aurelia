import { App } from './app';

let app = new App();
app.hydrate(document.body);
app.bind();

window['app'] = app;

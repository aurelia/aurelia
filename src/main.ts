import { App } from './app';

let app = new App();
app.hydrate(document.body);
app.bind();
app.attach();

window['app'] = app;

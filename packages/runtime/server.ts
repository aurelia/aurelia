// import * as http from 'http';
// import { JSDOM } from 'jsdom';
// import { Aurelia } from './runtime';
// import { DebugConfiguration } from '@aurelia/debug';
// import { BasicConfiguration } from './jit';

// export function runTab(tab: JSDOM, doc: any) {
//   return http
//     .createServer((req, res) => {
//       console.log('Request:', new Date().getTime());
//       const host = doc.body.appendChild(doc.createElement('div'));
//       try {
//         new Aurelia()
//           .register(
//             DebugConfiguration,
//             BasicConfiguration,
//           )
//           .app({
//             host,
//             component: new App(req.url || 'We meet again World')
//           })
//           .start();

//         res.writeHead(200, { 'Content-Type': 'text/html' });
//         res.end(tab.serialize());
//       } catch (o_O) {
//         res.writeHead(401);
//         res.end(o_O);
//       } finally {
//         host.remove();
//       }
//     })
//     .listen(8001, (...args) => {
//       console.log('----------------\nApp running at 8001.');
//       console.log(args);
//     });
// }
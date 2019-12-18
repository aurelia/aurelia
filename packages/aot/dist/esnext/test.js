/* eslint-disable import/no-nodejs-modules */
import { DebugConfiguration, } from '@aurelia/debug';
import { resolve, } from 'path';
import { DI, LoggerConfiguration, Registration, } from '@aurelia/kernel';
import { IFileSystem, } from './system/interfaces';
import { NodeFileSystem, } from './system/file-system';
import { ServiceHost, } from './service-host';
(async function () {
    DebugConfiguration.register();
    // Just for testing
    const root = resolve(__dirname, '..', '..', '..', '..', 'test', 'realworld');
    const container = DI.createContainer();
    container.register(LoggerConfiguration.create(console, 1 /* debug */, 1 /* colors */), Registration.singleton(IFileSystem, NodeFileSystem));
    const host = new ServiceHost(container);
    await host.executeEntryFile(root);
})().catch(err => {
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=test.js.map
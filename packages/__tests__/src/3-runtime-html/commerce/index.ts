import { ConsoleSink, IPlatform, LoggerConfiguration, LogLevel } from '@aurelia/kernel';
import { Aurelia, ShortHandBindingSyntax, StandardConfiguration } from '@aurelia/runtime-html';
import { createContainer } from '@aurelia/testing';
import { AppShell } from './app';
import { BrowserPlatform } from '@aurelia/platform-browser';

export const createCommerceFixture = () => {
  const container = createContainer().register(
    StandardConfiguration,
    ShortHandBindingSyntax,
  );

  const au = new Aurelia(container);

  au.register(
    LoggerConfiguration.create({
      level: LogLevel.debug,
      sinks: [ConsoleSink],
    }),
  );

  const platform = container.get(IPlatform) as BrowserPlatform;
  const doc = platform.document;

  const host = doc.createElement('div');
  doc.body.appendChild(host);

  const component = container.get(AppShell);

  au.app({
    component,
    host,
  });

  const start = async () => {
    await au.start();
  };

  const stop = async () => {
    await au.stop();
    host.remove();
  };

  return {
    container,
    au,
    host,
    appShell: component,
    start,
    stop,
  };
};

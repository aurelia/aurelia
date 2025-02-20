import { ConsoleSink, LoggerConfiguration, LogLevel } from '@aurelia/kernel';
import { Aurelia, ShortHandBindingSyntax } from '@aurelia/runtime-html';
import { TestContext } from '@aurelia/testing';
import { AppShell } from './app/app-shell.js';

export const createCommerceFixture = () => {
  const ctx = TestContext.create();
  const { container, doc } = ctx;
  container.register(
    ShortHandBindingSyntax,
    LoggerConfiguration.create({
      level: LogLevel.debug,
      sinks: [ConsoleSink],
    }),
  );

  const au = new Aurelia(container);

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

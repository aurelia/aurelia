import tsPackageJson from 'typescript/package.json';

export class App {
  public message = 'Hello TS smoke';
  public tsVersion = tsPackageJson.version;
}


declare module '*.html' {
  interface ITemplateSource {
    name: string;
    templateOrNode: string;
    dependencies: any[]
  }

  var _: ITemplateSource;
  export default  _;
}

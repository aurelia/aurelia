
declare module '*.html' {
  interface ITemplateSource {
    name: string;
    template: string;
    dependencies: any[]
  }

  var _: ITemplateSource;
  export default  _;
}

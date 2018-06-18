
declare module '*.html!au' {
  interface ITemplateSource {
    name: string;
    template: string;
    dependencies: any[]
  }

  var _: ITemplateSource;
  export default  _;
}

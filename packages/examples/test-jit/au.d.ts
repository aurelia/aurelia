
declare module '*.html' {
  interface ITemplateDefinition {
    name: string;
    template: string;
    dependencies: any[]
  }

  var _: ITemplateDefinition;
  export default  _;
}

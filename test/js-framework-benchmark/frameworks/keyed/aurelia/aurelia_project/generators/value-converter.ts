import {inject} from 'aurelia-dependency-injection';
import {Project, ProjectItem, CLIOptions, UI} from 'aurelia-cli';

@inject(Project, CLIOptions, UI)
export default class ValueConverterGenerator {
  public constructor(private readonly project: Project, private readonly options: CLIOptions, private readonly ui: UI) { }

  public async execute() {
    const name = await this.ui.ensureAnswer(
      this.options.args[0],
      'What would you like to call the value converter?'
    );

    const fileName = this.project.makeFileName(name);
    const className = this.project.makeClassName(name);

    this.project.valueConverters.add(
      ProjectItem.text(`${fileName}.ts`, this.generateSource(className))
    );

    await this.project.commitChanges();
    await this.ui.log(`Created ${fileName}.`);
  }

  public generateSource(className) {
    return `export class ${className}ValueConverter {
  toView(value) {
    //
  }

  fromView(value) {
    //
  }
}
`;
  }
}

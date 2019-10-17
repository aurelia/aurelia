import {inject} from 'aurelia-dependency-injection';
import {Project, ProjectItem, CLIOptions, UI} from 'aurelia-cli';

@inject(Project, CLIOptions, UI)
export default class TaskGenerator {
  public constructor(private readonly project: Project, private readonly options: CLIOptions, private readonly ui: UI) { }

  public async execute() {
    const name = await this.ui.ensureAnswer(
      this.options.args[0],
      'What would you like to call the task?'
    );

    const fileName = this.project.makeFileName(name);
    const functionName = this.project.makeFunctionName(name);

    this.project.tasks.add(
      ProjectItem.text(`${fileName}.ts`, this.generateSource(functionName))
    );

    await this.project.commitChanges();
    await this.ui.log(`Created ${fileName}.`);
  }

  public generateSource(functionName) {
    return `import * as gulp from 'gulp';
import * as project from '../aurelia.json';

export default function ${functionName}() {
  return gulp.src(project.paths.???)
    .pipe(gulp.dest(project.paths.output));
}
`;

  }
}

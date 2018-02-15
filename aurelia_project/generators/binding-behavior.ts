import {inject} from 'aurelia-dependency-injection';
import {Project, ProjectItem, CLIOptions, UI} from 'aurelia-cli';

@inject(Project, CLIOptions, UI)
export default class BindingBehaviorGenerator {
  constructor(private project: Project, private options: CLIOptions, private ui: UI) { }

  execute() {
    return this.ui
      .ensureAnswer(this.options.args[0], 'What would you like to call the binding behavior?')
      .then(name => {
        let fileName = this.project.makeFileName(name);
        let className = this.project.makeClassName(name);

        this.project.bindingBehaviors.add(
          ProjectItem.text(`${fileName}.ts`, this.generateSource(className))
        );

        return this.project.commitChanges()
          .then(() => this.ui.log(`Created ${fileName}.`));
      });
  }

  generateSource(className) {
return `export class ${className}BindingBehavior {
  bind(binding, source) {

  }

  unbind(binding, source) {

  }
}

`
  }
}

export interface AureliaSettings {
  host: HTMLElement,
  component: any
}

export class Aurelia {
  constructor(public settings: AureliaSettings) { 
    this.settings.component.applyTo(this.settings.host);
  }

  start() {
    this.settings.component.bind();
    this.settings.component.attach();
    return this;
  }

  stop() {
    this.settings.component.detach();
    this.settings.component.unbind();
    return this;
  }
}

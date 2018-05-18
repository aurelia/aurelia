import { IContainer, DI, inject } from "../di";
import { ITemplate } from "./view-engine";

export interface ITemplateCache {
  getTemplate(key: any, onMiss: (container: IContainer) => ITemplate): ITemplate;
}

export const ITemplateCache = DI.createInterface<ITemplateCache>()
  .withDefault(x => x.singleton(TemplateCache));

@inject(IContainer)
class TemplateCache implements ITemplateCache {
  private lookup = new Map<any, ITemplate>();

  constructor(private container: IContainer) {}

  getTemplate(key: any, onMiss: (container: IContainer) => ITemplate): ITemplate {
    let found = this.lookup.get(key);

    if (!found) {
      found = onMiss(this.container);
      this.lookup.set(key, found);
    }

    return found;
  }
}

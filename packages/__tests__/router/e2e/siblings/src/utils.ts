import { Registration } from '@aurelia/kernel';
import { CustomElement } from '@aurelia/runtime';

export function registerComponent(container, ...components) {
  for (const component of components) {
    const name = component.description ? component.description.name : component.name;
    container.register(component);
    Registration.alias(CustomElement.keyFrom(name), component).register(container);
  }
}

export const wait = async (time = 0) => {
  await new Promise((resolve) => {
    setTimeout(resolve, time);
  });
};

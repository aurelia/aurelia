import { valueConverter } from "@aurelia/runtime";

@valueConverter({ name: 'keys' })
export class KeysValueConverter {

  public toView(value: object) {
    if (value) {
      return Reflect.ownKeys(value);
    }
    return null;
  }
}

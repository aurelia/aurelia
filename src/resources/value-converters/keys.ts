import { valueConverter } from "@aurelia/runtime";

@valueConverter({ name: 'keys' })
export class KeysValueConverter {

  toView(value) {
    if (value)
      return Reflect.ownKeys(value);
  }

}

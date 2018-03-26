export class ClassObserver {
  doNotCache = true;
  value = '';
  version = 0;
  nameIndex: any;

  constructor(private element: Element) { }

  getValue() {
    return this.value;
  }

  setValue(newValue: any) {
    let nameIndex = this.nameIndex || {};
    let version = this.version;
    let names;
    let name;

    // Add the classes, tracking the version at which they were added.
    if (newValue !== null && newValue !== undefined && newValue.length) {
      names = newValue.split(/\s+/);
      for (let i = 0, length = names.length; i < length; i++) {
        name = names[i];
        if (name === '') {
          continue;
        }
        nameIndex[name] = version;
        this.element.classList.add(name);
      }
    }

    // Update state variables.
    this.value = newValue;
    this.nameIndex = nameIndex;
    this.version += 1;

    // First call to setValue?  We're done.
    if (version === 0) {
      return;
    }

    // Remove classes from previous version.
    version -= 1;
    for (name in nameIndex) {
      if (!nameIndex.hasOwnProperty(name) || nameIndex[name] !== version) {
        continue;
      }
      this.element.classList.remove(name);
    }
  }

  subscribe() {
    throw new Error(`Observation of a "${this.element.nodeName}" element\'s "class" property is not supported.`);
  }
}

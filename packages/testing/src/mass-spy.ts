import { SinonStub, spy } from 'sinon';
// tslint:disable-next-line:no-duplicate-imports
import * as sinon from 'sinon';

export function massSpy(obj: any, ...properties: string[]): void {
  if (properties.length === 0) {
    for (const prop in obj) {
      if (typeof obj[prop] === 'function') {
        if (obj[prop].restore) {
          obj[prop].restore();
        }
        spy(obj, prop);
      }
    }
  } else {
    for (let i = 0, ii = properties.length; i < ii; ++i) {
      const prop = properties[i];
      if (obj[prop].restore) {
        obj[prop].restore();
      }
      spy(obj, prop);
    }
  }
}

export function ensureNotCalled(obj: any, ...properties: string[]): void {
  massStub(obj, (stub, prop) => stub.throws(`${obj.constructor.name}.${prop} should not be called`), ...properties);
}

export function massStub(obj: any, configure: (stub: SinonStub, prop: string) => void, ...properties: string[]): void {
  if (properties.length === 0) {
    for (const prop in obj) {
      if (typeof obj[prop] === 'function') {
        if (obj[prop].restore) {
          obj[prop].restore();
        }
        configure(sinon.stub(obj, prop), prop);
      }
    }
  } else {
    for (let i = 0, ii = properties.length; i < ii; ++i) {
      const prop = properties[i];
      if (obj[prop].restore) {
        obj[prop].restore();
      }
      configure(sinon.stub(obj, prop), prop);
    }
  }
}

export function massRestore(obj: any, ...properties: string[]): void {
  if (properties.length === 0) {
    for (const prop in obj) {
      if (typeof obj[prop] === 'function' && obj[prop].restore) {
        obj[prop].restore();
      }
    }
  } else {
    for (let i = 0, ii = properties.length; i < ii; ++i) {
      const prop = properties[i];
      if (obj[prop].restore) {
        obj[prop].restore();
      }
    }
  }
}

export function massReset(obj: any, ...properties: string[]): void {
  if (properties.length === 0) {
    for (const prop in obj) {
      if (typeof obj[prop] === 'function' && obj[prop].resetHistory) {
        obj[prop].resetHistory();
      }
    }
  } else {
    for (let i = 0, ii = properties.length; i < ii; ++i) {
      const prop = properties[i];
      if (obj[prop].resetHistory) {
        obj[prop].resetHistory();
      }
    }
  }
}


const returnTrue = () => true;
const filterCache = new Map<string, Map<object, PropertyDescriptorMap>>();

export function getAllPropertyDescriptors(proto: object, filter: (pd: PropertyDescriptor) => boolean = returnTrue): PropertyDescriptorMap {
  let pdCache = new Map<object, PropertyDescriptorMap>();

  if (filter === returnTrue) {
    let pdMap = pdCache.get(proto);
    if (pdMap === undefined) {
      pdMap = $getAllPropertyDescriptors(proto, filter);
      pdCache.set(proto, pdMap);
    }
    return pdMap;
  } else {
    const filterStr = filter.toString();
    let pdMap;
    pdCache = filterCache.get(filterStr)!;
    if (pdCache === undefined) {
      pdCache = new Map();
      filterCache.set(filterStr, pdCache);
      pdMap = $getAllPropertyDescriptors(proto, filter);
      pdCache.set(proto, pdMap);
    } else {
      pdMap = pdCache.get(proto);
      if (pdMap === undefined) {
        pdMap = $getAllPropertyDescriptors(proto, filter);
        pdCache.set(proto, pdMap);
      }
    }
    return pdMap;
  }
}

function $getAllPropertyDescriptors(proto: object, filter: (pd: PropertyDescriptor) => boolean = returnTrue): PropertyDescriptorMap {
  const allDescriptors: PropertyDescriptorMap = {};
  while (proto !== Object.prototype) {
    const descriptors = Object.getOwnPropertyDescriptors(proto);
    for (const prop in descriptors) {
      if (allDescriptors.hasOwnProperty(prop)) {
        continue;
      }
      const descriptor = descriptors[prop];
      if (filter(descriptor)) {
        allDescriptors[prop] = descriptor;
      }
    }
    proto = Object.getPrototypeOf(proto);
  }
  return allDescriptors;
}

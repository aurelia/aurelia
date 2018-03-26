import { Component, CompiledElementSource } from "./component";

export function compiledElement(source: CompiledElementSource) {
  return function<T extends {new(...args:any[]):{}}>(target: T) {
    return Component.fromCompiledSource(target, source);
  }
}

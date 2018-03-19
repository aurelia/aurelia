import { IContext, IRegistration } from "./interfaces";
import { RegistrationFunctionBuilder, Registration } from "./registration";
import { DependencyType } from "./types";


export class DefaultContext implements IContext {
  public readonly builder: RegistrationFunctionBuilder;

  constructor(builder: RegistrationFunctionBuilder) {
    this.builder = builder;
  }

  public static root(builder: RegistrationFunctionBuilder): DefaultContext {
    return new DefaultContext(builder);
  }

  public register<T>(type: DependencyType): IRegistration<T> {
    return new Registration<T>(this, type);
  }
}

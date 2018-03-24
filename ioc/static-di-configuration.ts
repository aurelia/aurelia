import * as AST from "./analysis/ast";
import { IPair } from "./interfaces";

export class StaticDIConfiguration {
  public registrations: Map<AST.IModule, StaticDependencyRegistration[]> = new Map();

}

export class StaticDependencyRegistration {
  public importStatements: string[] = [];
  public activatorClassDeclaration: string;
  public activatorRegistrationExpression: string;
}

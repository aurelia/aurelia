import { Class, IResourceDefinition, IResourceKind, IResourceType } from '@aurelia/kernel';
import { BindingType, ITargetedInstruction } from '@aurelia/runtime';
import { BindingSymbol, PlainAttributeSymbol } from './semantic-model';
export interface IBindingCommand {
    bindingType: BindingType;
    compile(binding: PlainAttributeSymbol | BindingSymbol): ITargetedInstruction;
}
export interface IBindingCommandDefinition extends IResourceDefinition {
}
export interface IBindingCommandType extends IResourceType<IBindingCommandDefinition, IBindingCommand, Class<IBindingCommand>> {
}
export interface IBindingCommandResource extends IResourceKind<IBindingCommandDefinition, IBindingCommand, Class<IBindingCommand>> {
}
declare type BindingCommandDecorator = <TProto, TClass>(target: Class<TProto, TClass> & Partial<IBindingCommandType>) => Class<TProto, TClass> & IBindingCommandType;
export declare function bindingCommand(name: string): BindingCommandDecorator;
export declare function bindingCommand(definition: IBindingCommandDefinition): BindingCommandDecorator;
export declare const BindingCommandResource: Readonly<IBindingCommandResource>;
export declare function getTarget(binding: PlainAttributeSymbol | BindingSymbol, makeCamelCase: boolean): string;
export {};
//# sourceMappingURL=binding-command.d.ts.map
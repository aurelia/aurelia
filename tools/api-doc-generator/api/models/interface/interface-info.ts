import { TypeInfo } from '../type/type-info';
import { IComment } from '../comment/comment';
import { InterfaceMethodInfo } from './interface-method-info';
import { InterfaceIndexerInfo } from './interface-indexer-info';
import { InterfacePropertyInfo } from './interface-property-info';
import { ITypeParameter } from '../type-parameter/type-parameter';
import { InterfaceConstructorInfo } from './interface-constructor-info';
import { InterfaceCallSignatureInfo } from './interface-call-signature-info';

import { IModifier, IFilePath, ITypeCategory } from '../../../helpers';

export interface InterfaceInfo extends IModifier, IComment, ITypeParameter, IFilePath, ITypeCategory {
    name: string;
    text: string;
    constructors: InterfaceConstructorInfo[] | undefined;
    properties: InterfacePropertyInfo[] | undefined;
    methods: InterfaceMethodInfo[] | undefined;
    callSignatures: InterfaceCallSignatureInfo[] | undefined;
    indexers: InterfaceIndexerInfo[] | undefined;
    extends: TypeInfo[] | undefined;
}

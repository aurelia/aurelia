import {
    InterfaceDeclaration,
    PropertySignature,
    CallSignatureDeclaration,
    ParameterDeclaration,
    ConstructSignatureDeclaration,
    IndexSignatureDeclaration,
    MethodSignature,
} from 'ts-morph';

import { InterfaceMethodInfo } from '../../models/interface/interface-method-info';
import { InterfaceIndexerInfo } from '../../models/interface/interface-indexer-info';
import { InterfaceParameterInfo } from '../../models/interface/interface-parameter-info';
import { InterfaceConstructorInfo } from '../../models/interface/interface-constructor-info';
import { InterfaceCallSignatureInfo } from '../../models/interface/interface-call-signature-info';

import { InterfaceInfo } from '../../models/interface/interface-info';
import { TypeExtractor, ITypeExtractor } from '../type/type-extractor';
import { InterfacePropertyInfo } from '../../models/interface/interface-property-info';
import { TypescriptCommentExtractor, ITypescriptCommentExtractor } from '../comment/ts-comment-extractor';
import { TypeParameterExtractor, ITypeParameterExtractor } from '../type-parameter/type-parameter-extractor';

import { TypeCategory } from '../../../helpers';

export interface IInterfaceExtractor {
    extract(node: InterfaceDeclaration): InterfaceInfo;
    extractAll(nodes: InterfaceDeclaration[]): InterfaceInfo[] | undefined;
}

export class InterfaceExtractor implements IInterfaceExtractor {
    constructor(
        private typeExtractor: ITypeExtractor = new TypeExtractor(),
        private typeParameterExtractor: ITypeParameterExtractor = new TypeParameterExtractor(),
        private tsCommentExtractor: ITypescriptCommentExtractor = new TypescriptCommentExtractor(),
    ) {}
    public extract(node: InterfaceDeclaration): InterfaceInfo {
        const comment = this.tsCommentExtractor.extract(node);
        return {
            path: node.getSourceFile().getFilePath(),
            name: node.getName(),
            text: node.getText(),
            typeParameters: this.typeParameterExtractor.extract(node),
            modifiers: node.getModifiers().length === 0 ? void 0 : node.getModifiers().map(item => item.getText()),
            comment: comment,
            typeCategory: TypeCategory.Interface,
            properties:
                node.getProperties().length === 0
                    ? void 0
                    : node.getProperties().map(item => this.getProperty(item)),
            callSignatures:
                node.getCallSignatures().length === 0
                    ? void 0
                    : node.getCallSignatures().map(item => this.getCallSignature(item)),
            constructors:
                node.getConstructSignatures().length === 0
                    ? void 0
                    : node.getConstructSignatures().map(item => this.getConstructor(item)),
            extends:
                node.getExtends().length === 0
                    ? void 0
                    : node.getExtends().map(item => this.typeExtractor.extract(node, item.getType())),
            indexers:
                node.getIndexSignatures().length === 0
                    ? void 0
                    : node.getIndexSignatures().map(item => this.getIndexer(item)),
            methods: node.getMethods().length === 0 ? void 0 : node.getMethods().map(item => this.getMethod(item)),
        };
    }

    public extractAll(nodes: InterfaceDeclaration[]): InterfaceInfo[] | undefined {
        const interfaces = nodes.map(item => this.extract(item));
        if (interfaces.length === 0) return void 0;
        return interfaces;
    }

    private getProperty(node: PropertySignature): InterfacePropertyInfo {
        const comment = this.tsCommentExtractor.extract(node);
        return {
            comment: comment,
            isOptional: node.hasQuestionToken(),
            name: node.getName(),
            text: node.getText(),
            type: this.typeExtractor.extract(node, node.getType()),
        };
    }

    private getCallSignature(node: CallSignatureDeclaration): InterfaceCallSignatureInfo {
        const comment = this.tsCommentExtractor.extract(node);
        return {
            comment: comment,
            text: node.getText(),
            returnType: this.typeExtractor.extract(node, node.getReturnType()),
            typeParameters: this.typeParameterExtractor.extract(node),
            parameters:
                node.getParameters().length === 0
                    ? void 0
                    : node.getParameters().map(item => this.getParameter(item)),
        };
    }

    private getMethod(node: MethodSignature): InterfaceMethodInfo {
        const comment = this.tsCommentExtractor.extract(node);
        return {
            comment: comment,
            name: node.getName(),
            text: node.getText(),
            returnType: this.typeExtractor.extract(node, node.getReturnType()),
            typeParameters: this.typeParameterExtractor.extract(node),
            parameters:
                node.getParameters().length === 0
                    ? void 0
                    : node.getParameters().map(item => this.getParameter(item)),
        };
    }

    private getConstructor(node: ConstructSignatureDeclaration): InterfaceConstructorInfo {
        const comment = this.tsCommentExtractor.extract(node);
        return {
            comment: comment,
            text: node.getText(),
            returnType: this.typeExtractor.extract(node, node.getReturnType()),
            typeParameters: this.typeParameterExtractor.extract(node),
            parameters:
                node.getParameters().length === 0
                    ? void 0
                    : node.getParameters().map(item => this.getParameter(item)),
        };
    }

    private getIndexer(node: IndexSignatureDeclaration): InterfaceIndexerInfo {
        const comment = this.tsCommentExtractor.extract(node);
        return {
            comment: comment,
            text: node.getText(),
            returnType: this.typeExtractor.extract(node, node.getReturnType()),
            keyName: node.getKeyName(),
            keyType: this.typeExtractor.extract(node, node.getKeyType()),
        };
    }

    private getParameter(node: ParameterDeclaration): InterfaceParameterInfo {
        return {
            name: node.getName(),
            text: node.getText(),
            type: this.typeExtractor.extract(node, node.getType()),
            isOptional: node.isOptional(),
            isRest: node.isRestParameter(),
            isParameterProperty: node.isParameterProperty(),
            modifiers: node.getModifiers().length === 0 ? void 0 : node.getModifiers().map(item => item.getText()),
            initializer: node.getInitializer() === void 0 ? void 0 : node.getInitializerOrThrow().getText(),
        };
    }
}

import { DI } from '@aurelia/kernel';
export const IInstruction = DI.createInterface('IInstruction').noDefault();
export class HooksDefinition {
    constructor(target) {
        this.hasDefine = 'define' in target;
        this.hasBeforeCompose = 'beforeCompose' in target;
        this.hasBeforeComposeChildren = 'beforeComposeChildren' in target;
        this.hasAfterCompose = 'afterCompose' in target;
        this.hasBeforeBind = 'beforeBind' in target;
        this.hasAfterBind = 'afterBind' in target;
        this.hasAfterAttach = 'afterAttach' in target;
        this.hasAfterAttachChildren = 'afterAttachChildren' in target;
        this.hasBeforeDetach = 'beforeDetach' in target;
        this.hasBeforeUnbind = 'beforeUnbind' in target;
        this.hasAfterUnbind = 'afterUnbind' in target;
        this.hasAfterUnbindChildren = 'afterUnbindChildren' in target;
        this.hasDispose = 'dispose' in target;
        this.hasAccept = 'accept' in target;
    }
}
HooksDefinition.none = new HooksDefinition({});
//# sourceMappingURL=definitions.js.map
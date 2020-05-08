var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Registration } from '@aurelia/kernel';
import { IDOM, ITargetAccessorLocator, ITargetObserverLocator, SetterObserver } from '@aurelia/runtime';
import { AttributeNSAccessor } from './attribute-ns-accessor';
import { CheckedObserver } from './checked-observer';
import { ClassAttributeAccessor } from './class-attribute-accessor';
import { DataAttributeAccessor } from './data-attribute-accessor';
import { ElementPropertyAccessor } from './element-property-accessor';
import { EventSubscriber } from './event-manager';
import { SelectValueObserver } from './select-value-observer';
import { StyleAttributeAccessor } from './style-attribute-accessor';
import { ISVGAnalyzer } from './svg-analyzer';
import { ValueAttributeObserver } from './value-attribute-observer';
// https://infra.spec.whatwg.org/#namespaces
const htmlNS = 'http://www.w3.org/1999/xhtml';
const mathmlNS = 'http://www.w3.org/1998/Math/MathML';
const svgNS = 'http://www.w3.org/2000/svg';
const xlinkNS = 'http://www.w3.org/1999/xlink';
const xmlNS = 'http://www.w3.org/XML/1998/namespace';
const xmlnsNS = 'http://www.w3.org/2000/xmlns/';
// https://html.spec.whatwg.org/multipage/syntax.html#attributes-2
const nsAttributes = Object.assign(Object.create(null), {
    'xlink:actuate': ['actuate', xlinkNS],
    'xlink:arcrole': ['arcrole', xlinkNS],
    'xlink:href': ['href', xlinkNS],
    'xlink:role': ['role', xlinkNS],
    'xlink:show': ['show', xlinkNS],
    'xlink:title': ['title', xlinkNS],
    'xlink:type': ['type', xlinkNS],
    'xml:lang': ['lang', xmlNS],
    'xml:space': ['space', xmlNS],
    'xmlns': ['xmlns', xmlnsNS],
    'xmlns:xlink': ['xlink', xmlnsNS],
});
const inputEvents = ['change', 'input'];
const selectEvents = ['change'];
const contentEvents = ['change', 'input', 'blur', 'keyup', 'paste'];
const scrollEvents = ['scroll'];
const overrideProps = Object.assign(Object.create(null), {
    'class': true,
    'style': true,
    'css': true,
    'checked': true,
    'value': true,
    'model': true,
    'xlink:actuate': true,
    'xlink:arcrole': true,
    'xlink:href': true,
    'xlink:role': true,
    'xlink:show': true,
    'xlink:title': true,
    'xlink:type': true,
    'xml:lang': true,
    'xml:space': true,
    'xmlns': true,
    'xmlns:xlink': true,
});
let TargetObserverLocator = class TargetObserverLocator {
    constructor(dom, svgAnalyzer) {
        this.dom = dom;
        this.svgAnalyzer = svgAnalyzer;
    }
    static register(container) {
        return Registration.singleton(ITargetObserverLocator, this).register(container);
    }
    getObserver(flags, scheduler, lifecycle, observerLocator, obj, propertyName) {
        switch (propertyName) {
            case 'checked':
                return new CheckedObserver(scheduler, flags, lifecycle, new EventSubscriber(this.dom, inputEvents), obj);
            case 'value':
                if (obj.tagName === 'SELECT') {
                    return new SelectValueObserver(scheduler, flags, observerLocator, this.dom, new EventSubscriber(this.dom, selectEvents), obj);
                }
                return new ValueAttributeObserver(scheduler, flags, new EventSubscriber(this.dom, inputEvents), obj, propertyName);
            case 'files':
                return new ValueAttributeObserver(scheduler, flags, new EventSubscriber(this.dom, inputEvents), obj, propertyName);
            case 'textContent':
            case 'innerHTML':
                return new ValueAttributeObserver(scheduler, flags, new EventSubscriber(this.dom, contentEvents), obj, propertyName);
            case 'scrollTop':
            case 'scrollLeft':
                return new ValueAttributeObserver(scheduler, flags, new EventSubscriber(this.dom, scrollEvents), obj, propertyName);
            case 'class':
                return new ClassAttributeAccessor(scheduler, flags, obj);
            case 'style':
            case 'css':
                return new StyleAttributeAccessor(scheduler, flags, obj);
            case 'model':
                return new SetterObserver(lifecycle, flags, obj, propertyName);
            case 'role':
                return new DataAttributeAccessor(scheduler, flags, obj, propertyName);
            default:
                if (nsAttributes[propertyName] !== undefined) {
                    const nsProps = nsAttributes[propertyName];
                    return new AttributeNSAccessor(scheduler, flags, obj, nsProps[0], nsProps[1]);
                }
                if (isDataAttribute(obj, propertyName, this.svgAnalyzer)) {
                    return new DataAttributeAccessor(scheduler, flags, obj, propertyName);
                }
        }
        return null;
    }
    overridesAccessor(flags, obj, propertyName) {
        return overrideProps[propertyName] === true;
    }
    // consider a scenario where user would want to provide a Date object observation via patching a few mutation method on it
    // then this extension point of this default implementaion cannot be used,
    // and a new implementation of ITargetObserverLocator should be used instead
    // This default implementation only accounts for the most common target scenarios
    handles(flags, obj) {
        return this.dom.isNodeInstance(obj);
    }
};
TargetObserverLocator = __decorate([
    __param(0, IDOM),
    __param(1, ISVGAnalyzer),
    __metadata("design:paramtypes", [Object, Object])
], TargetObserverLocator);
export { TargetObserverLocator };
let TargetAccessorLocator = class TargetAccessorLocator {
    constructor(dom, svgAnalyzer) {
        this.dom = dom;
        this.svgAnalyzer = svgAnalyzer;
    }
    static register(container) {
        return Registration.singleton(ITargetAccessorLocator, this).register(container);
    }
    getAccessor(flags, scheduler, lifecycle, obj, propertyName) {
        switch (propertyName) {
            case 'textContent':
                // note: this case is just an optimization (textContent is the most often used property)
                return new ElementPropertyAccessor(scheduler, flags, obj, propertyName);
            case 'class':
                return new ClassAttributeAccessor(scheduler, flags, obj);
            case 'style':
            case 'css':
                return new StyleAttributeAccessor(scheduler, flags, obj);
            // TODO: there are (many) more situation where we want to default to DataAttributeAccessor,
            // but for now stick to what vCurrent does
            case 'src':
            case 'href':
            // https://html.spec.whatwg.org/multipage/dom.html#wai-aria
            case 'role':
                return new DataAttributeAccessor(scheduler, flags, obj, propertyName);
            default:
                if (nsAttributes[propertyName] !== undefined) {
                    const nsProps = nsAttributes[propertyName];
                    return new AttributeNSAccessor(scheduler, flags, obj, nsProps[0], nsProps[1]);
                }
                if (isDataAttribute(obj, propertyName, this.svgAnalyzer)) {
                    return new DataAttributeAccessor(scheduler, flags, obj, propertyName);
                }
                return new ElementPropertyAccessor(scheduler, flags, obj, propertyName);
        }
    }
    handles(flags, obj) {
        return this.dom.isNodeInstance(obj);
    }
};
TargetAccessorLocator = __decorate([
    __param(0, IDOM),
    __param(1, ISVGAnalyzer),
    __metadata("design:paramtypes", [Object, Object])
], TargetAccessorLocator);
export { TargetAccessorLocator };
const IsDataAttribute = {};
function isDataAttribute(obj, propertyName, svgAnalyzer) {
    if (IsDataAttribute[propertyName] === true) {
        return true;
    }
    const prefix = propertyName.slice(0, 5);
    // https://html.spec.whatwg.org/multipage/dom.html#wai-aria
    // https://html.spec.whatwg.org/multipage/dom.html#custom-data-attribute
    return IsDataAttribute[propertyName] =
        prefix === 'aria-' ||
            prefix === 'data-' ||
            svgAnalyzer.isStandardSvgAttribute(obj, propertyName);
}
//# sourceMappingURL=observer-locator.js.map
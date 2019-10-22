(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "@aurelia/runtime", "../router"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tslib_1 = require("tslib");
    const runtime_1 = require("@aurelia/runtime");
    const router_1 = require("../router");
    let ViewportCustomElement = class ViewportCustomElement {
        constructor(router, element) {
            this.router = router;
            this.element = element;
            this.name = 'default';
            this.usedBy = '';
            this.default = '';
            this.noScope = false;
            this.noLink = false;
            this.noHistory = false;
            this.stateful = false;
            this.viewport = null;
        }
        // public created(...rest): void {
        //   console.log('Created', rest);
        //   const booleanAttributes = {
        //     'scope': 'scope',
        //     'no-link': 'noLink',
        //     'no-history': 'noHistory',
        //   };
        //   const valueAttributes = {
        //     'used-by': 'usedBy',
        //     'default': 'default',
        //   };
        //   const name = this.element.hasAttribute('name') ? this.element.getAttribute('name') : 'default';
        //   const options: IViewportOptions = {};
        //   for (const attribute in booleanAttributes) {
        //     if (this.element.hasAttribute[attribute]) {
        //       options[booleanAttributes[attribute]] = true;
        //     }
        //   }
        //   for (const attribute in valueAttributes) {
        //     if (this.element.hasAttribute(attribute)) {
        //       const value = this.element.getAttribute(attribute);
        //       if (value && value.length) {
        //         options[valueAttributes[attribute]] = value;
        //       }
        //     }
        //   }
        //   this.viewport = this.router.addViewport(name, this.element, (this as any).$context.get(IContainer), options);
        // }
        bound() {
            this.connect();
        }
        unbound() {
            this.disconnect();
        }
        attached() {
            if (this.viewport) {
                this.viewport.clearTaggedNodes();
            }
        }
        connect() {
            const options = { scope: !this.element.hasAttribute('no-scope') };
            if (this.usedBy && this.usedBy.length) {
                options.usedBy = this.usedBy;
            }
            if (this.default && this.default.length) {
                options.default = this.default;
            }
            if (this.element.hasAttribute('no-link')) {
                options.noLink = true;
            }
            if (this.element.hasAttribute('no-history')) {
                options.noHistory = true;
            }
            if (this.element.hasAttribute('stateful')) {
                options.stateful = true;
            }
            this.viewport = this.router.connectViewport(this.name, this.element, this.$controller.context, options);
        }
        disconnect() {
            if (this.viewport) {
                this.router.disconnectViewport(this.viewport, this.element, this.$controller.context);
            }
        }
        binding(flags) {
            if (this.viewport) {
                this.viewport.binding(flags);
            }
        }
        attaching(flags) {
            if (this.viewport) {
                return this.viewport.attaching(flags);
            }
            return Promise.resolve();
        }
        detaching(flags) {
            if (this.viewport) {
                return this.viewport.detaching(flags);
            }
            return Promise.resolve();
        }
        async unbinding(flags) {
            if (this.viewport) {
                await this.viewport.unbinding(flags);
            }
        }
    };
    tslib_1.__decorate([
        runtime_1.bindable
    ], ViewportCustomElement.prototype, "name", void 0);
    tslib_1.__decorate([
        runtime_1.bindable
    ], ViewportCustomElement.prototype, "usedBy", void 0);
    tslib_1.__decorate([
        runtime_1.bindable
    ], ViewportCustomElement.prototype, "default", void 0);
    tslib_1.__decorate([
        runtime_1.bindable
    ], ViewportCustomElement.prototype, "noScope", void 0);
    tslib_1.__decorate([
        runtime_1.bindable
    ], ViewportCustomElement.prototype, "noLink", void 0);
    tslib_1.__decorate([
        runtime_1.bindable
    ], ViewportCustomElement.prototype, "noHistory", void 0);
    tslib_1.__decorate([
        runtime_1.bindable
    ], ViewportCustomElement.prototype, "stateful", void 0);
    ViewportCustomElement = tslib_1.__decorate([
        runtime_1.customElement({
            name: 'au-viewport',
            template: `
    <template>
      <div class="viewport-header" style="display: none;">
        Viewport: <b>\${name}</b> \${scope ? "[new scope]" : ""} : <b>\${viewport.content && viewport.content.toComponentName()}</b>
      </div>
    </template>
  `.replace(/\s+/g, '')
        }),
        tslib_1.__param(0, router_1.IRouter),
        tslib_1.__param(1, runtime_1.INode)
    ], ViewportCustomElement);
    exports.ViewportCustomElement = ViewportCustomElement;
});
//# sourceMappingURL=viewport.js.map
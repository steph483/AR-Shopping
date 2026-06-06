"use strict";
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExampleScript = void 0;
var __selfType = requireType("./Examples");
function component(target) {
    target.getTypeName = function () { return __selfType; };
    if (target.prototype.hasOwnProperty("getTypeName"))
        return;
    Object.defineProperty(target.prototype, "getTypeName", {
        value: function () { return __selfType; },
        configurable: true,
        writable: true
    });
}
/**

import { Logger } from "Utilities.lspkg/Scripts/Utils/Logger";
 * Specs Inc. 2026
 * Example script demonstrating all SnapDecorators functionality with lifecycle event decorators.
 * Shows @bindStartEvent, @bindEnableEvent, @bindDisableEvent, @bindUpdateEvent, @bindLateUpdateEvent,
 * and @bindDestroyEvent with frame counting, FPS tracking, and clean declarative event handling.
 */
const decorators_1 = require("./decorators");
let ExampleScript = (() => {
    let _classDecorators = [component];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseScriptComponent;
    let _instanceExtraInitializers = [];
    let _onStart_decorators;
    let _onEnabled_decorators;
    let _onDisabled_decorators;
    let _onUpdate_decorators;
    let _onLateUpdate_decorators;
    let _onDestroy_decorators;
    var ExampleScript = _classThis = class extends _classSuper {
        constructor() {
            super();
            this.frameCount = (__runInitializers(this, _instanceExtraInitializers), 0);
            this.startTime = 0;
        }
        __initialize() {
            super.__initialize();
            this.frameCount = (__runInitializers(this, _instanceExtraInitializers), 0);
            this.startTime = 0;
        }
        /**
         * Runs when the lens starts
         */
        onStart() {
            this.startTime = getTime();
            print("[START] @bindStartEvent triggered - Lens started at: " + this.startTime);
        }
        /**
         * Runs when the script component is enabled
         */
        onEnabled() {
            print("[ENABLE] @bindEnableEvent triggered - Script enabled");
        }
        /**
         * Runs when the script component is disabled
         */
        onDisabled() {
            print("[DISABLE] @bindDisableEvent triggered - Script disabled");
        }
        /**
         * Runs every frame
         */
        onUpdate() {
            this.frameCount++;
            // Log every 60 frames (~1 second at 60fps)
            if (this.frameCount % 60 === 0) {
                const elapsed = getTime() - this.startTime;
                const fps = this.frameCount / elapsed;
                print(`[UPDATE] @bindUpdateEvent - Frame: ${this.frameCount}, Elapsed: ${elapsed.toFixed(2)}s, FPS: ${fps.toFixed(1)}`);
            }
        }
        /**
         * Runs every frame after UpdateEvent
         */
        onLateUpdate() {
            // Log every 120 frames (~2 seconds at 60fps)
            if (this.frameCount % 120 === 0) {
                const elapsed = getTime() - this.startTime;
                print(`[LATE UPDATE] @bindLateUpdateEvent - Frame: ${this.frameCount}, Elapsed: ${elapsed.toFixed(2)}s`);
            }
        }
        /**
         * Runs when the script is destroyed
         */
        onDestroy() {
            const elapsed = getTime() - this.startTime;
            print("[DESTROY] @bindDestroyEvent triggered - Script destroyed");
            print("   Total frames rendered: " + this.frameCount);
            print("   Total time: " + elapsed.toFixed(2) + "s");
            print("   Average FPS: " + (this.frameCount / elapsed).toFixed(1));
        }
        /**
         * Traditional onAwake - setup tap event
         */
        onAwake() {
            print("[AWAKE] Traditional onAwake() - Setting up tap event");
            this.createEvent("TapEvent").bind(() => {
                const elapsed = getTime() - this.startTime;
                print("[TAP] Tapped! Elapsed time: " + elapsed.toFixed(2) + "s, Frame: " + this.frameCount);
            });
        }
    };
    __setFunctionName(_classThis, "ExampleScript");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        _onStart_decorators = [decorators_1.bindStartEvent];
        _onEnabled_decorators = [decorators_1.bindEnableEvent];
        _onDisabled_decorators = [decorators_1.bindDisableEvent];
        _onUpdate_decorators = [decorators_1.bindUpdateEvent];
        _onLateUpdate_decorators = [decorators_1.bindLateUpdateEvent];
        _onDestroy_decorators = [decorators_1.bindDestroyEvent];
        __esDecorate(_classThis, null, _onStart_decorators, { kind: "method", name: "onStart", static: false, private: false, access: { has: obj => "onStart" in obj, get: obj => obj.onStart }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _onEnabled_decorators, { kind: "method", name: "onEnabled", static: false, private: false, access: { has: obj => "onEnabled" in obj, get: obj => obj.onEnabled }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _onDisabled_decorators, { kind: "method", name: "onDisabled", static: false, private: false, access: { has: obj => "onDisabled" in obj, get: obj => obj.onDisabled }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _onUpdate_decorators, { kind: "method", name: "onUpdate", static: false, private: false, access: { has: obj => "onUpdate" in obj, get: obj => obj.onUpdate }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _onLateUpdate_decorators, { kind: "method", name: "onLateUpdate", static: false, private: false, access: { has: obj => "onLateUpdate" in obj, get: obj => obj.onLateUpdate }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _onDestroy_decorators, { kind: "method", name: "onDestroy", static: false, private: false, access: { has: obj => "onDestroy" in obj, get: obj => obj.onDestroy }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ExampleScript = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ExampleScript = _classThis;
})();
exports.ExampleScript = ExampleScript;
//# sourceMappingURL=Examples.js.map
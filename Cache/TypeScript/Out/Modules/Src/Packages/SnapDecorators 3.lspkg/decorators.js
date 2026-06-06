"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bindStartEvent = bindStartEvent;
exports.bindEnableEvent = bindEnableEvent;
exports.bindDisableEvent = bindDisableEvent;
exports.bindUpdateEvent = bindUpdateEvent;
exports.bindLateUpdateEvent = bindLateUpdateEvent;
exports.bindDestroyEvent = bindDestroyEvent;
exports.memo = memo;
exports.depends = depends;
exports.provider = provider;
/**
 * Specs Inc. 2026
 * TypeScript decorators for declarative event binding and dependency injection in Lens Studio.
 * Provides @bindStartEvent, @bindUpdateEvent, @bindDestroyEvent and others for clean event
 * handling, @memo for lazy-evaluated getters, @depends for component dependencies, and
 * @provider for parent component lookup with automatic error reporting.
 */
const assert_1 = require("./assert");
const debug_1 = require("./debug");
/**
 * Decorator to bind a class method as the event handler for a scene event type for a component.
 * The event registration is injected so it runs right before onAwake. The target method can be async.
 */
function bindEvent(eventType) {
    return function bindEventDecorator(target, context) {
        const methodName = context.name;
        context.addInitializer(function () {
            const targetMethod = this[methodName];
            const innerAwake = this["onAwake"];
            this["onAwake"] = function bindEventAwake() {
                this.createEvent(eventType).bind((...args) => {
                    const result = targetMethod.call(this, ...args);
                    if (result instanceof Promise) {
                        return result.catch(debug_1.reportError);
                    }
                    return result;
                });
                innerAwake?.call(this);
            };
        });
    };
}
function bindStartEvent(target, context) {
    return bindEvent("OnStartEvent")(target, context);
}
function bindEnableEvent(target, context) {
    return bindEvent("OnEnableEvent")(target, context);
}
function bindDisableEvent(target, context) {
    return bindEvent("OnDisableEvent")(target, context);
}
function bindUpdateEvent(target, context) {
    return bindEvent("UpdateEvent")(target, context);
}
function bindLateUpdateEvent(target, context) {
    return bindEvent("LateUpdateEvent")(target, context);
}
function bindDestroyEvent(target, context) {
    return bindEvent("OnDestroyEvent")(target, context);
}
/**
 * Decorator for script component getters.
 */
function memo(target, context) {
    const propertyKey = context.name;
    context.addInitializer(function () {
        const descriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(this), propertyKey);
        (0, assert_1.assert)(descriptor && typeof descriptor.get === "function", "@memo can only be applied to getters");
        (0, assert_1.assert)(typeof descriptor.set === "undefined", "@memo cannot be applied to a getter with a setter");
        const innerGetter = descriptor.get;
        Object.defineProperty(this, propertyKey, {
            get: function memoGetter() {
                const value = innerGetter.call(this);
                Object.defineProperty(this, propertyKey, { value });
                return value;
            },
            configurable: true,
            enumerable: true
        });
    });
}
/**
 * Decorator to define a script component field as an injected dependency, auto-initialized with a reference to a
 * component found on a parent node.
 */
function depends(componentType) {
    return function dependsDecorator(target, context) {
        const propertyKey = context.name;
        context.addInitializer(function () {
            const component = this.sceneObject.getComponent(componentType);
            (0, assert_1.assert)(component !== null, `@depends ${(0, debug_1.spath)(this)}.${propertyKey.toString()} not found`);
            this[propertyKey] = component;
        });
    };
}
/**
 * Decorator to define a script component field as an injected dependency, auto-initialized with a reference to a
 * component above it on the same scene object.
 */
function provider(componentType) {
    return function providerDecorator(target, context) {
        const propertyKey = context.name;
        context.addInitializer(function () {
            const component = getComponentInParent(this.sceneObject, componentType);
            (0, assert_1.assert)(component !== null, `@provider ${(0, debug_1.spath)(this)}.${propertyKey.toString()} not found`);
            this[propertyKey] = component;
        });
    };
}
function getComponentInParent(sceneObject, componentType) {
    for (let node = sceneObject; node !== null; node = node.getParent()) {
        const component = node.getComponent(componentType);
        if (component !== null) {
            return component;
        }
    }
    return null;
}
//# sourceMappingURL=decorators.js.map
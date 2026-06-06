"use strict";
/**
 * Specs Inc. 2026
 * Type guard utilities for runtime type checking of Lens Studio objects. Provides isScriptObject()
 * for validating ScriptObject types and isComponent() for Component type validation with TypeScript
 * type narrowing support.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isScriptObject = isScriptObject;
exports.isComponent = isComponent;
function isScriptObject(obj) {
    if (!obj || typeof obj !== "object")
        return false;
    const isOfType = obj["isOfType"];
    if (typeof isOfType !== "function")
        return false;
    const result = isOfType.call(obj, "ScriptObject");
    if (typeof result !== "boolean")
        return false;
    return result;
}
function isComponent(obj) {
    return isScriptObject(obj) && obj.isOfType("Component");
}
//# sourceMappingURL=guards.js.map
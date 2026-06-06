"use strict";
/**
 * Specs Inc. 2026
 * Assertion utilities for runtime validation and type guarding. Provides assert() for
 * condition validation with TypeScript type assertions, and verify() for non-null value
 * verification with automatic type narrowing to NonNullable.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.assert = assert;
exports.verify = verify;
/** Asserts that the given condition is true, otherwise throws an error with the given message. */
function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}
/** Verifies that the given value is not `undefined` or `null`, otherwise throws an error with the given message. */
function verify(value, message) {
    if (value == null) {
        throw new Error(message);
    }
    return value;
}
//# sourceMappingURL=assert.js.map
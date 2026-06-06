"use strict";
/**
 * Specs Inc. 2026
 * Scene object and component utilities for hierarchy traversal, component finding,
 * and scene graph operations. Provides convenient methods for working with scene objects
 * and their components across the hierarchy.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SceneObjectUtils = void 0;
/**
 * Utility class for scene object operations and component management
 */
class SceneObjectUtils {
    /**
     * Traverse scene object hierarchy and execute callback on each
     * @param sceneObject - Root scene object to start traversal
     * @param fn - Callback function to execute on each scene object
     * @param includeSelf - Whether to include root in traversal (default: true)
     */
    static forEachSceneObjectInSubHierarchy(sceneObject, fn, includeSelf = true) {
        if (includeSelf === undefined || includeSelf) {
            fn(sceneObject);
        }
        for (let i = 0; i < sceneObject.getChildrenCount(); i++) {
            const childSceneObject = sceneObject.getChild(i);
            fn(childSceneObject);
            SceneObjectUtils.forEachSceneObjectInSubHierarchy(childSceneObject, fn, false);
        }
    }
    /**
     * Find script component by property name
     * @param sceneObject - Scene object to search
     * @param propertyName - Property name to look for
     * @returns Found script component or null
     */
    static findScriptComponent(sceneObject, propertyName) {
        const components = sceneObject.getComponents("ScriptComponent");
        for (let idx = 0; idx < components.length; idx++) {
            if (components[idx][propertyName]) {
                return components[idx];
            }
        }
        return null;
    }
    /**
     * Get the root scene object from any object in hierarchy
     * @param sceneObject - Any scene object in the hierarchy
     * @returns Root scene object
     */
    static getSceneRoot(sceneObject) {
        let parent = sceneObject.getParent();
        let currentSceneObject = sceneObject;
        while (parent !== null) {
            currentSceneObject = parent;
            parent = parent.getParent();
        }
        return currentSceneObject;
    }
    /**
     * Recursively find a component in scene object hierarchy
     * @param root - Root scene object to start search
     * @param typeName - Component type name to find
     * @returns Found component or null
     */
    static findComponentInHierarchy(root, typeName) {
        // Search all components on root
        const components = root.getComponents("Component.ScriptComponent");
        for (let i = 0; i < components.length; i++) {
            const comp = components[i];
            if (comp.getTypeName && comp.getTypeName() === typeName) {
                return comp;
            }
        }
        // Recursively search children
        const childCount = root.getChildrenCount();
        for (let i = 0; i < childCount; i++) {
            const child = root.getChild(i);
            const foundComponent = SceneObjectUtils.findComponentInHierarchy(child, typeName);
            if (foundComponent) {
                return foundComponent;
            }
        }
        return null;
    }
    /**
     * Get component or create if it doesn't exist
     * @param sceneObject - Scene object to get/create component on
     * @param componentTypeName - Component type name
     * @returns Component instance
     */
    static getOrCreateComponent(sceneObject, componentTypeName) {
        let component = sceneObject.getComponent(componentTypeName);
        if (!component || component === null || component === undefined) {
            component = sceneObject.createComponent(componentTypeName);
        }
        return component;
    }
    /**
     * Find scene object by name with common naming variations
     * Handles various naming conventions like underscores, colons, prefixes, etc.
     * @param root - Root scene object to search from
     * @param targetName - Base name to search for
     * @param customVariations - Optional custom name variations to check
     * @returns Found scene object or null
     */
    static findSceneObjectByNameVariations(root, targetName, customVariations) {
        const objNameLower = root.name.toLowerCase();
        const nameLower = targetName.toLowerCase();
        // Direct match
        if (objNameLower === nameLower) {
            return root;
        }
        // Generate common variations
        const variations = [
            targetName,
            targetName.replace(/_/g, ""),
            targetName.replace(/_/g, " "),
            `mixamorig:${targetName}`,
            `${targetName}_jnt`,
            `${targetName}_bone`,
            `human_low:_${targetName}`,
            `human_high:_${targetName}`,
            `human:_${targetName}`,
            `_${targetName}`,
            `:_${targetName}`,
            `:${targetName}`,
        ];
        // Add custom variations if provided
        if (customVariations) {
            variations.push(...customVariations);
        }
        // Check all variations
        for (const variant of variations) {
            const variantLower = variant.toLowerCase();
            if (objNameLower === variantLower) {
                return root;
            }
            if (objNameLower.endsWith(variantLower)) {
                return root;
            }
        }
        // Search children recursively
        const childCount = root.getChildrenCount();
        for (let i = 0; i < childCount; i++) {
            const child = root.getChild(i);
            const result = SceneObjectUtils.findSceneObjectByNameVariations(child, targetName, customVariations);
            if (result) {
                return result;
            }
        }
        return null;
    }
}
exports.SceneObjectUtils = SceneObjectUtils;
//# sourceMappingURL=SceneObjectUtils.js.map
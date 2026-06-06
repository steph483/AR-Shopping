"use strict";
/**
 * Specs Inc. 2026
 * Component search and initialization utilities for finding components in parent hierarchies,
 * safely initializing components, and locating root scene objects with specific components.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComponentUtils = void 0;
/**
 * Utility class for component operations
 */
class ComponentUtils {
    /**
     * Find component in parent hierarchy (search upwards)
     * @param sceneObject - Starting scene object
     * @param componentTypeName - Component type to find
     * @returns Found component or null
     */
    static findInParents(sceneObject, componentTypeName) {
        let current = sceneObject;
        while (current !== null) {
            const component = current.getComponent(componentTypeName);
            if (component) {
                return component;
            }
            current = current.getParent();
        }
        return null;
    }
    /**
     * Safely initialize a component (handles already initialized)
     * Attempts to call initialize() method if it exists
     * @param component - Component to initialize
     * @returns True if initialized successfully, false if already initialized or failed
     */
    static safeInitialize(component) {
        if (typeof component.initialize === "function") {
            try {
                component.initialize();
                return true;
            }
            catch (e) {
                // Already initialized or initialization failed
                return false;
            }
        }
        return false;
    }
    /**
     * Find root scene object with specific component
     * Searches through all root objects in the scene
     * @param componentTypeName - Component type to find
     * @returns Scene object with component or null
     */
    static findRootWithComponent(componentTypeName) {
        const objectCount = global.scene.getRootObjectsCount();
        for (let i = 0; i < objectCount; i++) {
            const rootObject = global.scene.getRootObject(i);
            const component = rootObject.getComponent(componentTypeName);
            if (component) {
                return rootObject;
            }
        }
        return null;
    }
    /**
     * Find camera in scene root objects
     * Convenience method for locating the main camera
     * @returns Camera scene object or throws error if not found
     */
    static getRootCamera() {
        const cameraObject = ComponentUtils.findRootWithComponent("Component.Camera");
        if (!cameraObject) {
            throw new Error("Camera not found in scene. Please add a camera to your scene.");
        }
        return cameraObject;
    }
    /**
     * Get all components of a specific type from a scene object
     * @param sceneObject - Scene object to search
     * @param componentTypeName - Component type name
     * @returns Array of found components
     */
    static getAllComponents(sceneObject, componentTypeName) {
        const components = [];
        const allComponents = sceneObject.getComponents(componentTypeName);
        for (let i = 0; i < allComponents.length; i++) {
            components.push(allComponents[i]);
        }
        return components;
    }
}
exports.ComponentUtils = ComponentUtils;
//# sourceMappingURL=ComponentUtils.js.map
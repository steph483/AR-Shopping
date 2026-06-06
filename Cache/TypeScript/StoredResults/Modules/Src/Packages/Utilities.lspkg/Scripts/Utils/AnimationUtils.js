"use strict";
/**
 * Specs Inc. 2026
 * Animation utilities for tweening, easing, and visual feedback animations.
 * Provides cancelable animation helpers and common animation patterns used across packages.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnimationUtils = void 0;
/**
 * Utility class for animation operations
 */
class AnimationUtils {
    /**
     * Create a cancelable frame-based tween
     * Calls callback function every frame for a set duration with normalized time (0-1)
     * @param callback - Function called each frame with normalized time (0-1)
     * @param duration - Duration in seconds
     * @returns Cancel function to stop animation
     */
    static makeTween(callback, duration) {
        const startTime = getTime();
        let hasRemovedEvent = false;
        const updateEvent = script.createEvent("UpdateEvent");
        updateEvent.bind(() => {
            if (getTime() > startTime + duration) {
                hasRemovedEvent = true;
                script.removeEvent(updateEvent);
                callback(1);
            }
            else {
                callback((getTime() - startTime) / duration);
            }
        });
        // Create a Cancelation function to stop this animation at any time
        function cancel() {
            if (!hasRemovedEvent) {
                hasRemovedEvent = true;
                script.removeEvent(updateEvent);
            }
        }
        return cancel;
    }
    /**
     * Ping-pong oscillation between min and max using sine wave
     * @param min - Minimum value
     * @param max - Maximum value
     * @param t - Time value (0-1)
     * @returns Oscillated value
     */
    static pingPong(min, max, t) {
        const range = max - min;
        const scaledT = t * Math.PI;
        return min + Math.sin(scaledT) * range;
    }
    /**
     * Animate scale of a scene object with cancelation support
     * @param sceneObject - Object to animate
     * @param startScale - Starting scale vector
     * @param endScale - Ending scale vector
     * @param duration - Duration in seconds
     * @param easing - Easing function name (default: "ease-out-cubic")
     * @param onComplete - Callback when animation completes
     * @returns CancelSet to cancel animation
     */
    static animateScale(sceneObject, startScale, endScale, duration, easing = "ease-out-cubic", onComplete) {
        const cancelSet = new CancelSet();
        animate({
            easing: easing,
            duration: duration,
            update: (t) => {
                sceneObject.getTransform().setLocalScale(vec3.lerp(startScale, endScale, t));
            },
            ended: onComplete,
            cancelSet: cancelSet,
        });
        return cancelSet;
    }
    /**
     * Animate visual feedback (fade in/out pattern) using scale
     * @param sceneObject - Object to animate
     * @param fadeIn - True for fade in (scale 0->1), false for fade out (scale 1->0)
     * @param duration - Duration in seconds (default: 0.5)
     * @param onComplete - Callback when animation completes
     * @returns CancelSet to cancel animation
     */
    static animateVisualFeedback(sceneObject, fadeIn, duration = 0.5, onComplete) {
        const cancelSet = new CancelSet();
        const start = fadeIn ? vec3.zero() : vec3.one();
        const end = fadeIn ? vec3.one() : vec3.zero();
        const easingType = fadeIn ? "ease-out-cubic" : "ease-in-cubic";
        animate({
            easing: easingType,
            duration: duration,
            update: (t) => {
                sceneObject.getTransform().setLocalScale(vec3.lerp(start, end, t));
            },
            ended: onComplete,
            cancelSet: cancelSet,
        });
        return cancelSet;
    }
    /**
     * Get easing ID from name
     * @param name - Easing function name
     * @returns Numeric easing ID (default: 0 for None)
     */
    static getEasingId(name) {
        return AnimationUtils.EASING_MAP[name] ?? 0;
    }
    /**
     * Get easing name from ID
     * @param id - Numeric easing ID
     * @returns Easing function name
     */
    static getEasingName(id) {
        for (const [name, easingId] of Object.entries(AnimationUtils.EASING_MAP)) {
            if (easingId === id) {
                return name;
            }
        }
        return 'None';
    }
    /**
     * Get all available easing functions
     * @returns Array of {name, id} objects
     */
    static getAllEasings() {
        return Object.entries(AnimationUtils.EASING_MAP).map(([name, id]) => ({ name, id }));
    }
}
exports.AnimationUtils = AnimationUtils;
/**
 * Easing name to ID mapping for InteractableHelper compatibility
 * Maps easing function names to numeric IDs
 */
AnimationUtils.EASING_MAP = {
    'None': 0,
    'Linear In': 1,
    'Linear Out': 2,
    'Linear InOut': 3,
    'Quadratic In': 4,
    'Quadratic Out': 5,
    'Quadratic InOut': 6,
    'Cubic In': 7,
    'Cubic Out': 8,
    'Cubic InOut': 9,
    'Quartic In': 10,
    'Quartic Out': 11,
    'Quartic InOut': 12,
    'Quintic In': 13,
    'Quintic Out': 14,
    'Quintic InOut': 15,
    'Sine In': 16,
    'Sine Out': 17,
    'Sine InOut': 18,
    'Exponential In': 19,
    'Exponential Out': 20,
    'Exponential InOut': 21,
    'Circular In': 22,
    'Circular Out': 23,
    'Circular InOut': 24,
    'Back In': 25,
    'Back Out': 26,
    'Back InOut': 27,
    'Elastic In': 28,
    'Elastic Out': 29,
    'Elastic InOut': 30,
    'Bounce In': 31,
    'Bounce Out': 32,
    'Bounce InOut': 33,
};
//# sourceMappingURL=AnimationUtils.js.map
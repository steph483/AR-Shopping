if (script.onAwake) {
    script.onAwake();
    return;
}
function checkUndefined(property, showIfData) {
    for (var i = 0; i < showIfData.length; i++) {
        if (showIfData[i][0] && script[showIfData[i][0]] != showIfData[i][1]) {
            return;
        }
    }
    if (script[property] == undefined) {
        throw new Error("Input " + property + " was not provided for the object " + script.getSceneObject().name);
    }
}
// @ui {"widget":"separator"}
// @ui {"widget":"label", "label":"<span style=\"color: #60A5FA;\">Drag Configuration</span>"}
// @ui {"widget":"label", "label":"<span style=\"color: #94A3B8; font-size: 11px;\">Configure drag sensitivity for indirect (raycast) interactions</span>"}
// @input float indirectDragThreshold = 10 {"label":"Indirect Drag Threshold", "hint":"Controls the minimum distance (in cm) the hand must move during indirect interaction to be considered a drag. When the distance between the interaction origin position and current position exceeds this threshold, dragging behavior is detected and tracked. Lower values make dragging more sensitive and easier to trigger, while higher values require more deliberate movement before dragging begins."}
// @ui {"widget":"separator"}
// @ui {"widget":"label", "label":"<span style=\"color: #60A5FA;\">Debug</span>"}
// @ui {"widget":"label", "label":"<span style=\"color: #94A3B8; font-size: 11px;\">Visual debugging options for development</span>"}
// @input bool _drawDebug {"label":"Draw Debug", "hint":"When enabled, draws debug gizmos in the scene to visualize raycasts, colliders, and other interactor geometry. Useful for troubleshooting targeting issues during development."}
// @ui {"widget":"separator"}
// @ui {"widget":"label", "label":"<span style=\"color: #60A5FA;\">Mobile Interactor</span>"}
// @ui {"widget":"label", "label":"<span style=\"color: #94A3B8; font-size: 11px;\">Configure mobile controller input filtering and touch sensitivity</span>"}
// @input bool initializePositionAndRotationFilter = true {"label":"Initialize Position And Rotation Filter", "hint":"When enabled, applies filtering to the mobile controller's position and rotation data when the interactor is first initialized. This helps reduce jitter and provides smoother tracking."}
// @input float _touchpadScrollSpeed = 250 {"label":"Touchpad Scroll Speed", "hint":"Controls how much touchpad movement is amplified when translating touch input to 3D space. Higher values result in faster/larger movements from small touch gestures, while lower values provide more precise control requiring larger touch gestures to achieve the same movement."}
// @input float touchpadDragThreshold = 0.05 {"label":"Touchpad Drag Threshold", "hint":"Controls the minimum distance a finger must move on the touchpad to be considered a drag. Uses normalized screen coordinates (0-1), where 0.05 represents 5% of the screen width/height. Lower values make dragging more sensitive to small movements."}
if (!global.BaseScriptComponent) {
    function BaseScriptComponent() {}
    global.BaseScriptComponent = BaseScriptComponent;
    global.BaseScriptComponent.prototype = Object.getPrototypeOf(script);
    global.BaseScriptComponent.prototype.__initialize = function () {};
    global.BaseScriptComponent.getTypeName = function () {
        throw new Error("Cannot get type name from the class, not decorated with @component");
    };
}
var Module = require("../../../../../../Modules/Src/Packages/SpectaclesInteractionKit.lspkg/Core/MobileInteractor/MobileInteractor");
Object.setPrototypeOf(script, Module.MobileInteractor.prototype);
script.__initialize();
let awakeEvent = script.createEvent("OnAwakeEvent");
awakeEvent.bind(() => {
    checkUndefined("indirectDragThreshold", []);
    checkUndefined("_drawDebug", []);
    checkUndefined("initializePositionAndRotationFilter", []);
    checkUndefined("_touchpadScrollSpeed", []);
    checkUndefined("touchpadDragThreshold", []);
    if (script.onAwake) {
       script.onAwake();
    }
});

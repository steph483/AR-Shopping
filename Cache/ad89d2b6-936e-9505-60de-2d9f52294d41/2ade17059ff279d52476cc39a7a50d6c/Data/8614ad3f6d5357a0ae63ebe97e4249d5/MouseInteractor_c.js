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
// @ui {"widget":"label", "label":"<span style=\"color: #60A5FA;\">Mouse Interactor</span>"}
// @ui {"widget":"label", "label":"<span style=\"color: #94A3B8; font-size: 11px;\">Configuration for testing interactions in Lens Studio preview</span>"}
// @input float mouseTargetingMode = 2 {"label":"Mouse Targeting Mode", "hint":"Sets the return value of MouseInteractor.activeTargetingMode for testing purposes. Useful when your code has checks for specific targeting modes (e.g., interactor.activeTargetingMode === TargetingMode.Direct). Allows you to simulate different hand targeting modes with the mouse in the Lens Studio preview.", "widget":"combobox", "values":[{"label":"Direct", "value":1}, {"label":"Indirect", "value":2}, {"label":"All", "value":3}, {"label":"Poke", "value":4}]}
// @ui {"widget":"separator"}
// @ui {"widget":"label", "label":"<span style=\"color: #60A5FA;\">Depth Testing</span>"}
// @ui {"widget":"label", "label":"<span style=\"color: #94A3B8; font-size: 11px;\">Simulate depth movement for testing 3D interactions</span>"}
// @input bool moveInDepth {"label":"Move In Depth", "hint":"When enabled, the mouse interactor oscillates back and forth along its ray direction to simulate depth movement. This helps test 3D interactions in z-space that would normally require physical hand movement toward or away from objects."}
// @input float moveInDepthAmount = 5 {"label":"Move In Depth Amount", "hint":"Controls the maximum distance (in cm) that the mouse interactor will move back and forth along its ray direction when moveInDepth is enabled. Higher values create larger depth movements, simulating interaction across a wider z-range for testing 3D interactions.", "showIf":"moveInDepth", "showIfValue":true}
if (!global.BaseScriptComponent) {
    function BaseScriptComponent() {}
    global.BaseScriptComponent = BaseScriptComponent;
    global.BaseScriptComponent.prototype = Object.getPrototypeOf(script);
    global.BaseScriptComponent.prototype.__initialize = function () {};
    global.BaseScriptComponent.getTypeName = function () {
        throw new Error("Cannot get type name from the class, not decorated with @component");
    };
}
var Module = require("../../../../../../Modules/Src/Packages/SpectaclesInteractionKit.lspkg/Core/MouseInteractor/MouseInteractor");
Object.setPrototypeOf(script, Module.MouseInteractor.prototype);
script.__initialize();
let awakeEvent = script.createEvent("OnAwakeEvent");
awakeEvent.bind(() => {
    checkUndefined("indirectDragThreshold", []);
    checkUndefined("_drawDebug", []);
    checkUndefined("mouseTargetingMode", []);
    checkUndefined("moveInDepth", []);
    checkUndefined("moveInDepthAmount", [["moveInDepth",true]]);
    if (script.onAwake) {
       script.onAwake();
    }
});

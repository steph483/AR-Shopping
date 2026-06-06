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
// @ui {"widget":"label", "label":"<span style=\"color: #60A5FA;\">Hand Configuration</span>"}
// @ui {"widget":"label", "label":"<span style=\"color: #94A3B8; font-size: 11px;\">Specify which hand this interactor tracks</span>"}
// @input string handType = "right" {"label":"Hand Type", "hint":"Specifies which hand this interactor tracks (left or right).", "widget":"combobox", "values":[{"label":"Left", "value":"left"}, {"label":"Right", "value":"right"}]}
// @ui {"widget":"separator"}
// @ui {"widget":"label", "label":"<span style=\"color: #60A5FA;\">Direct Interaction</span>"}
// @ui {"widget":"label", "label":"<span style=\"color: #94A3B8; font-size: 11px;\">Configure collider radius and drag sensitivity for direct (pinch) interactions</span>"}
// @input float directColliderEnterRadius = 1 {"label":"Direct Collider Enter Radius", "hint":"The radius (in cm) around the midpoint of the index/thumb to target Interactables. When the hand enters this radius around an Interactable, it becomes targetable for direct pinch interactions."}
// @input float directColliderExitRadius = 1.5 {"label":"Direct Collider Exit Radius", "hint":"The radius (in cm) around the midpoint of the index/thumb to de-target Interactables. This should be larger than the enter radius to create bistable (hysteresis) behavior that prevents flickering when hovering near the boundary."}
// @input float directDragThreshold = 3 {"label":"Direct Drag Threshold", "hint":"Controls the minimum distance (in cm) the hand must move during direct interaction to be considered a drag. Lower values make dragging more sensitive and easier to trigger, while higher values require more deliberate movement before dragging begins."}
// @ui {"widget":"separator"}
// @ui {"widget":"label", "label":"<span style=\"color: #60A5FA;\">Advanced</span>"}
// @ui {"widget":"label", "label":"<span style=\"color: #94A3B8; font-size: 11px;\">Additional options for specialized hand interaction scenarios</span>"}
// @input bool forcePokeOnNonDominantPalmProximity {"label":"Force Poke On Non-Dominant Palm Proximity", "hint":"When enabled, forces the usage of Poke targeting when the dominant hand's index finger is near the nondominant hand's palm. Useful for hand-mounted UI interactions."}
if (!global.BaseScriptComponent) {
    function BaseScriptComponent() {}
    global.BaseScriptComponent = BaseScriptComponent;
    global.BaseScriptComponent.prototype = Object.getPrototypeOf(script);
    global.BaseScriptComponent.prototype.__initialize = function () {};
    global.BaseScriptComponent.getTypeName = function () {
        throw new Error("Cannot get type name from the class, not decorated with @component");
    };
}
var Module = require("../../../../../../Modules/Src/Packages/SpectaclesInteractionKit.lspkg/Core/HandInteractor/HandInteractor");
Object.setPrototypeOf(script, Module.HandInteractor.prototype);
script.__initialize();
let awakeEvent = script.createEvent("OnAwakeEvent");
awakeEvent.bind(() => {
    checkUndefined("indirectDragThreshold", []);
    checkUndefined("_drawDebug", []);
    checkUndefined("handType", []);
    checkUndefined("directColliderEnterRadius", []);
    checkUndefined("directColliderExitRadius", []);
    checkUndefined("directDragThreshold", []);
    checkUndefined("forcePokeOnNonDominantPalmProximity", []);
    if (script.onAwake) {
       script.onAwake();
    }
});

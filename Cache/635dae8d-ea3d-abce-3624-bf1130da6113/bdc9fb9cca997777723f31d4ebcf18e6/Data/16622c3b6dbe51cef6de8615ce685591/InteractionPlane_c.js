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
// @ui {"widget":"label", "label":"<span style=\"color: #60A5FA;\">Plane Configuration</span>"}
// @ui {"widget":"label", "label":"<span style=\"color: #94A3B8; font-size: 11px;\">Define the size and position of the interaction detection area</span>"}
// @input vec2 _planeSize = {10,10} {"label":"Plane Size", "hint":"Size (X, Y) of the interaction plane. Defines the rectangular area where hand interactions are detected."}
// @input vec3 _offset {"label":"Offset", "hint":"Local-space offset of the plane relative to the host SceneObject."}
// @ui {"widget":"separator"}
// @ui {"widget":"label", "label":"<span style=\"color: #60A5FA;\">Visual Feedback</span>"}
// @ui {"widget":"label", "label":"<span style=\"color: #94A3B8; font-size: 11px;\">Configure cursor and targeting visual preferences</span>"}
// @input float targetingVisual {"label":"Targeting Visual", "hint":"Preferred targeting visual style. Requires V2 Cursor on InteractorCursors.", "widget":"combobox", "values":[{"label":"None", "value":0}, {"label":"Cursor", "value":1}, {"label":"Ray", "value":2}]}
if (!global.BaseScriptComponent) {
    function BaseScriptComponent() {}
    global.BaseScriptComponent = BaseScriptComponent;
    global.BaseScriptComponent.prototype = Object.getPrototypeOf(script);
    global.BaseScriptComponent.prototype.__initialize = function () {};
    global.BaseScriptComponent.getTypeName = function () {
        throw new Error("Cannot get type name from the class, not decorated with @component");
    };
}
var Module = require("../../../../../../../Modules/Src/Packages/SpectaclesInteractionKit.lspkg/Components/Interaction/InteractionPlane/InteractionPlane");
Object.setPrototypeOf(script, Module.InteractionPlane.prototype);
script.__initialize();
let awakeEvent = script.createEvent("OnAwakeEvent");
awakeEvent.bind(() => {
    checkUndefined("_planeSize", []);
    checkUndefined("_offset", []);
    checkUndefined("targetingVisual", []);
    if (script.onAwake) {
       script.onAwake();
    }
});

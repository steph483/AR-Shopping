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
// @ui {"widget":"label", "label":"<span style=\"color: #60A5FA;\">Target Object</span>"}
// @ui {"widget":"label", "label":"<span style=\"color: #94A3B8; font-size: 11px;\">Specify which SceneObject to manipulate (if blank, treats this SceneObject as the root)</span>"}
// @input SceneObject manipulateRootSceneObject {"label":"Manipulate Root", "hint":"Root SceneObject of the set of SceneObjects to manipulate. If left blank, this script's SceneObject will be treated as the root. The root's transform will be modified by this script."}
// @ui {"widget":"separator"}
// @ui {"widget":"label", "label":"<span style=\"color: #60A5FA;\">Transform Capabilities</span>"}
// @ui {"widget":"label", "label":"<span style=\"color: #94A3B8; font-size: 11px;\">Enable or disable translation, rotation, and scaling</span>"}
// @input bool enableTranslation = true {"label":"Enable Translation", "hint":"Controls whether the object can be moved (translated) in space."}
// @input bool enableRotation = true {"label":"Enable Rotation", "hint":"Controls whether the object can be rotated in space."}
// @input bool enableScale = true {"label":"Enable Scale", "hint":"Controls whether the object can be scaled in size."}
// @ui {"widget":"separator"}
// @ui {"widget":"label", "label":"<span style=\"color: #60A5FA;\">Scale Limits</span>"}
// @ui {"widget":"label", "label":"<span style=\"color: #94A3B8; font-size: 11px;\">Set minimum and maximum scale factors relative to original size</span>"}
// @input float minimumScaleFactor = 0.25 {"label":"Minimum Scale Factor", "hint":"The smallest this object can scale down to, relative to its original scale. A value of 0.5 means it cannot scale smaller than 50% of its original size.", "widget":"slider", "min":0, "max":1, "step":0.05}
// @input float maximumScaleFactor = 20 {"label":"Maximum Scale Factor", "hint":"The largest this object can scale up to, relative to its original scale. A value of 2 means it cannot scale larger than twice its original size.", "widget":"slider", "min":1, "max":20, "step":0.5}
// @ui {"widget":"separator"}
// @ui {"widget":"label", "label":"<span style=\"color: #60A5FA;\">Depth Stretch</span>"}
// @ui {"widget":"label", "label":"<span style=\"color: #94A3B8; font-size: 11px;\">Distance-based Z-axis movement multiplier for easier positioning of distant objects</span>"}
// @input bool enableStretchZ = true {"label":"Enable Stretch Z", "hint":"Enhances depth manipulation by applying a distance-based multiplier to Z-axis movement. When enabled, objects that are farther away will move greater distances with the same hand movement, making it easier to position distant objects without requiring excessive physical reach."}
// @input float zStretchFactorMin = 1 {"label":"Z Stretch Factor Min", "hint":"The minimum multiplier applied to Z-axis movement when using stretch mode. This value is used when objects are close to the user. Higher values result in more responsive depth movement for nearby objects.", "showIf":"enableStretchZ", "showIfValue":true}
// @input float zStretchFactorMax = 12 {"label":"Z Stretch Factor Max", "hint":"The maximum multiplier applied to Z-axis movement when using stretch mode. This value is used when objects are far away from the user. Higher values allow faster positioning of distant objects with minimal hand movement.", "showIf":"enableStretchZ", "showIfValue":true}
// @ui {"widget":"separator"}
// @ui {"widget":"label", "label":"<span style=\"color: #60A5FA;\">Smoothing Filter</span>"}
// @ui {"widget":"label", "label":"<span style=\"color: #94A3B8; font-size: 11px;\">One-euro filter to reduce jitter and smooth manipulation movement</span>"}
// @input bool useFilter = true {"label":"Use Filter", "hint":"When enabled, applies a one-euro filter to reduce jitter and make translations, rotations, and scaling appear more stable and natural. Disable for immediate 1:1 response to hand movements."}
// @ui {"widget":"separator"}
// @ui {"widget":"label", "label":"<span style=\"color: #60A5FA;\">Advanced Options</span>"}
// @ui {"widget":"label", "label":"<span style=\"color: #94A3B8; font-size: 11px;\">Fine-tune per-axis translation and rotation constraints</span>"}
// @input bool showTranslationProperties {"label":"Show Translation Properties", "hint":"Show per-axis translation options."}
// @input bool _enableXTranslation = true {"label":"Enable X Translation", "hint":"Allow translation along the world's X-axis.", "showIf":"showTranslationProperties", "showIfValue":true}
// @input bool _enableYTranslation = true {"label":"Enable Y Translation", "hint":"Allow translation along the world's Y-axis.", "showIf":"showTranslationProperties", "showIfValue":true}
// @input bool _enableZTranslation = true {"label":"Enable Z Translation", "hint":"Allow translation along the world's Z-axis.", "showIf":"showTranslationProperties", "showIfValue":true}
// @input bool showRotationProperties {"label":"Show Rotation Properties", "hint":"Show rotation axis constraint options."}
// @input string _rotationAxis = "All" {"label":"Rotation Axis", "hint":"Constrain rotation to a specific axis, or allow free rotation.", "widget":"combobox", "values":[{"label":"All", "value":"All"}, {"label":"X", "value":"X"}, {"label":"Y", "value":"Y"}, {"label":"Z", "value":"Z"}], "showIf":"showRotationProperties", "showIfValue":true}
// @ui {"widget":"separator"}
// @ui {"widget":"label", "label":"<span style=\"color: #60A5FA;\">Sync Kit Support</span>"}
// @ui {"widget":"label", "label":"<span style=\"color: #94A3B8; font-size: 11px;\">Connected Lenses position synchronization (requires SpectaclesSyncKit)</span>"}
// @input bool isSynced {"label":"Is Synced", "hint":"Sync position in Connected Lenses sessions. Also enable isSynced on the Interactable."}
if (!global.BaseScriptComponent) {
    function BaseScriptComponent() {}
    global.BaseScriptComponent = BaseScriptComponent;
    global.BaseScriptComponent.prototype = Object.getPrototypeOf(script);
    global.BaseScriptComponent.prototype.__initialize = function () {};
    global.BaseScriptComponent.getTypeName = function () {
        throw new Error("Cannot get type name from the class, not decorated with @component");
    };
}
var Module = require("../../../../../../../Modules/Src/Packages/SpectaclesInteractionKit.lspkg/Components/Interaction/InteractableManipulation/InteractableManipulation");
Object.setPrototypeOf(script, Module.InteractableManipulation.prototype);
script.__initialize();
let awakeEvent = script.createEvent("OnAwakeEvent");
awakeEvent.bind(() => {
    checkUndefined("enableTranslation", []);
    checkUndefined("enableRotation", []);
    checkUndefined("enableScale", []);
    checkUndefined("minimumScaleFactor", []);
    checkUndefined("maximumScaleFactor", []);
    checkUndefined("enableStretchZ", []);
    checkUndefined("zStretchFactorMin", [["enableStretchZ",true]]);
    checkUndefined("zStretchFactorMax", [["enableStretchZ",true]]);
    checkUndefined("useFilter", []);
    checkUndefined("showTranslationProperties", []);
    checkUndefined("_enableXTranslation", [["showTranslationProperties",true]]);
    checkUndefined("_enableYTranslation", [["showTranslationProperties",true]]);
    checkUndefined("_enableZTranslation", [["showTranslationProperties",true]]);
    checkUndefined("showRotationProperties", []);
    checkUndefined("_rotationAxis", [["showRotationProperties",true]]);
    checkUndefined("isSynced", []);
    if (script.onAwake) {
       script.onAwake();
    }
});

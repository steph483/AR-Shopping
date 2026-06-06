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
// @ui {"widget":"label", "label":"<span style=\"color: #60A5FA;\">Distance</span>"}
// @ui {"widget":"label", "label":"<span style=\"color: #94A3B8; font-size: 11px;\">How far the object is positioned from the camera</span>"}
// @input float _distance = 50 {"label":"Distance", "hint":"How far away the SceneObject will be from the camera (in cm)."}
// @ui {"widget":"separator"}
// @ui {"widget":"label", "label":"<span style=\"color: #60A5FA;\">Head Translation</span>"}
// @ui {"widget":"label", "label":"<span style=\"color: #94A3B8; font-size: 11px;\">Controls how the object responds to physical head movement in space</span>"}
// @input bool _xzEnabled = true {"label":"XZ Enabled", "hint":"When enabled, the SceneObject will follow when the user physically moves their head along the XZ-plane (horizontal movement)."}
// @input float _xzEasing = 1 {"label":"XZ Easing", "hint":"How fast the SceneObject will follow along the XZ-plane. Use 0.1 for a delayed, smooth follow effect, or 1 for instant following."}
// @input bool _yEnabled = true {"label":"Y Enabled", "hint":"When enabled, the SceneObject will follow when the user physically moves their head along the Y-axis (vertical movement)."}
// @input float _yEasing = 1 {"label":"Y Easing", "hint":"How fast the SceneObject will follow along the Y-axis. Use 0.1 for a delayed, smooth follow effect, or 1 for instant following."}
// @input float _translationBuffer {"label":"Translation Buffer", "hint":"The magnitude of change (in cm) needed to activate a translation for the object to follow the camera. A small buffer helps prevent 'wobbling' when the user has an unstable head position."}
// @ui {"widget":"separator"}
// @ui {"widget":"label", "label":"<span style=\"color: #60A5FA;\">Pitch Rotation (Up/Down)</span>"}
// @ui {"widget":"label", "label":"<span style=\"color: #94A3B8; font-size: 11px;\">Controls how the object responds when looking up or down</span>"}
// @input bool _lockedPitch = true {"label":"Locked Pitch", "hint":"When enabled, locks the SceneObject's position relative to the pitch-axis, keeping it fixed in place as the user rotates their head up/down."}
// @input float _pitchEasing = 1 {"label":"Pitch Easing", "hint":"How fast the SceneObject will follow along the pitch-axis. Use 0.1 for a delayed, smooth follow effect, or 1 for instant following."}
// @input float _pitchOffsetDegrees {"label":"Pitch Offset Degrees", "hint":"How many degrees of offset from the center point should the SceneObject sit. Positive values place the element below the center."}
// @input float _pitchBufferDegrees {"label":"Pitch Buffer Degrees", "hint":"How many degrees of leeway along each direction (up/down) before the object starts to follow."}
// @ui {"widget":"separator"}
// @ui {"widget":"label", "label":"<span style=\"color: #60A5FA;\">Yaw Rotation (Left/Right)</span>"}
// @ui {"widget":"label", "label":"<span style=\"color: #94A3B8; font-size: 11px;\">Controls how the object responds when looking left or right</span>"}
// @input bool _lockedYaw = true {"label":"Locked Yaw", "hint":"When enabled, locks the SceneObject's position relative to the yaw-axis, keeping it fixed in place as the user rotates their head left/right."}
// @input float _yawEasing = 1 {"label":"Yaw Easing", "hint":"How fast the SceneObject will follow along the yaw-axis. Use 0.1 for a delayed, smooth follow effect, or 1 for instant following."}
// @input float _yawOffsetDegrees {"label":"Yaw Offset Degrees", "hint":"How many degrees of offset from the center point should the SceneObject sit. Positive values place the element to the left."}
// @input float _yawBufferDegrees {"label":"Yaw Buffer Degrees", "hint":"How many degrees of leeway along each direction (left/right) before the object starts to follow."}
if (!global.BaseScriptComponent) {
    function BaseScriptComponent() {}
    global.BaseScriptComponent = BaseScriptComponent;
    global.BaseScriptComponent.prototype = Object.getPrototypeOf(script);
    global.BaseScriptComponent.prototype.__initialize = function () {};
    global.BaseScriptComponent.getTypeName = function () {
        throw new Error("Cannot get type name from the class, not decorated with @component");
    };
}
var Module = require("../../../../../../../Modules/Src/Packages/SpectaclesInteractionKit.lspkg/Components/Interaction/Headlock/Headlock");
Object.setPrototypeOf(script, Module.Headlock.prototype);
script.__initialize();
let awakeEvent = script.createEvent("OnAwakeEvent");
awakeEvent.bind(() => {
    checkUndefined("_distance", []);
    checkUndefined("_xzEnabled", []);
    checkUndefined("_xzEasing", []);
    checkUndefined("_yEnabled", []);
    checkUndefined("_yEasing", []);
    checkUndefined("_translationBuffer", []);
    checkUndefined("_lockedPitch", []);
    checkUndefined("_pitchEasing", []);
    checkUndefined("_pitchOffsetDegrees", []);
    checkUndefined("_pitchBufferDegrees", []);
    checkUndefined("_lockedYaw", []);
    checkUndefined("_yawEasing", []);
    checkUndefined("_yawOffsetDegrees", []);
    checkUndefined("_yawBufferDegrees", []);
    if (script.onAwake) {
       script.onAwake();
    }
});

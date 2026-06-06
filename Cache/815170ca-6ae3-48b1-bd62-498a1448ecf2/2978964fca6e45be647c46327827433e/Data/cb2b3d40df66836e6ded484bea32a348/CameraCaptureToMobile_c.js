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
// @ui {"widget":"label", "label":"<span style=\"color: #60A5FA;\">Camera Capture to Mobile</span><br/><span style=\"color: #94A3B8; font-size: 11px;\">Press the RoundButton to capture a cropped camera frame and send it to the bonded mobile app over BLE.</span>"}
// @ui {"widget":"separator"}
// @ui {"widget":"label", "label":"<span style=\"color: #60A5FA;\">Scene References</span>"}
// @input AssignableType cameraTexture {"hint":"CameraTexture component on your CropCameraTextureTS object (live glasses camera feed)"}
// @input Component.Image placeholderImage {"hint":"Placeholder Image that will show the captured still frame"}
// @input AssignableType_1 captureButton {"hint":"RoundButton that triggers capture on release (trigger up)"}
// @input Component.Text logText {"hint":"Text component used to display connection and transfer logs on screen"}
// @ui {"widget":"separator"}
// @ui {"widget":"label", "label":"<span style=\"color: #60A5FA;\">Logging</span>"}
// @input bool enableLogging {"hint":"Enable general logging"}
// @input bool enableLoggingLifecycle {"hint":"Enable lifecycle logging (onAwake, onStart)"}
if (!global.BaseScriptComponent) {
    function BaseScriptComponent() {}
    global.BaseScriptComponent = BaseScriptComponent;
    global.BaseScriptComponent.prototype = Object.getPrototypeOf(script);
    global.BaseScriptComponent.prototype.__initialize = function () {};
    global.BaseScriptComponent.getTypeName = function () {
        throw new Error("Cannot get type name from the class, not decorated with @component");
    };
}
var Module = require("../../../../Modules/Src/Assets/Scripts/CameraCaptureToMobile");
Object.setPrototypeOf(script, Module.CameraCaptureToMobile.prototype);
script.__initialize();
let awakeEvent = script.createEvent("OnAwakeEvent");
awakeEvent.bind(() => {
    checkUndefined("cameraTexture", []);
    checkUndefined("placeholderImage", []);
    checkUndefined("captureButton", []);
    checkUndefined("logText", []);
    checkUndefined("enableLogging", []);
    checkUndefined("enableLoggingLifecycle", []);
    if (script.onAwake) {
       script.onAwake();
    }
});

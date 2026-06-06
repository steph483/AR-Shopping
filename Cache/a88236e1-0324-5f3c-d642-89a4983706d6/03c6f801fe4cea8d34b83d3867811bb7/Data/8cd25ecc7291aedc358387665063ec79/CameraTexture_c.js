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
// @ui {"widget":"label", "label":"<span style=\"color: #60A5FA;\">UI Configuration</span>"}
// @ui {"widget":"label", "label":"<span style=\"color: #94A3B8; font-size: 11px;\">Specify the UI image component and texture resources</span>"}
// @input Component.Image uiImage {"hint":"The image component that will display the cropped camera frame."}
// @input Asset.Texture screenTexture {"hint":"Texture used for processing camera frames"}
// @input Asset.CameraModule camModule {"hint":"Camera module reference from the scene."}
// @ui {"widget":"separator"}
// @ui {"widget":"label", "label":"<span style=\"color: #60A5FA;\">Crop Rectangle Settings</span>"}
// @ui {"widget":"label", "label":"<span style=\"color: #94A3B8; font-size: 11px;\">Define the crop region using normalized coordinates (-1 to 1) for left, right, bottom, and top boundaries</span>"}
// @input float cropLeft = -0.2 {"hint":"Crop rectangle left boundary (-1 to 1)."}
// @input float cropRight = 0.2 {"hint":"Crop rectangle right boundary (-1 to 1)."}
// @input float cropBottom = -0.2 {"hint":"Crop rectangle bottom boundary (-1 to 1)."}
// @input float cropTop = 0.2 {"hint":"Crop rectangle top boundary (-1 to 1)."}
// @ui {"widget":"separator"}
// @ui {"widget":"label", "label":"<span style=\"color: #60A5FA;\">Logging Configuration</span>"}
// @ui {"widget":"label", "label":"<span style=\"color: #94A3B8; font-size: 11px;\">Control logging output for this script instance</span>"}
// @input bool enableLogging {"hint":"Enable general logging (camera setup, texture processing, etc.)"}
// @input bool enableLoggingLifecycle {"hint":"Enable lifecycle logging (onAwake, onStart, onUpdate, onDestroy, etc.)"}
if (!global.BaseScriptComponent) {
    function BaseScriptComponent() {}
    global.BaseScriptComponent = BaseScriptComponent;
    global.BaseScriptComponent.prototype = Object.getPrototypeOf(script);
    global.BaseScriptComponent.prototype.__initialize = function () {};
    global.BaseScriptComponent.getTypeName = function () {
        throw new Error("Cannot get type name from the class, not decorated with @component");
    };
}
var Module = require("../../../../../Modules/Src/Packages/CropCameraTexture.lspkg/Scripts/CameraTexture");
Object.setPrototypeOf(script, Module.CameraTexture.prototype);
script.__initialize();
let awakeEvent = script.createEvent("OnAwakeEvent");
awakeEvent.bind(() => {
    checkUndefined("uiImage", []);
    checkUndefined("screenTexture", []);
    checkUndefined("camModule", []);
    checkUndefined("cropLeft", []);
    checkUndefined("cropRight", []);
    checkUndefined("cropBottom", []);
    checkUndefined("cropTop", []);
    checkUndefined("enableLogging", []);
    checkUndefined("enableLoggingLifecycle", []);
    if (script.onAwake) {
       script.onAwake();
    }
});

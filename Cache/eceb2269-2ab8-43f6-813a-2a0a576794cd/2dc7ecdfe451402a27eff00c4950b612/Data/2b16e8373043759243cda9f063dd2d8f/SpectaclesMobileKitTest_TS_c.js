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
// @ui {"widget":"label", "label":"<span style=\"color: #60A5FA;\">SpectaclesMobileTest_TS – Mobile Kit test scene</span><br/><span style=\"color: #94A3B8; font-size: 11px;\">Tests BLE session, request-response, subscriptions, and remote asset loading.</span>"}
// @ui {"widget":"separator"}
// @ui {"widget":"label", "label":"<span style=\"color: #60A5FA;\">Session</span>"}
// @input bool resetAfterDelay {"hint":"Automatically close the session after a 10 second delay"}
// @ui {"widget":"separator"}
// @ui {"widget":"label", "label":"<span style=\"color: #60A5FA;\">Scene References</span>"}
// @input Component.Image image {"hint":"Image used to display the remote texture asset"}
// @input SceneObject gltfContainer {"hint":"Container SceneObject for the instantiated GLTF mesh"}
// @input Asset.Material gltfMaterial {"hint":"Material applied to the instantiated GLTF asset"}
// @input Component.Text logText {"hint":"Text component used to display connection and data logs on screen"}
// @ui {"widget":"separator"}
// @ui {"widget":"label", "label":"<span style=\"color: #60A5FA;\">Logging</span>"}
// @input bool enableLogging {"hint":"Enable general logging"}
// @input bool enableLoggingLifecycle {"hint":"Enable lifecycle logging (onAwake, onStart, onUpdate, onDestroy)"}
if (!global.BaseScriptComponent) {
    function BaseScriptComponent() {}
    global.BaseScriptComponent = BaseScriptComponent;
    global.BaseScriptComponent.prototype = Object.getPrototypeOf(script);
    global.BaseScriptComponent.prototype.__initialize = function () {};
    global.BaseScriptComponent.getTypeName = function () {
        throw new Error("Cannot get type name from the class, not decorated with @component");
    };
}
var Module = require("../../../../Modules/Src/Assets/Scripts/SpectaclesMobileKitTest_TS");
Object.setPrototypeOf(script, Module.SpectaclesMobileTest_TS.prototype);
script.__initialize();
let awakeEvent = script.createEvent("OnAwakeEvent");
awakeEvent.bind(() => {
    checkUndefined("resetAfterDelay", []);
    checkUndefined("image", []);
    checkUndefined("gltfContainer", []);
    checkUndefined("gltfMaterial", []);
    checkUndefined("logText", []);
    checkUndefined("enableLogging", []);
    checkUndefined("enableLoggingLifecycle", []);
    if (script.onAwake) {
       script.onAwake();
    }
});

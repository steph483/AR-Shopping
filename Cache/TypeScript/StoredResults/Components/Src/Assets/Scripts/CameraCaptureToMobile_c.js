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
// @ui {"widget":"label", "label":"<span style=\"color: #60A5FA;\">Camera Capture to Mobile</span><br/><span style=\"color: #94A3B8; font-size: 11px;\">Press the RoundButton to capture a camera frame and send it to the bonded mobile app over BLE.</span>"}
// @ui {"widget":"separator"}
// @ui {"widget":"label", "label":"<span style=\"color: #60A5FA;\">Scene References</span>"}
// @input AssignableType cameraTexture {"hint":"CameraTexture component on your CropCameraTextureTS object (live glasses camera feed)"}
// @input SceneObject liveFeedObject {"hint":"SceneObject that displays the live camera feed (e.g. CaptureCropped). Shown while aiming; hidden after capture until RoundButton is pressed again."}
// @input SceneObject reticleObject {"hint":"Head-locked reticle (child of Camera). Centered on capture region — e.g. ScanReticle"}
// @input Component.Image placeholderImage {"hint":"Placeholder Image used only when showCapturePreviewOnGlasses is enabled"}
// @input AssignableType_1 captureButton {"hint":"RoundButton that triggers capture on release (trigger up)"}
// @input Component.Text logText {"hint":"Text component used to display connection and transfer logs on screen"}
// @input Component.Text resultPanelText {"hint":"Blank panel text for food lookup results (debug). Wire a Text on your result panel."}
// @ui {"widget":"separator"}
// @ui {"widget":"label", "label":"<span style=\"color: #60A5FA;\">Scan View</span>"}
// @input bool showCapturePreviewOnGlasses {"hint":"Show the captured still on glasses after each scan. Off sends to phone only."}
// @ui {"widget":"separator"}
// @ui {"widget":"label", "label":"<span style=\"color: #60A5FA;\">Capture Region</span>"}
// @input bool useFullFrameCapture = true {"hint":"Send the full camera frame. Off uses the crop region below for live feed and capture."}
// @input float cropHalfSize = 0.22 {"hint":"Half-size of the square crop region in normalized coords. Smaller = more zoom (0.22 ≈ 44% of frame). Ignored when useFullFrameCapture is on."}
// @input float cropHorizontalOffset = 0.08 {"hint":"Shift capture region horizontally to match reticle. Ignored when useFullFrameCapture is on."}
// @ui {"widget":"separator"}
// @ui {"widget":"label", "label":"<span style=\"color: #60A5FA;\">Capture Quality</span>"}
// @input bool useHighResStillCapture = true {"hint":"Use CameraModule.requestImage for a 3200x2400 still. Much sharper than the live stream."}
// @ui {"widget":"separator"}
// @ui {"widget":"label", "label":"<span style=\"color: #60A5FA;\">Barcode Encode</span>"}
// @input bool encodeGrayscale = true {"hint":"Convert to grayscale before JPEG encode. Smaller files, better for barcode scanning."}
// @input bool maximumJpegQuality {"hint":"Use maximum JPEG quality (larger transfer, less compression grain). Off uses high quality."}
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
    checkUndefined("liveFeedObject", []);
    checkUndefined("reticleObject", []);
    checkUndefined("placeholderImage", []);
    checkUndefined("captureButton", []);
    checkUndefined("logText", []);
    checkUndefined("resultPanelText", []);
    checkUndefined("showCapturePreviewOnGlasses", []);
    checkUndefined("useFullFrameCapture", []);
    checkUndefined("cropHalfSize", []);
    checkUndefined("cropHorizontalOffset", []);
    checkUndefined("useHighResStillCapture", []);
    checkUndefined("encodeGrayscale", []);
    checkUndefined("maximumJpegQuality", []);
    checkUndefined("enableLogging", []);
    checkUndefined("enableLoggingLifecycle", []);
    if (script.onAwake) {
       script.onAwake();
    }
});

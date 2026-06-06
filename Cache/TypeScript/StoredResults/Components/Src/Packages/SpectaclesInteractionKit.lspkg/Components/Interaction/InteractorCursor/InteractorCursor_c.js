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
// @ui {"widget":"label", "label":"<span style=\"color: #60A5FA;\">Cursor Behavior</span>"}
// @ui {"widget":"label", "label":"<span style=\"color: #94A3B8; font-size: 11px;\">Configure how the cursor responds to hand movement and interactions</span>"}
// @input bool enableCursorHolding = true {"label":"Enable Cursor Holding", "hint":"Controls the \"stickiness\" of the cursor when hovering over interactable objects. When enabled, the cursor maintains its position on the target object, even when the hand moves slightly, making interaction with small targets easier. Only applies to hand-based interactions, not other input types like mouse. Disable for immediate 1:1 cursor movement that follows the hand position exactly."}
// @input bool enableFilter {"label":"Enable Filter", "hint":"Applies smoothing to cursor movement for hand-based interactions. When enabled, reduces jitter and makes cursor motion appear more stable, improving precision when interacting with small targets. Only applies to hand-based interactions."}
// @ui {"widget":"separator"}
// @ui {"widget":"label", "label":"<span style=\"color: #60A5FA;\">Interactor Reference</span>"}
// @ui {"widget":"label", "label":"<span style=\"color: #94A3B8; font-size: 11px;\">Link this cursor to an interactor (typically set automatically by CursorController)</span>"}
// @input Component.ScriptComponent _interactor {"label":"Interactor", "hint":"Reference to the interactor component that this cursor will visualize. The cursor will update its position and appearance based on the interactor's state. This is typically set automatically by CursorController, but can be manually assigned for custom cursor setups."}
if (!global.BaseScriptComponent) {
    function BaseScriptComponent() {}
    global.BaseScriptComponent = BaseScriptComponent;
    global.BaseScriptComponent.prototype = Object.getPrototypeOf(script);
    global.BaseScriptComponent.prototype.__initialize = function () {};
    global.BaseScriptComponent.getTypeName = function () {
        throw new Error("Cannot get type name from the class, not decorated with @component");
    };
}
var Module = require("../../../../../../../Modules/Src/Packages/SpectaclesInteractionKit.lspkg/Components/Interaction/InteractorCursor/InteractorCursor");
Object.setPrototypeOf(script, Module.InteractorCursor.prototype);
script.__initialize();
let awakeEvent = script.createEvent("OnAwakeEvent");
awakeEvent.bind(() => {
    checkUndefined("enableCursorHolding", []);
    checkUndefined("enableFilter", []);
    if (script.onAwake) {
       script.onAwake();
    }
});

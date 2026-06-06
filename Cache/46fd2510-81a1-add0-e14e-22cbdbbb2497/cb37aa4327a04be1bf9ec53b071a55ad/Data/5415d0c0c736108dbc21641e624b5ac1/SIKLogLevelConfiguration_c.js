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
// @ui {"widget":"label", "label":"<span style=\"color: #60A5FA;\">Log Configuration</span>"}
// @ui {"widget":"label", "label":"<span style=\"color: #94A3B8; font-size: 11px;\">Configure logging verbosity for debugging and diagnostics</span>"}
// @input int logLevelFilter = 8 {"label":"Log Level Filter", "hint":"Controls the verbosity of logs. Higher values show more detailed logs, while lower values only show critical information.\\n- Error (3): Errors that may affect functionality.\\n- Warning (4): Potential issues that don't affect normal operation.\\n- Info (6): General information about application state.\\n- Debug (7): Detailed information useful for debugging.\\n- Verbose (8): Maximum detail including fine-grained operational data.", "widget":"combobox", "values":[{"label":"Error", "value":3}, {"label":"Warning", "value":4}, {"label":"Info", "value":6}, {"label":"Debug", "value":7}, {"label":"Verbose", "value":8}]}
// @ui {"widget":"separator"}
// @ui {"widget":"label", "label":"<span style=\"color: #60A5FA;\">Debug Mode</span>"}
// @ui {"widget":"label", "label":"<span style=\"color: #94A3B8; font-size: 11px;\">Enable visual debugging for all SIK Interactors and Interactables</span>"}
// @input bool _debugModeEnabled {"label":"Debug Mode Enabled", "hint":"When enabled, activates debug mode for all SIK Interactors and Interactables, drawing visual gizmos to help visualize raycasts, colliders, and interaction geometry in the scene. Useful for troubleshooting interaction issues during development."}
if (!global.BaseScriptComponent) {
    function BaseScriptComponent() {}
    global.BaseScriptComponent = BaseScriptComponent;
    global.BaseScriptComponent.prototype = Object.getPrototypeOf(script);
    global.BaseScriptComponent.prototype.__initialize = function () {};
    global.BaseScriptComponent.getTypeName = function () {
        throw new Error("Cannot get type name from the class, not decorated with @component");
    };
}
var Module = require("../../../../../../Modules/Src/Packages/SpectaclesInteractionKit.lspkg/Core/LogLevelConfiguration/SIKLogLevelConfiguration");
Object.setPrototypeOf(script, Module.SIKLogLevelConfiguration.prototype);
script.__initialize();
let awakeEvent = script.createEvent("OnAwakeEvent");
awakeEvent.bind(() => {
    checkUndefined("logLevelFilter", []);
    checkUndefined("_debugModeEnabled", []);
    if (script.onAwake) {
       script.onAwake();
    }
});

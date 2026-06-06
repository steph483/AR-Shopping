if (script.onAwake) {
    script.onAwake();
    return;
}
/*
@typedef HandVisualOverrideItem
@property {float} overrideType {"widget":"combobox", "values":[{"label":"Force Pinch Visual", "value":0}, {"label":"Force Poke Visual", "value":1}, {"label":"Exclude Pinch Visual", "value":2}, {"label":"Exclude Poke Visual", "value":3}, {"label":"Pinch Distance Override", "value":4}, {"label":"Poke Distance Override", "value":5}]}
@property {float} pinchDistance {"showIf":"overrideType", "showIfValue":4}
@property {float} pokeDistance {"showIf":"overrideType", "showIfValue":5}
*/
/*
@typedef HandVisualOverride
@property {SceneObject} interactableSceneObject
@property {HandVisualOverrideItem[]} overrides
*/
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
// @ui {"widget":"label", "label":"<span style=\"color: #60A5FA;\">Hand Configuration</span>"}
// @ui {"widget":"label", "label":"<span style=\"color: #94A3B8; font-size: 11px;\">Core settings that control how the user's hand appears</span>"}
// @input string handType {"label":"Hand Type", "hint":"Specifies which hand (Left or Right) this visual representation tracks and renders.", "widget":"combobox", "values":[{"label":"Left", "value":"left"}, {"label":"Right", "value":"right"}]}
// @input string _meshType {"label":"Mesh Type", "hint":"Specifies the hand mesh to display. 'Full' renders all fingers, while 'Index & Thumb' renders only the fingers used for pinch interactions for better performance. Can be changed at runtime.", "widget":"combobox", "values":[{"label":"Full", "value":"Full"}, {"label":"Index & Thumb", "value":"IndexThumb"}]}
// @input string selectVisual = "Default" {"label":"Visual Style", "hint":"Sets the hand visual style:\\n- Default: Shows glowing fingertips during interactions\\n- AlwaysOn: Always shows glowing fingertips\\n- Occluder: Blocks content behind the hand (no glow)\\n- None: Disables all hand visuals", "widget":"combobox", "values":[{"label":"Default", "value":"Default"}, {"label":"AlwaysOn", "value":"AlwaysOn"}, {"label":"Occluder", "value":"Occluder"}, {"label":"None", "value":"None"}]}
// @ui {"widget":"separator"}
// @ui {"widget":"label", "label":"<span style=\"color: #60A5FA;\">References</span>"}
// @ui {"widget":"label", "label":"<span style=\"color: #94A3B8; font-size: 11px;\">Required component and mesh references</span>"}
// @input AssignableType handInteractor {"label":"Hand Interactor", "hint":"Reference to the HandInteractor component that provides gesture recognition and tracking for this hand."}
// @input SceneObject root {"label":"Root", "hint":"Reference to the parent SceneObject that contains both the hand's rig and mesh."}
// @input Component.RenderMeshVisual handMeshFull {"label":"Hand Mesh Full", "hint":"Reference to the RenderMeshVisual of the full hand mesh. Leave empty to auto-detect from hierarchy."}
// @input Component.RenderMeshVisual handMeshIndexThumb {"label":"Hand Mesh Index & Thumb", "hint":"Reference to the RenderMeshVisual for the index & thumb only hand mesh. Leave empty to auto-detect from hierarchy."}
// @input Component.RenderMeshVisual handMeshPin {"label":"Hand Mesh Pin", "hint":"Reference to the RenderMeshVisual of the full hand mesh to pin SceneObjects to (left hand only)."}
// @ui {"widget":"separator"}
// @ui {"widget":"label", "label":"<span style=\"color: #60A5FA;\">Joint Mapping</span>"}
// @ui {"widget":"label", "label":"<span style=\"color: #94A3B8; font-size: 11px;\">Configure how tracking data maps to hand model joints</span>"}
// @input bool autoJointMapping = true {"label":"Auto Joint Mapping", "hint":"When enabled, the system will automatically map tracking data to the hand model's joints. Disable only if you need manual control over individual joint assignments."}
// @ui {"widget":"group_start", "label":"Joint Setup", "showIf":"autoJointMapping", "showIfValue":false}
// @input SceneObject wrist
// @input SceneObject thumbToWrist
// @input SceneObject thumbBaseJoint
// @input SceneObject thumbKnuckle
// @input SceneObject thumbMidJoint
// @input SceneObject thumbTip
// @input SceneObject indexToWrist
// @input SceneObject indexKnuckle
// @input SceneObject indexMidJoint
// @input SceneObject indexUpperJoint
// @input SceneObject indexTip
// @input SceneObject middleToWrist
// @input SceneObject middleKnuckle
// @input SceneObject middleMidJoint
// @input SceneObject middleUpperJoint
// @input SceneObject middleTip
// @input SceneObject ringToWrist
// @input SceneObject ringKnuckle
// @input SceneObject ringMidJoint
// @input SceneObject ringUpperJoint
// @input SceneObject ringTip
// @input SceneObject pinkyToWrist
// @input SceneObject pinkyKnuckle
// @input SceneObject pinkyMidJoint
// @input SceneObject pinkyUpperJoint
// @input SceneObject pinkyTip
// @ui {"widget":"group_end"}
// @ui {"widget":"separator"}
// @ui {"widget":"label", "label":"<span style=\"color: #60A5FA;\">Glow Effect</span>"}
// @ui {"widget":"label", "label":"<span style=\"color: #94A3B8; font-size: 11px;\">Customize the visual feedback that appears around fingertips during interactions</span>"}
// @input Asset.Material tipGlowMaterial {"label":"Tip Glow Material", "hint":"The material which will be manipulated to create the glow effect on fingertips."}
// @input vec4 hoverColor {"label":"Hover Color", "hint":"The color of the glow effect when hovering near interactive elements (not yet triggered).", "widget":"color"}
// @input vec4 triggerColor {"label":"Trigger Color", "hint":"The color of the glow effect when actively pinching or poking (triggered state).", "widget":"color"}
// @ui {"widget":"separator"}
// @ui {"widget":"label", "label":"<span style=\"color: #60A5FA;\">Materials</span>"}
// @ui {"widget":"label", "label":"<span style=\"color: #94A3B8; font-size: 11px;\">Materials for different hand visual styles</span>"}
// @input Asset.Material handOccluderMaterial {"label":"Hand Occluder Material", "hint":"The material used when Visual Style is set to 'Occluder'. This material blocks content behind the hand."}
// @ui {"widget":"separator"}
// @ui {"widget":"label", "label":"<span style=\"color: #60A5FA;\">Overrides</span>"}
// @ui {"widget":"label", "label":"<span style=\"color: #94A3B8; font-size: 11px;\">Customize hand visual effects for specific interactables</span>"}
// @input HandVisualOverride[] overrides = {} {"label":"Overrides", "hint":"Configure per-interactable overrides for hand visual effects. Use this to force or exclude specific visual behaviors (pinch/poke) or override distance thresholds for individual interactables."}
if (!global.BaseScriptComponent) {
    function BaseScriptComponent() {}
    global.BaseScriptComponent = BaseScriptComponent;
    global.BaseScriptComponent.prototype = Object.getPrototypeOf(script);
    global.BaseScriptComponent.prototype.__initialize = function () {};
    global.BaseScriptComponent.getTypeName = function () {
        throw new Error("Cannot get type name from the class, not decorated with @component");
    };
}
var Module = require("../../../../../../../Modules/Src/Packages/SpectaclesInteractionKit.lspkg/Components/Interaction/HandVisual/HandVisual");
Object.setPrototypeOf(script, Module.HandVisual.prototype);
script.__initialize();
let awakeEvent = script.createEvent("OnAwakeEvent");
awakeEvent.bind(() => {
    checkUndefined("handType", []);
    checkUndefined("_meshType", []);
    checkUndefined("selectVisual", []);
    checkUndefined("handInteractor", []);
    checkUndefined("root", []);
    checkUndefined("autoJointMapping", []);
    checkUndefined("tipGlowMaterial", []);
    checkUndefined("hoverColor", []);
    checkUndefined("triggerColor", []);
    checkUndefined("handOccluderMaterial", []);
    checkUndefined("overrides", []);
    if (script.onAwake) {
       script.onAwake();
    }
});

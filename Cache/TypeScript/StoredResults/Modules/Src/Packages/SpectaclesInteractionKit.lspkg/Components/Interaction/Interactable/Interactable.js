"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Interactable = exports.TargetingVisual = exports.SyncInteractionType = void 0;
var __selfType = requireType("./Interactable");
function component(target) {
    target.getTypeName = function () { return __selfType; };
    if (target.prototype.hasOwnProperty("getTypeName"))
        return;
    Object.defineProperty(target.prototype, "getTypeName", {
        value: function () { return __selfType; },
        configurable: true,
        writable: true
    });
}
const InteractionManager_1 = require("../../../Core/InteractionManager/InteractionManager");
const InteractionConfigurationProvider_1 = require("../../../Providers/InteractionConfigurationProvider/InteractionConfigurationProvider");
const Event_1 = require("../../../Utils/Event");
const NativeLogger_1 = require("../../../Utils/NativeLogger");
const SceneObjectUtils_1 = require("../../../Utils/SceneObjectUtils");
const SyncKitBridge_1 = require("../../../Utils/SyncKitBridge");
const InteractableEventHandler_1 = require("./InteractableEventHandler");
const TAG = "Interactable";
/**
 * Relevant only to lenses that use SpectaclesSyncKit when it has SyncInteractionManager in its prefab.
 * Setting an Interactable's acceptableInputType to a non-All value results in the Interactable only being
 * able to be interacted with by a specific user.
 * Host means that only the host of the session can interact.
 * Local means only the user with the same connection ID as the
 * Interactable's localConnectionId can interact.
 * HostAndLocal means that the host or the local user can interact.
 */
var SyncInteractionType;
(function (SyncInteractionType) {
    SyncInteractionType[SyncInteractionType["None"] = 0] = "None";
    SyncInteractionType[SyncInteractionType["Host"] = 1] = "Host";
    SyncInteractionType[SyncInteractionType["Local"] = 2] = "Local";
    SyncInteractionType[SyncInteractionType["Other"] = 4] = "Other";
    SyncInteractionType[SyncInteractionType["HostAndLocal"] = 3] = "HostAndLocal";
    SyncInteractionType[SyncInteractionType["All"] = 7] = "All";
})(SyncInteractionType || (exports.SyncInteractionType = SyncInteractionType = {}));
/**
 * TargetingVisual is a bitflag that determines the targeting visual representation.
 */
var TargetingVisual;
(function (TargetingVisual) {
    TargetingVisual[TargetingVisual["None"] = 0] = "None";
    TargetingVisual[TargetingVisual["Cursor"] = 1] = "Cursor";
    TargetingVisual[TargetingVisual["Ray"] = 2] = "Ray";
})(TargetingVisual || (exports.TargetingVisual = TargetingVisual = {}));
/**
 * This class represents an interactable object that can respond to various interaction events such as hover, trigger,
 * and drag. It provides event handlers for these interactions and uses the InteractionConfigurationProvider for
 * configuration.
 *
 * The core event handling logic is delegated to InteractableEventHandler.
 */
let Interactable = (() => {
    let _classDecorators = [component];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseScriptComponent;
    var Interactable = _classThis = class extends _classSuper {
        constructor() {
            super();
            // Events - these are the actual event emitters
            this.onHoverEnterEvent = new Event_1.default();
            this.onHoverUpdateEvent = new Event_1.default();
            this.onHoverExitEvent = new Event_1.default();
            this.onInteractorHoverEnterEvent = new Event_1.default();
            this.onInteractorHoverExitEvent = new Event_1.default();
            this.onTriggerStartEvent = new Event_1.default();
            this.onTriggerUpdateEvent = new Event_1.default();
            this.onTriggerEndEvent = new Event_1.default();
            this.onTriggerEndOutsideEvent = new Event_1.default();
            this.onInteractorTriggerStartEvent = new Event_1.default();
            this.onInteractorTriggerEndEvent = new Event_1.default();
            this.onInteractorTriggerEndOutsideEvent = new Event_1.default();
            this.onDragStartEvent = new Event_1.default();
            this.onDragUpdateEvent = new Event_1.default();
            this.onDragEndEvent = new Event_1.default();
            this.onTriggerCanceledEvent = new Event_1.default();
            this.onSyncHoverEnterEvent = new Event_1.default();
            this.onSyncHoverUpdateEvent = new Event_1.default();
            this.onSyncHoverExitEvent = new Event_1.default();
            this.onSyncInteractorHoverEnterEvent = new Event_1.default();
            this.onSyncInteractorHoverExitEvent = new Event_1.default();
            this.onSyncTriggerStartEvent = new Event_1.default();
            this.onSyncTriggerUpdateEvent = new Event_1.default();
            this.onSyncTriggerEndEvent = new Event_1.default();
            this.onSyncTriggerEndOutsideEvent = new Event_1.default();
            this.onSyncInteractorTriggerStartEvent = new Event_1.default();
            this.onSyncInteractorTriggerEndEvent = new Event_1.default();
            this.onSyncInteractorTriggerEndOutsideEvent = new Event_1.default();
            this.onSyncTriggerCanceledEvent = new Event_1.default();
            this.onSyncDragStartEvent = new Event_1.default();
            this.onSyncDragUpdateEvent = new Event_1.default();
            this.onSyncDragEndEvent = new Event_1.default();
            this.interactionConfigurationProvider = InteractionConfigurationProvider_1.InteractionConfigurationProvider.getInstance();
            this.syncKitBridge = SyncKitBridge_1.SyncKitBridge.getInstance();
            this.syncEntity = this.syncKitBridge.createSyncEntity(this);
            // Native Logging
            this.log = new NativeLogger_1.default(TAG);
            /**
             * The event handler that manages bitflags, compound events, and local/sync routing.
             */
            this.eventHandler = this.createEventHandler();
            /**
             * Called whenever the interactable enters the hovered state.
             */
            this.onHoverEnter = this.onHoverEnterEvent.publicApi();
            /**
             * Called whenever a new interactor hovers over this interactable.
             */
            this.onInteractorHoverEnter = this.onInteractorHoverEnterEvent.publicApi();
            /**
             * Called whenever an interactor remains hovering over this interactable.
             */
            this.onHoverUpdate = this.onHoverUpdateEvent.publicApi();
            /**
             *  Called whenever the interactable is no longer hovered.
             */
            this.onHoverExit = this.onHoverExitEvent.publicApi();
            /**
             * Called whenever an interactor exits hovering this interactable.
             */
            this.onInteractorHoverExit = this.onInteractorHoverExitEvent.publicApi();
            /**
             * Called whenever the interactable enters the triggered state.
             */
            this.onTriggerStart = this.onTriggerStartEvent.publicApi();
            /**
             * Called whenever an interactor triggers an interactable.
             */
            this.onInteractorTriggerStart = this.onInteractorTriggerStartEvent.publicApi();
            /**
             * Called whenever an interactor continues to trigger an interactable.
             */
            this.onTriggerUpdate = this.onTriggerUpdateEvent.publicApi();
            /**
             * Called whenever the interactable exits the triggered state while the interactor is hovering it.
             */
            this.onTriggerEnd = this.onTriggerEndEvent.publicApi();
            /**
             * Called whenever the interactable exits the triggered state while the interactor is not hovering it.
             */
            this.onTriggerEndOutside = this.onTriggerEndOutsideEvent.publicApi();
            /**
             * Called whenever an interactor is no longer triggering the interactable while the interactor is hovering it.
             */
            this.onInteractorTriggerEnd = this.onInteractorTriggerEndEvent.publicApi();
            /**
             * Called whenever an interactor is no longer triggering the interactable while the interactor is not hovering it.
             */
            this.onInteractorTriggerEndOutside = this.onInteractorTriggerEndOutsideEvent.publicApi();
            /**
             * Called whenever an interactor is lost and was in a down event with this interactable.
             */
            this.onTriggerCanceled = this.onTriggerCanceledEvent.publicApi();
            /**
             * Called when an interactor is in a down event with this interactable and
             * has moved a minimum drag distance.
             */
            this.onDragStart = this.onDragStartEvent.publicApi();
            /**
             * Called when an interactor is in a down event with this interactable and
             * is moving.
             */
            this.onDragUpdate = this.onDragUpdateEvent.publicApi();
            /**
             * Called when an interactor was in a down event with this interactable and
             * was dragging.
             */
            this.onDragEnd = this.onDragEndEvent.publicApi();
            /**
             * The following onSync events are only invoked when in a Connected Lens with SpectaclesSyncKit present.
             * If another connected user invokes an onHoverEnter event, the local user will see an onSyncHoverEvent.
             * These events are useful for simple feedback scripts to allow other users to understand when an Interactable
             * is being interacted with another user already.
             */
            /**
             * Called whenever the interactable enters the hovered state from another connection.
             */
            this.onSyncHoverEnter = this.onSyncHoverEnterEvent.publicApi();
            /**
             * Called whenever a new interactor hovers over this interactable from another connection.
             */
            this.onSyncInteractorHoverEnter = this.onSyncInteractorHoverEnterEvent.publicApi();
            /**
             * Called whenever an interactor remains hovering over this interactable from another connection.
             */
            this.onSyncHoverUpdate = this.onSyncHoverUpdateEvent.publicApi();
            /**
             *  Called whenever the interactable is no longer hovered from another connection.
             */
            this.onSyncHoverExit = this.onSyncHoverExitEvent.publicApi();
            /**
             * Called whenever an interactor exits hovering this interactable from another connection.
             */
            this.onSyncInteractorHoverExit = this.onSyncInteractorHoverExitEvent.publicApi();
            /**
             * Called whenever the interactable enters the triggered state from another connection.
             */
            this.onSyncTriggerStart = this.onSyncTriggerStartEvent.publicApi();
            /**
             * Called whenever an interactor triggers an interactable from another connection.
             */
            this.onSyncInteractorTriggerStart = this.onSyncInteractorTriggerStartEvent.publicApi();
            /**
             * Called whenever an interactor continues to trigger an interactable from another connection.
             */
            this.onSyncTriggerUpdate = this.onSyncTriggerUpdateEvent.publicApi();
            /**
             * Called whenever the interactable exits the triggered state while the interactor is hovering it from another connection.
             */
            this.onSyncTriggerEnd = this.onSyncTriggerEndEvent.publicApi();
            /**
             * Called whenever the interactable exits the triggered state while the interactor is not hovering it from another connection.
             */
            this.onSyncTriggerEndOutside = this.onSyncTriggerEndOutsideEvent.publicApi();
            /**
             * Called whenever an interactor is no longer triggering the interactable while the interactor is hovering it from another connection.
             */
            this.onSyncInteractorTriggerEnd = this.onSyncInteractorTriggerEndEvent.publicApi();
            /**
             * Called whenever an interactor is no longer triggering the interactable while the interactor is not hovering it from another connection.
             */
            this.onSyncInteractorTriggerEndOutside = this.onSyncInteractorTriggerEndOutsideEvent.publicApi();
            /**
             * Called whenever an interactor is lost and was in a down event with this interactable from another connection.
             */
            this.onSyncTriggerCanceled = this.onSyncTriggerCanceledEvent.publicApi();
            /**
             * Called when an interactor is in a down event with this interactable and
             * has moved a minimum drag distance from another connection.
             */
            this.onSyncDragStart = this.onSyncDragStartEvent.publicApi();
            /**
             * Called when an interactor is in a down event with this interactable and
             * is moving from another connection.
             */
            this.onSyncDragUpdate = this.onSyncDragUpdateEvent.publicApi();
            /**
             * Called when an interactor was in a down event with this interactable and
             * was dragging from another connection.
             */
            this.onSyncDragEnd = this.onSyncDragEndEvent.publicApi();
            /**
             * Provides all colliders associated with this Interactable.
             */
            this.colliders = [];
            this.targetingMode = this.targetingMode;
            /**
             * Sets the preferred targeting visual. (Requires the V2 Cursor to be enabled on InteractorCursors).
             * - 0: Cursor (default)
             * - 1: Ray
             * - 2: None
             */
            this.targetingVisual = this.targetingVisual;
            this.ignoreInteractionPlane = this.ignoreInteractionPlane;
            /**
             * Defines the singular source of truth for feedback + UI + cursor components to poll to check
             * if the Interactable should exhibit sticky behavior during trigger
             * (cursor locks on Interactable, remains in active visual state even after de-hovering).
             */
            this.keepHoverOnTrigger = this.keepHoverOnTrigger;
            /**
             * Enable this to allow the Interactable to instantly be dragged on trigger rather than obeying the Interactor's
             * drag threshold.
             */
            this.enableInstantDrag = this.enableInstantDrag;
            /**
             * A flag that enables scroll interactions when this element is interacted with. When true, interactions with this
             * element can scroll a parent ScrollView that has content extending beyond its visible bounds.
             */
            this.isScrollable = this.isScrollable;
            /**
             * Determines whether this Interactable can be simultaneously controlled by multiple Interactors. When false, only
             * one Interactor type (e.g., left hand or right hand) can interact with this Interactable at a time, and subsequent
             * interaction attempts from different Interactors will be blocked. Set to true to enable interactions from multiple
             * sources simultaneously, such as allowing both hands to manipulate the Interactable at once.
             */
            this.allowMultipleInteractors = this.allowMultipleInteractors;
            this.enablePokeDirectionality = this.enablePokeDirectionality;
            /**
             * Controls from which directions a poke interaction can trigger this Interactable along the X-axis:
             * - Left: Finger must approach from -X direction.
             * - Right: Finger must approach from +X direction.
             * - All: Accepts both directions.
             * - None: Disables X-axis poke detection.
             */
            this.acceptableXDirections = this.acceptableXDirections;
            /**
             * Controls from which directions a poke interaction can trigger this Interactable along the Y-axis:
             * - Top: Finger must approach from +Y direction
             * - Bottom: Finger must approach from -Y direction
             * - All: Accepts both directions
             * - None: Disables Y-axis poke detection
             */
            this.acceptableYDirections = this.acceptableYDirections;
            /**
             * Controls from which directions a poke interaction can trigger this Interactable along the Z-axis:
             * - Front: Finger must approach from +Z direction.
             * - Back: Finger must approach from -Z direction.
             * - All: Accepts both directions.
             * - None: Disables Z-axis poke detection.
             */
            this.acceptableZDirections = this.acceptableZDirections;
            this.useFilteredPinch = this.useFilteredPinch;
            /**
             * Notifies the interactable that it is entering hover state
             * @param eventArgs - the interactor that is driving the event {@link Interactor}
             */
            this.hoverEnter = (eventArgs) => {
                this.eventHandler.hoverEnter(eventArgs);
            };
            /**
             * Notifies the interactable that it is still hovering
             * @param eventArgs - event parameters, with omitted interactable
             */
            this.hoverUpdate = (eventArgs) => {
                this.eventHandler.hoverUpdate(eventArgs);
            };
            /**
             * Notifies the interactable that it is exiting hover state
             * @param eventArgs - event parameters, with omitted interactable
             */
            this.hoverExit = (eventArgs) => {
                this.eventHandler.hoverExit(eventArgs);
            };
            /**
             * Notifies the interactable that it is entering trigger state
             * @param eventArgs - event parameters, with omitted interactable
             */
            this.triggerStart = (eventArgs) => {
                this.eventHandler.triggerStart(eventArgs);
            };
            /**
             * Notifies the interactable that it is still in a triggering state
             * @param eventArgs - event parameters, with omitted interactable
             */
            this.triggerUpdate = (eventArgs) => {
                this.eventHandler.triggerUpdate(eventArgs);
            };
            /**
             * Notifies the interactable that it is exiting trigger state while the interactor is hovering it
             * @param eventArgs - event parameters, with omitted interactable
             */
            this.triggerEnd = (eventArgs) => {
                this.eventHandler.triggerEnd(eventArgs);
            };
            /**
             * Notifies the interactable that it is exiting trigger state while the interactor is not hovering it.
             * @param eventArgs - event parameters, with omitted interactable
             */
            this.triggerEndOutside = (eventArgs) => {
                this.eventHandler.triggerEndOutside(eventArgs);
            };
            /**
             * Notifies the interactable that it is a cancelled state with the interactor
             * @param eventArgs - event parameters, with omitted interactable
             */
            this.triggerCanceled = (eventArgs) => {
                this.eventHandler.triggerCanceled(eventArgs);
            };
        }
        __initialize() {
            super.__initialize();
            // Events - these are the actual event emitters
            this.onHoverEnterEvent = new Event_1.default();
            this.onHoverUpdateEvent = new Event_1.default();
            this.onHoverExitEvent = new Event_1.default();
            this.onInteractorHoverEnterEvent = new Event_1.default();
            this.onInteractorHoverExitEvent = new Event_1.default();
            this.onTriggerStartEvent = new Event_1.default();
            this.onTriggerUpdateEvent = new Event_1.default();
            this.onTriggerEndEvent = new Event_1.default();
            this.onTriggerEndOutsideEvent = new Event_1.default();
            this.onInteractorTriggerStartEvent = new Event_1.default();
            this.onInteractorTriggerEndEvent = new Event_1.default();
            this.onInteractorTriggerEndOutsideEvent = new Event_1.default();
            this.onDragStartEvent = new Event_1.default();
            this.onDragUpdateEvent = new Event_1.default();
            this.onDragEndEvent = new Event_1.default();
            this.onTriggerCanceledEvent = new Event_1.default();
            this.onSyncHoverEnterEvent = new Event_1.default();
            this.onSyncHoverUpdateEvent = new Event_1.default();
            this.onSyncHoverExitEvent = new Event_1.default();
            this.onSyncInteractorHoverEnterEvent = new Event_1.default();
            this.onSyncInteractorHoverExitEvent = new Event_1.default();
            this.onSyncTriggerStartEvent = new Event_1.default();
            this.onSyncTriggerUpdateEvent = new Event_1.default();
            this.onSyncTriggerEndEvent = new Event_1.default();
            this.onSyncTriggerEndOutsideEvent = new Event_1.default();
            this.onSyncInteractorTriggerStartEvent = new Event_1.default();
            this.onSyncInteractorTriggerEndEvent = new Event_1.default();
            this.onSyncInteractorTriggerEndOutsideEvent = new Event_1.default();
            this.onSyncTriggerCanceledEvent = new Event_1.default();
            this.onSyncDragStartEvent = new Event_1.default();
            this.onSyncDragUpdateEvent = new Event_1.default();
            this.onSyncDragEndEvent = new Event_1.default();
            this.interactionConfigurationProvider = InteractionConfigurationProvider_1.InteractionConfigurationProvider.getInstance();
            this.syncKitBridge = SyncKitBridge_1.SyncKitBridge.getInstance();
            this.syncEntity = this.syncKitBridge.createSyncEntity(this);
            // Native Logging
            this.log = new NativeLogger_1.default(TAG);
            /**
             * The event handler that manages bitflags, compound events, and local/sync routing.
             */
            this.eventHandler = this.createEventHandler();
            /**
             * Called whenever the interactable enters the hovered state.
             */
            this.onHoverEnter = this.onHoverEnterEvent.publicApi();
            /**
             * Called whenever a new interactor hovers over this interactable.
             */
            this.onInteractorHoverEnter = this.onInteractorHoverEnterEvent.publicApi();
            /**
             * Called whenever an interactor remains hovering over this interactable.
             */
            this.onHoverUpdate = this.onHoverUpdateEvent.publicApi();
            /**
             *  Called whenever the interactable is no longer hovered.
             */
            this.onHoverExit = this.onHoverExitEvent.publicApi();
            /**
             * Called whenever an interactor exits hovering this interactable.
             */
            this.onInteractorHoverExit = this.onInteractorHoverExitEvent.publicApi();
            /**
             * Called whenever the interactable enters the triggered state.
             */
            this.onTriggerStart = this.onTriggerStartEvent.publicApi();
            /**
             * Called whenever an interactor triggers an interactable.
             */
            this.onInteractorTriggerStart = this.onInteractorTriggerStartEvent.publicApi();
            /**
             * Called whenever an interactor continues to trigger an interactable.
             */
            this.onTriggerUpdate = this.onTriggerUpdateEvent.publicApi();
            /**
             * Called whenever the interactable exits the triggered state while the interactor is hovering it.
             */
            this.onTriggerEnd = this.onTriggerEndEvent.publicApi();
            /**
             * Called whenever the interactable exits the triggered state while the interactor is not hovering it.
             */
            this.onTriggerEndOutside = this.onTriggerEndOutsideEvent.publicApi();
            /**
             * Called whenever an interactor is no longer triggering the interactable while the interactor is hovering it.
             */
            this.onInteractorTriggerEnd = this.onInteractorTriggerEndEvent.publicApi();
            /**
             * Called whenever an interactor is no longer triggering the interactable while the interactor is not hovering it.
             */
            this.onInteractorTriggerEndOutside = this.onInteractorTriggerEndOutsideEvent.publicApi();
            /**
             * Called whenever an interactor is lost and was in a down event with this interactable.
             */
            this.onTriggerCanceled = this.onTriggerCanceledEvent.publicApi();
            /**
             * Called when an interactor is in a down event with this interactable and
             * has moved a minimum drag distance.
             */
            this.onDragStart = this.onDragStartEvent.publicApi();
            /**
             * Called when an interactor is in a down event with this interactable and
             * is moving.
             */
            this.onDragUpdate = this.onDragUpdateEvent.publicApi();
            /**
             * Called when an interactor was in a down event with this interactable and
             * was dragging.
             */
            this.onDragEnd = this.onDragEndEvent.publicApi();
            /**
             * The following onSync events are only invoked when in a Connected Lens with SpectaclesSyncKit present.
             * If another connected user invokes an onHoverEnter event, the local user will see an onSyncHoverEvent.
             * These events are useful for simple feedback scripts to allow other users to understand when an Interactable
             * is being interacted with another user already.
             */
            /**
             * Called whenever the interactable enters the hovered state from another connection.
             */
            this.onSyncHoverEnter = this.onSyncHoverEnterEvent.publicApi();
            /**
             * Called whenever a new interactor hovers over this interactable from another connection.
             */
            this.onSyncInteractorHoverEnter = this.onSyncInteractorHoverEnterEvent.publicApi();
            /**
             * Called whenever an interactor remains hovering over this interactable from another connection.
             */
            this.onSyncHoverUpdate = this.onSyncHoverUpdateEvent.publicApi();
            /**
             *  Called whenever the interactable is no longer hovered from another connection.
             */
            this.onSyncHoverExit = this.onSyncHoverExitEvent.publicApi();
            /**
             * Called whenever an interactor exits hovering this interactable from another connection.
             */
            this.onSyncInteractorHoverExit = this.onSyncInteractorHoverExitEvent.publicApi();
            /**
             * Called whenever the interactable enters the triggered state from another connection.
             */
            this.onSyncTriggerStart = this.onSyncTriggerStartEvent.publicApi();
            /**
             * Called whenever an interactor triggers an interactable from another connection.
             */
            this.onSyncInteractorTriggerStart = this.onSyncInteractorTriggerStartEvent.publicApi();
            /**
             * Called whenever an interactor continues to trigger an interactable from another connection.
             */
            this.onSyncTriggerUpdate = this.onSyncTriggerUpdateEvent.publicApi();
            /**
             * Called whenever the interactable exits the triggered state while the interactor is hovering it from another connection.
             */
            this.onSyncTriggerEnd = this.onSyncTriggerEndEvent.publicApi();
            /**
             * Called whenever the interactable exits the triggered state while the interactor is not hovering it from another connection.
             */
            this.onSyncTriggerEndOutside = this.onSyncTriggerEndOutsideEvent.publicApi();
            /**
             * Called whenever an interactor is no longer triggering the interactable while the interactor is hovering it from another connection.
             */
            this.onSyncInteractorTriggerEnd = this.onSyncInteractorTriggerEndEvent.publicApi();
            /**
             * Called whenever an interactor is no longer triggering the interactable while the interactor is not hovering it from another connection.
             */
            this.onSyncInteractorTriggerEndOutside = this.onSyncInteractorTriggerEndOutsideEvent.publicApi();
            /**
             * Called whenever an interactor is lost and was in a down event with this interactable from another connection.
             */
            this.onSyncTriggerCanceled = this.onSyncTriggerCanceledEvent.publicApi();
            /**
             * Called when an interactor is in a down event with this interactable and
             * has moved a minimum drag distance from another connection.
             */
            this.onSyncDragStart = this.onSyncDragStartEvent.publicApi();
            /**
             * Called when an interactor is in a down event with this interactable and
             * is moving from another connection.
             */
            this.onSyncDragUpdate = this.onSyncDragUpdateEvent.publicApi();
            /**
             * Called when an interactor was in a down event with this interactable and
             * was dragging from another connection.
             */
            this.onSyncDragEnd = this.onSyncDragEndEvent.publicApi();
            /**
             * Provides all colliders associated with this Interactable.
             */
            this.colliders = [];
            this.targetingMode = this.targetingMode;
            /**
             * Sets the preferred targeting visual. (Requires the V2 Cursor to be enabled on InteractorCursors).
             * - 0: Cursor (default)
             * - 1: Ray
             * - 2: None
             */
            this.targetingVisual = this.targetingVisual;
            this.ignoreInteractionPlane = this.ignoreInteractionPlane;
            /**
             * Defines the singular source of truth for feedback + UI + cursor components to poll to check
             * if the Interactable should exhibit sticky behavior during trigger
             * (cursor locks on Interactable, remains in active visual state even after de-hovering).
             */
            this.keepHoverOnTrigger = this.keepHoverOnTrigger;
            /**
             * Enable this to allow the Interactable to instantly be dragged on trigger rather than obeying the Interactor's
             * drag threshold.
             */
            this.enableInstantDrag = this.enableInstantDrag;
            /**
             * A flag that enables scroll interactions when this element is interacted with. When true, interactions with this
             * element can scroll a parent ScrollView that has content extending beyond its visible bounds.
             */
            this.isScrollable = this.isScrollable;
            /**
             * Determines whether this Interactable can be simultaneously controlled by multiple Interactors. When false, only
             * one Interactor type (e.g., left hand or right hand) can interact with this Interactable at a time, and subsequent
             * interaction attempts from different Interactors will be blocked. Set to true to enable interactions from multiple
             * sources simultaneously, such as allowing both hands to manipulate the Interactable at once.
             */
            this.allowMultipleInteractors = this.allowMultipleInteractors;
            this.enablePokeDirectionality = this.enablePokeDirectionality;
            /**
             * Controls from which directions a poke interaction can trigger this Interactable along the X-axis:
             * - Left: Finger must approach from -X direction.
             * - Right: Finger must approach from +X direction.
             * - All: Accepts both directions.
             * - None: Disables X-axis poke detection.
             */
            this.acceptableXDirections = this.acceptableXDirections;
            /**
             * Controls from which directions a poke interaction can trigger this Interactable along the Y-axis:
             * - Top: Finger must approach from +Y direction
             * - Bottom: Finger must approach from -Y direction
             * - All: Accepts both directions
             * - None: Disables Y-axis poke detection
             */
            this.acceptableYDirections = this.acceptableYDirections;
            /**
             * Controls from which directions a poke interaction can trigger this Interactable along the Z-axis:
             * - Front: Finger must approach from +Z direction.
             * - Back: Finger must approach from -Z direction.
             * - All: Accepts both directions.
             * - None: Disables Z-axis poke detection.
             */
            this.acceptableZDirections = this.acceptableZDirections;
            this.useFilteredPinch = this.useFilteredPinch;
            /**
             * Notifies the interactable that it is entering hover state
             * @param eventArgs - the interactor that is driving the event {@link Interactor}
             */
            this.hoverEnter = (eventArgs) => {
                this.eventHandler.hoverEnter(eventArgs);
            };
            /**
             * Notifies the interactable that it is still hovering
             * @param eventArgs - event parameters, with omitted interactable
             */
            this.hoverUpdate = (eventArgs) => {
                this.eventHandler.hoverUpdate(eventArgs);
            };
            /**
             * Notifies the interactable that it is exiting hover state
             * @param eventArgs - event parameters, with omitted interactable
             */
            this.hoverExit = (eventArgs) => {
                this.eventHandler.hoverExit(eventArgs);
            };
            /**
             * Notifies the interactable that it is entering trigger state
             * @param eventArgs - event parameters, with omitted interactable
             */
            this.triggerStart = (eventArgs) => {
                this.eventHandler.triggerStart(eventArgs);
            };
            /**
             * Notifies the interactable that it is still in a triggering state
             * @param eventArgs - event parameters, with omitted interactable
             */
            this.triggerUpdate = (eventArgs) => {
                this.eventHandler.triggerUpdate(eventArgs);
            };
            /**
             * Notifies the interactable that it is exiting trigger state while the interactor is hovering it
             * @param eventArgs - event parameters, with omitted interactable
             */
            this.triggerEnd = (eventArgs) => {
                this.eventHandler.triggerEnd(eventArgs);
            };
            /**
             * Notifies the interactable that it is exiting trigger state while the interactor is not hovering it.
             * @param eventArgs - event parameters, with omitted interactable
             */
            this.triggerEndOutside = (eventArgs) => {
                this.eventHandler.triggerEndOutside(eventArgs);
            };
            /**
             * Notifies the interactable that it is a cancelled state with the interactor
             * @param eventArgs - event parameters, with omitted interactable
             */
            this.triggerCanceled = (eventArgs) => {
                this.eventHandler.triggerCanceled(eventArgs);
            };
        }
        onAwake() {
            this.createEvent("OnDestroyEvent").bind(() => this.release());
            this.createEvent("OnEnableEvent").bind(() => {
                this.enableColliders(true);
            });
            this.createEvent("OnDisableEvent").bind(() => {
                this.enableColliders(false);
            });
            InteractionManager_1.InteractionManager.getInstance().registerInteractable(this);
        }
        release() {
            InteractionManager_1.InteractionManager.getInstance().deregisterInteractable(this);
        }
        /**
         * Notifies the interactable that a drag has ended.
         *
         * Note: This public method exists to support the deprecated ScrollArea component,
         * which calls dragEnd directly during scroll event propagation.
         * Consider removing when ScrollArea/ScrollView is deprecated.
         *
         * @param eventArgs - event parameters, with omitted interactable
         */
        dragEnd(eventArgs) {
            const previousDragVector = eventArgs.interactor.previousDragVector;
            if (previousDragVector === null) {
                return;
            }
            const isLocalEvent = !eventArgs.connectionId || this.syncKitBridge.sessionController?.getLocalConnectionId() === eventArgs.connectionId;
            const event = isLocalEvent ? this.onDragEndEvent : this.onSyncDragEndEvent;
            event.invoke({
                ...eventArgs,
                interactable: this,
                dragVector: previousDragVector,
                planecastDragVector: eventArgs.interactor.planecastDragVector
            });
            this.log.v("InteractionEvent : " + "On Drag End Event");
        }
        /**
         * Returns the connection ID of the first triggering Interactor if in a Connected Lens.
         */
        get triggeringConnectionId() {
            return this.eventHandler.triggeringConnectionId;
        }
        /**
         * Interactors that are hovering this interactable
         */
        get hoveringInteractor() {
            return this.eventHandler.hoveringInteractor;
        }
        /**
         * Interactors that are triggering this interactable
         */
        get triggeringInteractor() {
            return this.eventHandler.triggeringInteractor;
        }
        /**
         * @returns if this Interactable is a descendant of the given Interactable.
         */
        isDescendantOf(interactable) {
            return (0, SceneObjectUtils_1.isDescendantOf)(this.sceneObject, interactable.sceneObject);
        }
        enableColliders(enable) {
            for (let i = 0; i < this.colliders.length; i++) {
                this.colliders[i].enabled = enable;
            }
        }
        createEventHandler() {
            return new InteractableEventHandler_1.InteractableEventHandler({
                // Local hover events
                onHoverEnter: (args) => {
                    this.onHoverEnterEvent.invoke({ ...args, interactable: this });
                    this.log.v("InteractionEvent : " + "On Hover Enter Event");
                },
                onInteractorHoverEnter: (args) => {
                    this.onInteractorHoverEnterEvent.invoke({ ...args, interactable: this });
                    this.log.v("InteractionEvent : " + "On Interactor Hover Enter Event");
                },
                onHoverUpdate: (args) => {
                    this.onHoverUpdateEvent.invoke({ ...args, interactable: this });
                },
                onInteractorHoverExit: (args) => {
                    this.onInteractorHoverExitEvent.invoke({ ...args, interactable: this });
                    this.log.v("InteractionEvent : " + "On Interactor Hover Exit Event");
                },
                onHoverExit: (args) => {
                    this.onHoverExitEvent.invoke({ ...args, interactable: this });
                    this.log.v("InteractionEvent : " + "On Hover Exit Event");
                },
                // Local trigger events
                onTriggerStart: (args) => {
                    this.onTriggerStartEvent.invoke({ ...args, interactable: this });
                    this.log.v("InteractionEvent : " + "On Trigger Start Event");
                },
                onInteractorTriggerStart: (args) => {
                    this.onInteractorTriggerStartEvent.invoke({ ...args, interactable: this });
                    this.log.v("InteractionEvent : " + "On Interactor Trigger Start Event");
                },
                onTriggerUpdate: (args) => {
                    this.onTriggerUpdateEvent.invoke({ ...args, interactable: this });
                },
                onInteractorTriggerEnd: (args) => {
                    this.onInteractorTriggerEndEvent.invoke({ ...args, interactable: this });
                    this.log.v("InteractionEvent : " + "On Interactor Trigger End Event");
                },
                onTriggerEnd: (args) => {
                    this.onTriggerEndEvent.invoke({ ...args, interactable: this });
                    this.log.v("InteractionEvent : " + "On Trigger End Event");
                },
                onInteractorTriggerEndOutside: (args) => {
                    this.onInteractorTriggerEndOutsideEvent.invoke({ ...args, interactable: this });
                    this.log.v("InteractionEvent : " + "On Interactor Trigger End Outside Event");
                },
                onTriggerEndOutside: (args) => {
                    this.onTriggerEndOutsideEvent.invoke({ ...args, interactable: this });
                    this.log.v("InteractionEvent : " + "On Trigger End Outside Event");
                },
                onTriggerCanceled: (args) => {
                    this.onTriggerCanceledEvent.invoke({ ...args, interactable: this });
                    this.log.v("InteractionEvent : " + "On Trigger Canceled Event");
                },
                // Drag events
                onDragStart: (args) => {
                    this.onDragStartEvent.invoke({
                        ...args,
                        interactable: this,
                        planecastDragVector: args.interactor.planecastDragVector
                    });
                    this.log.v("InteractionEvent : " + "On Drag Start Event");
                },
                onDragUpdate: (args) => {
                    this.onDragUpdateEvent.invoke({
                        ...args,
                        interactable: this,
                        planecastDragVector: args.interactor.planecastDragVector
                    });
                },
                onDragEnd: (args) => {
                    this.onDragEndEvent.invoke({
                        ...args,
                        interactable: this,
                        planecastDragVector: args.interactor.planecastDragVector
                    });
                    this.log.v("InteractionEvent : " + "On Drag End Event");
                },
                // Sync hover events
                onSyncHoverEnter: (args) => {
                    this.onSyncHoverEnterEvent.invoke({ ...args, interactable: this });
                },
                onSyncInteractorHoverEnter: (args) => {
                    this.onSyncInteractorHoverEnterEvent.invoke({ ...args, interactable: this });
                },
                onSyncHoverUpdate: (args) => {
                    this.onSyncHoverUpdateEvent.invoke({ ...args, interactable: this });
                },
                onSyncInteractorHoverExit: (args) => {
                    this.onSyncInteractorHoverExitEvent.invoke({ ...args, interactable: this });
                },
                onSyncHoverExit: (args) => {
                    this.onSyncHoverExitEvent.invoke({ ...args, interactable: this });
                },
                // Sync trigger events
                onSyncTriggerStart: (args) => {
                    this.onSyncTriggerStartEvent.invoke({ ...args, interactable: this });
                },
                onSyncInteractorTriggerStart: (args) => {
                    this.onSyncInteractorTriggerStartEvent.invoke({ ...args, interactable: this });
                },
                onSyncTriggerUpdate: (args) => {
                    this.onSyncTriggerUpdateEvent.invoke({ ...args, interactable: this });
                },
                onSyncInteractorTriggerEnd: (args) => {
                    this.onSyncInteractorTriggerEndEvent.invoke({ ...args, interactable: this });
                },
                onSyncTriggerEnd: (args) => {
                    this.onSyncTriggerEndEvent.invoke({ ...args, interactable: this });
                },
                onSyncInteractorTriggerEndOutside: (args) => {
                    this.onSyncInteractorTriggerEndOutsideEvent.invoke({ ...args, interactable: this });
                },
                onSyncTriggerEndOutside: (args) => {
                    this.onSyncTriggerEndOutsideEvent.invoke({ ...args, interactable: this });
                },
                onSyncTriggerCanceled: (args) => {
                    this.onSyncTriggerCanceledEvent.invoke({ ...args, interactable: this });
                },
                // Sync drag events
                onSyncDragStart: (args) => {
                    this.onSyncDragStartEvent.invoke({
                        ...args,
                        interactable: this,
                        planecastDragVector: args.interactor.planecastDragVector
                    });
                },
                onSyncDragUpdate: (args) => {
                    this.onSyncDragUpdateEvent.invoke({
                        ...args,
                        interactable: this,
                        planecastDragVector: args.interactor.planecastDragVector
                    });
                },
                onSyncDragEnd: (args) => {
                    this.onSyncDragEndEvent.invoke({
                        ...args,
                        interactable: this,
                        planecastDragVector: args.interactor.planecastDragVector
                    });
                }
            }, () => this.syncKitBridge.sessionController?.getLocalConnectionId() ?? null);
        }
    };
    __setFunctionName(_classThis, "Interactable");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        Interactable = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return Interactable = _classThis;
})();
exports.Interactable = Interactable;
//# sourceMappingURL=Interactable.js.map
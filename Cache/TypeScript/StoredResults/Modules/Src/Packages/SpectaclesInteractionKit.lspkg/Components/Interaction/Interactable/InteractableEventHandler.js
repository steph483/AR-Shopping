"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InteractableEventHandler = void 0;
const Interactor_1 = require("../../../Core/Interactor/Interactor");
/**
 * Manages the event handling logic for Interactables:
 * - Tracking which interactors are hovering/triggering (via bitflags)
 * - Determining compound events (first hover vs additional hover)
 * - Connection ID filtering for multi-user scenarios
 * - Local vs sync event routing
 *
 * The generic type T allows the full event args type to flow through
 * to callbacks while the handler only accesses the fields it needs.
 */
class InteractableEventHandler {
    constructor(callbacks, getLocalConnectionId) {
        this._hoveringInteractor = Interactor_1.InteractorInputType.None;
        this._triggeringInteractor = Interactor_1.InteractorInputType.None;
        this._triggeringConnectionId = null;
        this.callbacks = callbacks;
        this.getLocalConnectionId = getLocalConnectionId;
    }
    get hoveringInteractor() {
        return this._hoveringInteractor;
    }
    get triggeringInteractor() {
        return this._triggeringInteractor;
    }
    get triggeringConnectionId() {
        return this._triggeringConnectionId;
    }
    hoverEnter(eventArgs) {
        const isLocal = this.isLocalEvent(eventArgs);
        if (this._hoveringInteractor === Interactor_1.InteractorInputType.None) {
            ;
            (isLocal ? this.callbacks.onHoverEnter : this.callbacks.onSyncHoverEnter)(eventArgs);
        }
        this._hoveringInteractor |= eventArgs.interactor.inputType;
        (isLocal ? this.callbacks.onInteractorHoverEnter : this.callbacks.onSyncInteractorHoverEnter)(eventArgs);
    }
    hoverUpdate(eventArgs) {
        if (this._hoveringInteractor === Interactor_1.InteractorInputType.None) {
            return;
        }
        const isLocal = this.isLocalEvent(eventArgs);
        (isLocal ? this.callbacks.onHoverUpdate : this.callbacks.onSyncHoverUpdate)(eventArgs);
    }
    hoverExit(eventArgs) {
        this._hoveringInteractor &= ~eventArgs.interactor.inputType;
        const isLocal = this.isLocalEvent(eventArgs);
        (isLocal ? this.callbacks.onInteractorHoverExit : this.callbacks.onSyncInteractorHoverExit)(eventArgs);
        if (this._hoveringInteractor === Interactor_1.InteractorInputType.None) {
            ;
            (isLocal ? this.callbacks.onHoverExit : this.callbacks.onSyncHoverExit)(eventArgs);
        }
    }
    triggerStart(eventArgs) {
        // Lock to first triggering connection
        if (this._triggeringConnectionId === null) {
            this._triggeringConnectionId = eventArgs.connectionId ?? null;
        }
        else if (this._triggeringConnectionId !== eventArgs.connectionId) {
            return;
        }
        const isLocal = this.isLocalEvent(eventArgs);
        if (this._triggeringInteractor === Interactor_1.InteractorInputType.None) {
            ;
            (isLocal ? this.callbacks.onTriggerStart : this.callbacks.onSyncTriggerStart)(eventArgs);
        }
        this._triggeringInteractor |= eventArgs.interactor.inputType;
        (isLocal ? this.callbacks.onInteractorTriggerStart : this.callbacks.onSyncInteractorTriggerStart)(eventArgs);
    }
    triggerUpdate(eventArgs) {
        // Normalize connectionId to handle null vs undefined consistently
        const normalizedConnectionId = eventArgs.connectionId ?? null;
        if (this._triggeringConnectionId !== normalizedConnectionId) {
            return;
        }
        const isLocal = this.isLocalEvent(eventArgs);
        (isLocal ? this.callbacks.onTriggerUpdate : this.callbacks.onSyncTriggerUpdate)(eventArgs);
        this.dragStartOrUpdate(eventArgs);
    }
    triggerEnd(eventArgs) {
        if (!this.validateAndClearConnection(eventArgs)) {
            return;
        }
        this._triggeringInteractor &= ~eventArgs.interactor.inputType;
        const isLocal = this.isLocalEvent(eventArgs);
        (isLocal ? this.callbacks.onInteractorTriggerEnd : this.callbacks.onSyncInteractorTriggerEnd)(eventArgs);
        if (this._triggeringInteractor === Interactor_1.InteractorInputType.None) {
            ;
            (isLocal ? this.callbacks.onTriggerEnd : this.callbacks.onSyncTriggerEnd)(eventArgs);
        }
        this.dragEnd(eventArgs);
    }
    triggerEndOutside(eventArgs) {
        if (!this.validateAndClearConnection(eventArgs)) {
            return;
        }
        this._triggeringInteractor &= ~eventArgs.interactor.inputType;
        const isLocal = this.isLocalEvent(eventArgs);
        (isLocal ? this.callbacks.onInteractorTriggerEndOutside : this.callbacks.onSyncInteractorTriggerEndOutside)(eventArgs);
        if (this._triggeringInteractor === Interactor_1.InteractorInputType.None) {
            ;
            (isLocal ? this.callbacks.onTriggerEndOutside : this.callbacks.onSyncTriggerEndOutside)(eventArgs);
        }
        this.dragEnd(eventArgs);
    }
    triggerCanceled(eventArgs) {
        if (!this.validateAndClearConnection(eventArgs)) {
            return;
        }
        this._triggeringInteractor &= ~eventArgs.interactor.inputType;
        const isLocal = this.isLocalEvent(eventArgs);
        (isLocal ? this.callbacks.onTriggerCanceled : this.callbacks.onSyncTriggerCanceled)(eventArgs);
        this.dragEnd(eventArgs);
    }
    reset() {
        this._hoveringInteractor = Interactor_1.InteractorInputType.None;
        this._triggeringInteractor = Interactor_1.InteractorInputType.None;
        this._triggeringConnectionId = null;
    }
    /**
     * Validates connection ID matches and clears it. Returns false if validation fails.
     */
    validateAndClearConnection(eventArgs) {
        // Normalize connectionId to handle null vs undefined consistently
        const normalizedConnectionId = eventArgs.connectionId ?? null;
        if (this._triggeringConnectionId === normalizedConnectionId) {
            this._triggeringConnectionId = null;
            return true;
        }
        return false;
    }
    dragStartOrUpdate(eventArgs) {
        const currentDrag = eventArgs.interactor.currentDragVector;
        if (currentDrag === null) {
            return;
        }
        const isLocal = this.isLocalEvent(eventArgs);
        const dragArgs = { ...eventArgs, dragVector: currentDrag };
        if (eventArgs.interactor.previousDragVector === null) {
            ;
            (isLocal ? this.callbacks.onDragStart : this.callbacks.onSyncDragStart)(dragArgs);
        }
        else {
            ;
            (isLocal ? this.callbacks.onDragUpdate : this.callbacks.onSyncDragUpdate)(dragArgs);
        }
    }
    dragEnd(eventArgs) {
        const previousDrag = eventArgs.interactor.previousDragVector;
        if (previousDrag === null) {
            return;
        }
        const isLocal = this.isLocalEvent(eventArgs);
        (isLocal ? this.callbacks.onDragEnd : this.callbacks.onSyncDragEnd)({
            ...eventArgs,
            dragVector: previousDrag
        });
    }
    isLocalEvent(eventArgs) {
        const localId = this.getLocalConnectionId();
        return !eventArgs.connectionId || localId === eventArgs.connectionId;
    }
}
exports.InteractableEventHandler = InteractableEventHandler;
//# sourceMappingURL=InteractableEventHandler.js.map
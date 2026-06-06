"use strict";
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
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
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CameraCaptureToPlaceholder = void 0;
var __selfType = requireType("./CameraCaptureToPlaceholder");
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
const decorators_1 = require("SnapDecorators.lspkg/decorators");
const Logger_1 = require("Utilities.lspkg/Scripts/Utils/Logger");
const ValidationUtils_1 = require("Utilities.lspkg/Scripts/Utils/ValidationUtils");
let CameraCaptureToPlaceholder = (() => {
    let _classDecorators = [component];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseScriptComponent;
    let _instanceExtraInitializers = [];
    let _onStart_decorators;
    var CameraCaptureToPlaceholder = _classThis = class extends _classSuper {
        constructor() {
            super();
            this.cameraTexture = (__runInitializers(this, _instanceExtraInitializers), this.cameraTexture);
            this.placeholderImage = this.placeholderImage;
            this.captureButton = this.captureButton;
            this.enableLogging = this.enableLogging;
            this.enableLoggingLifecycle = this.enableLoggingLifecycle;
            this.isCapturing = false;
        }
        __initialize() {
            super.__initialize();
            this.cameraTexture = (__runInitializers(this, _instanceExtraInitializers), this.cameraTexture);
            this.placeholderImage = this.placeholderImage;
            this.captureButton = this.captureButton;
            this.enableLogging = this.enableLogging;
            this.enableLoggingLifecycle = this.enableLoggingLifecycle;
            this.isCapturing = false;
        }
        onAwake() {
            this.logger = new Logger_1.Logger("CameraCaptureToPlaceholder", this.enableLogging || this.enableLoggingLifecycle, true);
            if (this.enableLoggingLifecycle) {
                this.logger.debug("LIFECYCLE: onAwake()");
            }
        }
        onStart() {
            if (this.enableLoggingLifecycle) {
                this.logger.debug("LIFECYCLE: onStart()");
            }
            ValidationUtils_1.ValidationUtils.assertNotNull(this.cameraTexture, "Assign the CameraTexture component from CropCameraTextureTS");
            ValidationUtils_1.ValidationUtils.assertNotNull(this.placeholderImage, "Assign the placeholder Image");
            ValidationUtils_1.ValidationUtils.assertNotNull(this.captureButton, "Assign the RoundButton used to capture");
            const placeholderMaterial = this.placeholderImage.mainMaterial.clone();
            this.placeholderImage.mainMaterial = placeholderMaterial;
            this.placeholderPass = placeholderMaterial.mainPass;
            this.captureButton.onInitialized.add(() => {
                this.captureButton.onTriggerUp.add(() => {
                    this.captureStillFrame();
                });
            });
        }
        captureStillFrame() {
            if (this.isCapturing) {
                return;
            }
            this.isCapturing = true;
            try {
                const sourceTexture = this.cameraTexture.getCameraTexture();
                ValidationUtils_1.ValidationUtils.assertNotNull(sourceTexture, "Camera texture is not ready yet");
                const stillTexture = ProceduralTextureProvider.createFromTexture(sourceTexture);
                this.placeholderPass.baseTex = stillTexture;
                if (this.enableLogging) {
                    this.logger.success(`Captured ${stillTexture.getWidth()}x${stillTexture.getHeight()} still frame`);
                }
            }
            catch (error) {
                this.logger.error("Capture failed: " + error);
            }
            finally {
                this.isCapturing = false;
            }
        }
    };
    __setFunctionName(_classThis, "CameraCaptureToPlaceholder");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        _onStart_decorators = [decorators_1.bindStartEvent];
        __esDecorate(_classThis, null, _onStart_decorators, { kind: "method", name: "onStart", static: false, private: false, access: { has: obj => "onStart" in obj, get: obj => obj.onStart }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        CameraCaptureToPlaceholder = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return CameraCaptureToPlaceholder = _classThis;
})();
exports.CameraCaptureToPlaceholder = CameraCaptureToPlaceholder;
//# sourceMappingURL=CameraCaptureToPlaceholder.js.map
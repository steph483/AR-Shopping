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
exports.CameraTexture = void 0;
var __selfType = requireType("./CameraTexture");
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
/**
 * Specs Inc. 2026
 * Camera texture cropping utility that allows you to crop camera frames to specific regions.
 * Provides both cropped and original texture access with configurable crop boundaries.
 */
const decorators_1 = require("SnapDecorators.lspkg/decorators");
const Logger_1 = require("Utilities.lspkg/Scripts/Utils/Logger");
const ValidationUtils_1 = require("Utilities.lspkg/Scripts/Utils/ValidationUtils");
let CameraTexture = (() => {
    let _classDecorators = [component];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseScriptComponent;
    let _instanceExtraInitializers = [];
    let _initialize_decorators;
    var CameraTexture = _classThis = class extends _classSuper {
        constructor() {
            super();
            this.logger = __runInitializers(this, _instanceExtraInitializers);
            this.uiImage = this.uiImage;
            this.screenTexture = this.screenTexture;
            this.camModule = this.camModule;
            this.cropLeft = this.cropLeft;
            this.cropRight = this.cropRight;
            this.cropBottom = this.cropBottom;
            this.cropTop = this.cropTop;
            this.enableLogging = this.enableLogging;
            this.enableLoggingLifecycle = this.enableLoggingLifecycle;
        }
        __initialize() {
            super.__initialize();
            this.logger = __runInitializers(this, _instanceExtraInitializers);
            this.uiImage = this.uiImage;
            this.screenTexture = this.screenTexture;
            this.camModule = this.camModule;
            this.cropLeft = this.cropLeft;
            this.cropRight = this.cropRight;
            this.cropBottom = this.cropBottom;
            this.cropTop = this.cropTop;
            this.enableLogging = this.enableLogging;
            this.enableLoggingLifecycle = this.enableLoggingLifecycle;
        }
        /**
         * Returns the processed camera texture (always cropped if crop texture is available)
         * @returns The processed texture
         */
        getCameraTexture() {
            try {
                if (this.screenTexture && this.cameraTexture) {
                    const cropProvider = this.screenTexture.control;
                    if (!cropProvider) {
                        this.logger.warn("Crop texture has no control provider");
                        return this.cameraTexture;
                    }
                    ValidationUtils_1.ValidationUtils.ifExists(cropProvider.inputTexture, () => {
                        cropProvider.inputTexture = this.cameraTexture;
                    });
                    ValidationUtils_1.ValidationUtils.ifExists(cropProvider.cropRect, (rect) => {
                        rect.left = this.cropLeft;
                        rect.right = this.cropRight;
                        rect.bottom = this.cropBottom;
                        rect.top = this.cropTop;
                    });
                    return this.screenTexture;
                }
                return this.cameraTexture;
            }
            catch (error) {
                this.logger.error("Error in getCameraTexture: " + error);
                return this.cameraTexture;
            }
        }
        /**
         * Returns the original high-quality camera texture without cropping
         * @returns The original camera texture
         */
        getOriginalCameraTexture() {
            return this.cameraTexture;
        }
        /**
         * Called when component wakes up - initialize logger
         */
        onAwake() {
            const shouldLog = this.enableLogging || this.enableLoggingLifecycle;
            this.logger = new Logger_1.Logger("CameraTexture", shouldLog, true);
            if (this.enableLoggingLifecycle) {
                this.logger.header("CameraTexture Initialization");
                this.logger.debug("LIFECYCLE: onAwake() - Component waking up");
            }
        }
        /**
         * Called on the first frame when the scene starts
         * Automatically bound to OnStartEvent via SnapDecorators
         */
        initialize() {
            if (this.enableLoggingLifecycle) {
                this.logger.debug("LIFECYCLE: initialize() - Scene started");
            }
            this.setupCamera();
        }
        setupCamera() {
            try {
                if (this.enableLogging) {
                    this.logger.info("Starting camera setup");
                }
                ValidationUtils_1.ValidationUtils.assertNotNull(this.camModule, "Camera module not provided - please assign it in component settings");
                this.cameraRequest = CameraModule.createCameraRequest();
                if (this.enableLogging) {
                    this.logger.debug("Camera request created");
                }
                ValidationUtils_1.ValidationUtils.assertNotNull(this.cameraRequest, "Failed to create camera request");
                this.cameraRequest.cameraId = CameraModule.CameraId.Default_Color;
                const isEditor = global.deviceInfoSystem.isEditor();
                this.cameraRequest.imageSmallerDimension = isEditor ? 352 : 756;
                if (this.enableLogging) {
                    this.logger.debug(`Resolution: ${this.cameraRequest.imageSmallerDimension} (Editor: ${isEditor})`);
                }
                const camera = global.deviceInfoSystem.getTrackingCameraForId(CameraModule.CameraId.Default_Color);
                if (this.enableLogging) {
                    this.logger.debug(`Camera resolution: ${camera.resolution}`);
                }
                this.cameraTexture = this.camModule.requestCamera(this.cameraRequest);
                ValidationUtils_1.ValidationUtils.assertNotNull(this.cameraTexture, "Failed to get camera texture");
                this.cropProvider = this.screenTexture.control;
                ValidationUtils_1.ValidationUtils.ifExists(this.cropProvider?.inputTexture, () => {
                    this.cropProvider.inputTexture = this.cameraTexture;
                });
                const cameraControl = this.cameraTexture.control;
                ValidationUtils_1.ValidationUtils.ifExists(cameraControl?.onNewFrame, (onNewFrame) => {
                    onNewFrame.add(() => {
                        ValidationUtils_1.ValidationUtils.ifExists(this.uiImage, (img) => {
                            img.mainPass.baseTex = this.getCameraTexture();
                        });
                    });
                });
                ValidationUtils_1.ValidationUtils.ifExists(this.uiImage, (img) => {
                    img.mainPass.baseTex = this.getCameraTexture();
                });
                if (this.enableLogging) {
                    this.logger.success("Camera setup successful");
                }
            }
            catch (error) {
                this.logger.error(`Camera setup failed: ${error}\nStack: ${error.stack}`);
            }
        }
    };
    __setFunctionName(_classThis, "CameraTexture");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        _initialize_decorators = [decorators_1.bindStartEvent];
        __esDecorate(_classThis, null, _initialize_decorators, { kind: "method", name: "initialize", static: false, private: false, access: { has: obj => "initialize" in obj, get: obj => obj.initialize }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        CameraTexture = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return CameraTexture = _classThis;
})();
exports.CameraTexture = CameraTexture;
//# sourceMappingURL=CameraTexture.js.map
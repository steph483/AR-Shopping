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
exports.CameraCaptureToMobile = void 0;
var __selfType = requireType("./CameraCaptureToMobile");
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
const FoodDataStore_1 = require("./FoodDataStore");
const Logger_1 = require("Utilities.lspkg/Scripts/Utils/Logger");
const ValidationUtils_1 = require("Utilities.lspkg/Scripts/Utils/ValidationUtils");
let CameraCaptureToMobile = (() => {
    let _classDecorators = [component];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseScriptComponent;
    let _instanceExtraInitializers = [];
    let _onStart_decorators;
    var CameraCaptureToMobile = _classThis = class extends _classSuper {
        constructor() {
            super();
            this.cameraTexture = (__runInitializers(this, _instanceExtraInitializers), this.cameraTexture);
            this.liveFeedObject = this.liveFeedObject;
            this.reticleObject = this.reticleObject;
            this.placeholderImage = this.placeholderImage;
            this.captureButton = this.captureButton;
            this.logText = this.logText;
            this.resultPanelText = this.resultPanelText;
            this.showCapturePreviewOnGlasses = this.showCapturePreviewOnGlasses;
            this.cropHalfSize = this.cropHalfSize;
            this.cropHorizontalOffset = this.cropHorizontalOffset;
            this.useHighResStillCapture = this.useHighResStillCapture;
            this.encodeGrayscale = this.encodeGrayscale;
            this.maximumJpegQuality = this.maximumJpegQuality;
            this.enableLogging = this.enableLogging;
            this.enableLoggingLifecycle = this.enableLoggingLifecycle;
            this.camModule = require("LensStudio:CameraModule");
            this.module = require("LensStudio:SpectaclesMobileKitModule");
            this.placeholderPass = null;
            this.session = null;
            this.isSending = false;
            this.isEditor = global.deviceInfoSystem.isEditor();
            this.chunkSize = 2048;
        }
        __initialize() {
            super.__initialize();
            this.cameraTexture = (__runInitializers(this, _instanceExtraInitializers), this.cameraTexture);
            this.liveFeedObject = this.liveFeedObject;
            this.reticleObject = this.reticleObject;
            this.placeholderImage = this.placeholderImage;
            this.captureButton = this.captureButton;
            this.logText = this.logText;
            this.resultPanelText = this.resultPanelText;
            this.showCapturePreviewOnGlasses = this.showCapturePreviewOnGlasses;
            this.cropHalfSize = this.cropHalfSize;
            this.cropHorizontalOffset = this.cropHorizontalOffset;
            this.useHighResStillCapture = this.useHighResStillCapture;
            this.encodeGrayscale = this.encodeGrayscale;
            this.maximumJpegQuality = this.maximumJpegQuality;
            this.enableLogging = this.enableLogging;
            this.enableLoggingLifecycle = this.enableLoggingLifecycle;
            this.camModule = require("LensStudio:CameraModule");
            this.module = require("LensStudio:SpectaclesMobileKitModule");
            this.placeholderPass = null;
            this.session = null;
            this.isSending = false;
            this.isEditor = global.deviceInfoSystem.isEditor();
            this.chunkSize = 2048;
        }
        onAwake() {
            this.logger = new Logger_1.Logger("CameraCaptureToMobile", this.enableLogging || this.enableLoggingLifecycle, true);
            if (this.enableLoggingLifecycle) {
                this.logger.debug("LIFECYCLE: onAwake()");
            }
            if (this.isEditor) {
                this.createEvent("TouchStartEvent").bind(() => {
                    this.logger.info("Editor touch — capture and send");
                    this.onCaptureRequested();
                });
            }
        }
        async onStart() {
            if (this.enableLoggingLifecycle) {
                this.logger.debug("LIFECYCLE: onStart()");
            }
            ValidationUtils_1.ValidationUtils.assertNotNull(this.cameraTexture, "Assign the CameraTexture component from CropCameraTextureTS");
            ValidationUtils_1.ValidationUtils.assertNotNull(this.liveFeedObject, "Assign the live feed SceneObject (CaptureCropped)");
            ValidationUtils_1.ValidationUtils.assertNotNull(this.reticleObject, "Assign the reticle SceneObject (ScanReticle)");
            ValidationUtils_1.ValidationUtils.assertNotNull(this.captureButton, "Assign the RoundButton used to capture");
            ValidationUtils_1.ValidationUtils.assertNotNull(this.logText, "Assign the log Text (e.g. Test Log under Camera)");
            if (this.logText) {
                this.logText.text = "Camera Capture → Mobile:";
            }
            if (this.resultPanelText) {
                this.resultPanelText.text = "";
            }
            this.setupScanView();
            this.applyCaptureCrop();
            if (this.showCapturePreviewOnGlasses) {
                ValidationUtils_1.ValidationUtils.assertNotNull(this.placeholderImage, "Assign the placeholder Image when preview is enabled");
                const placeholderMaterial = this.placeholderImage.mainMaterial.clone();
                this.placeholderImage.mainMaterial = placeholderMaterial;
                this.placeholderPass = placeholderMaterial.mainPass;
            }
            this.captureButton.onInitialized.add(() => {
                this.captureButton.onTriggerUp.add(() => {
                    this.appendLine("RoundButton released");
                    this.onCaptureRequested();
                });
            });
            this.appendLine("Script started");
            this.startMobileSession();
        }
        setupScanView() {
            if (this.liveFeedObject) {
                this.liveFeedObject.enabled = false;
            }
            if (this.reticleObject) {
                this.reticleObject.enabled = true;
            }
            if (!this.showCapturePreviewOnGlasses && this.placeholderImage) {
                this.placeholderImage.getSceneObject().enabled = false;
            }
        }
        getCropRect() {
            const half = this.cropHalfSize;
            const shiftX = this.cropHorizontalOffset;
            return {
                left: -half + shiftX,
                right: half + shiftX,
                bottom: -half,
                top: half
            };
        }
        applyCaptureCrop() {
            const rect = this.getCropRect();
            this.cameraTexture.cropLeft = rect.left;
            this.cameraTexture.cropRight = rect.right;
            this.cameraTexture.cropBottom = rect.bottom;
            this.cameraTexture.cropTop = rect.top;
        }
        getCropScreenTexture() {
            const screenTexture = this.cameraTexture.screenTexture;
            ValidationUtils_1.ValidationUtils.assertNotNull(screenTexture, "CameraTexture has no screenTexture (Screen Crop Texture)");
            return screenTexture;
        }
        applyCropToTexture(source) {
            const cropTexture = this.getCropScreenTexture();
            const cropProvider = cropTexture.control;
            ValidationUtils_1.ValidationUtils.assertNotNull(cropProvider, "Screen crop texture has no RectCropTextureProvider");
            cropProvider.inputTexture = source;
            const rect = this.getCropRect();
            cropProvider.cropRect.left = rect.left;
            cropProvider.cropRect.right = rect.right;
            cropProvider.cropRect.bottom = rect.bottom;
            cropProvider.cropRect.top = rect.top;
            return cropTexture;
        }
        restoreStreamingCrop() {
            this.applyCaptureCrop();
            this.cameraTexture.getCameraTexture();
        }
        async captureHighResStill() {
            const imageRequest = CameraModule.createImageRequest();
            imageRequest.cameraId =
                CameraModule.CameraId.Default_Color;
            this.appendLine("Requesting high-res still (3200x2400)…");
            const imageFrame = await this.camModule.requestImage(imageRequest);
            const fullTexture = imageFrame.texture;
            ValidationUtils_1.ValidationUtils.assertNotNull(fullTexture, "High-res still returned no texture");
            this.appendLine(`Full still: ${fullTexture.getWidth()}x${fullTexture.getHeight()}`);
            return this.applyCropToTexture(fullTexture);
        }
        prepareBarcodeTexture(source) {
            if (!this.encodeGrayscale) {
                return ProceduralTextureProvider.createFromTexture(source);
            }
            const width = source.getWidth();
            const height = source.getHeight();
            const gray = new Uint8Array(width * height);
            TensorMath.textureToGrayscale(source, gray, new vec3(width, height, 1));
            const rgba = new Uint8Array(width * height * 4);
            for (let i = 0; i < gray.length; i++) {
                const value = gray[i];
                const offset = i * 4;
                rgba[offset] = value;
                rgba[offset + 1] = value;
                rgba[offset + 2] = value;
                rgba[offset + 3] = 255;
            }
            const grayTexture = ProceduralTextureProvider.createWithFormat(width, height, TextureFormat.RGBA8Unorm);
            const provider = grayTexture.control;
            provider.setPixels(0, 0, width, height, rgba);
            return grayTexture;
        }
        startMobileSession() {
            if (this.session) {
                try {
                    this.session.close();
                }
                catch (error) {
                    this.logger.info("Closing previous session: " + error);
                }
                this.session = null;
            }
            this.appendLine("Starting BLE session listener…");
            try {
                const session = this.module.createSession();
                this.session = session;
                session.onDisconnected.add(() => {
                    this.session = null;
                    this.appendLine("Disconnected — restarting listener…");
                    const restart = this.createEvent("DelayedCallbackEvent");
                    restart.bind(() => {
                        this.startMobileSession();
                    });
                    restart.reset(1);
                });
                session.onConnected.add(() => {
                    this.appendLine("Client connected");
                    this.appendLine("Press RoundButton to capture and send");
                });
                session.start();
                this.appendLine("Awaiting mobile connection…");
                this.appendLine("(Start Session in the iOS app while this lens is running)");
            }
            catch (error) {
                this.appendLine("Mobile Kit unavailable: " + error);
            }
        }
        onCaptureRequested() {
            if (this.isSending) {
                this.appendLine("Transfer in progress");
                return;
            }
            if (!this.session || !this.session.isConnected) {
                this.appendLine("Not connected to mobile app");
                return;
            }
            this.isSending = true;
            FoodDataStore_1.FoodDataStore.reset();
            this.setResultPanelText("");
            this.appendLine("Capturing…");
            this.captureAndSend();
        }
        async captureAndSend() {
            try {
                let sourceTexture;
                if (this.useHighResStillCapture && !this.isEditor) {
                    sourceTexture = await this.captureHighResStill();
                }
                else {
                    sourceTexture = this.cameraTexture.getCameraTexture();
                    ValidationUtils_1.ValidationUtils.assertNotNull(sourceTexture, "Camera texture is not ready yet");
                }
                const stillTexture = this.prepareBarcodeTexture(sourceTexture);
                this.restoreStreamingCrop();
                if (this.showCapturePreviewOnGlasses && this.placeholderPass) {
                    this.placeholderPass.baseTex = stillTexture;
                }
                this.appendLine(`Captured ${stillTexture.getWidth()}x${stillTexture.getHeight()}${this.encodeGrayscale ? " grayscale" : ""} still frame`);
                this.encodeAndSend(stillTexture);
            }
            catch (error) {
                this.appendLine("Capture failed: " + error);
                this.isSending = false;
            }
        }
        encodeAndSend(texture) {
            const session = this.session;
            const self = this;
            const quality = this.maximumJpegQuality
                ? CompressionQuality.MaximumQuality
                : CompressionQuality.HighQuality;
            Base64.encodeTextureAsync(texture, (base64) => {
                const mode = self.encodeGrayscale ? "grayscale JPEG" : "JPEG";
                self.appendLine(`Encoded ${mode} (${base64.length} base64 chars)`);
                self.sendBase64(session, base64);
            }, () => {
                self.appendLine("Image encode failed");
                self.isSending = false;
            }, quality, EncodingType.Jpg);
        }
        sendBase64(session, base64) {
            const self = this;
            const transferId = Date.now().toString() + "-" + Math.floor(Math.random() * 100000).toString();
            const chunks = [];
            let i = 0;
            while (i < base64.length) {
                chunks.push(base64.substring(i, i + this.chunkSize));
                i += this.chunkSize;
            }
            const startMsg = JSON.stringify({
                op: "img_start",
                id: transferId,
                total: chunks.length,
                bytes: base64.length
            });
            session
                .sendRequest(startMsg)
                .then((ack) => {
                self.appendLine(`img_start ack (${chunks.length} chunks, ${base64.length} bytes): ${ack}`);
                self.sendNextChunk(session, chunks, transferId, 0);
            })
                .catch((error) => {
                self.appendLine("img_start failed: " + error);
                self.isSending = false;
            });
        }
        sendNextChunk(session, chunks, transferId, index) {
            const self = this;
            if (index >= chunks.length) {
                session.sendData(JSON.stringify({ op: "img_end", id: transferId }));
                this.appendLine("Sent img_end — transfer complete");
                this.requestFoodLookup(session);
                return;
            }
            const chunkMsg = JSON.stringify({
                op: "img_chunk",
                id: transferId,
                i: index,
                data: chunks[index]
            });
            session
                .sendRequest(chunkMsg)
                .then((ack) => {
                self.appendLine(`Sent chunk ${index + 1}/${chunks.length} (ack: ${ack})`);
                self.sendNextChunk(session, chunks, transferId, index + 1);
            })
                .catch((error) => {
                self.appendLine("Chunk failed: " + error);
                self.isSending = false;
            });
        }
        requestFoodLookup(session) {
            const self = this;
            FoodDataStore_1.FoodDataStore.setLoading();
            this.setResultPanelText("Looking up...");
            this.appendLine("Requesting food lookup from mobile app…");
            const lookupMsg = JSON.stringify({ op: "food_lookup" });
            session
                .sendRequest(lookupMsg)
                .then((response) => {
                self.appendLine("Food lookup response received");
                FoodDataStore_1.FoodDataStore.applyFromJson(response);
                self.setResultPanelText(FoodDataStore_1.FoodDataStore.formatDisplayText());
                self.isSending = false;
            })
                .catch((error) => {
                FoodDataStore_1.FoodDataStore.status = "error";
                FoodDataStore_1.FoodDataStore.message = "Food lookup failed: " + error;
                self.setResultPanelText(FoodDataStore_1.FoodDataStore.message);
                self.appendLine(FoodDataStore_1.FoodDataStore.message);
                self.isSending = false;
            });
        }
        setResultPanelText(text) {
            if (this.resultPanelText) {
                this.resultPanelText.text = text;
            }
        }
        appendLine(txt) {
            print(txt);
            this.logger.info(txt);
            if (this.logText) {
                this.logText.text += "\n" + txt;
            }
        }
    };
    __setFunctionName(_classThis, "CameraCaptureToMobile");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        _onStart_decorators = [decorators_1.bindStartEvent];
        __esDecorate(_classThis, null, _onStart_decorators, { kind: "method", name: "onStart", static: false, private: false, access: { has: obj => "onStart" in obj, get: obj => obj.onStart }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        CameraCaptureToMobile = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return CameraCaptureToMobile = _classThis;
})();
exports.CameraCaptureToMobile = CameraCaptureToMobile;
//# sourceMappingURL=CameraCaptureToMobile.js.map
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
            this.placeholderImage = this.placeholderImage;
            this.captureButton = this.captureButton;
            this.logText = this.logText;
            this.enableLogging = this.enableLogging;
            this.enableLoggingLifecycle = this.enableLoggingLifecycle;
            this.module = require("LensStudio:SpectaclesMobileKitModule");
            this.session = null;
            this.isSending = false;
            this.isEditor = global.deviceInfoSystem.isEditor();
            this.chunkSize = 8192;
        }
        __initialize() {
            super.__initialize();
            this.cameraTexture = (__runInitializers(this, _instanceExtraInitializers), this.cameraTexture);
            this.placeholderImage = this.placeholderImage;
            this.captureButton = this.captureButton;
            this.logText = this.logText;
            this.enableLogging = this.enableLogging;
            this.enableLoggingLifecycle = this.enableLoggingLifecycle;
            this.module = require("LensStudio:SpectaclesMobileKitModule");
            this.session = null;
            this.isSending = false;
            this.isEditor = global.deviceInfoSystem.isEditor();
            this.chunkSize = 8192;
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
            ValidationUtils_1.ValidationUtils.assertNotNull(this.placeholderImage, "Assign the placeholder Image");
            ValidationUtils_1.ValidationUtils.assertNotNull(this.captureButton, "Assign the RoundButton used to capture");
            const placeholderMaterial = this.placeholderImage.mainMaterial.clone();
            this.placeholderImage.mainMaterial = placeholderMaterial;
            this.placeholderPass = placeholderMaterial.mainPass;
            this.captureButton.onInitialized.add(() => {
                this.captureButton.onTriggerUp.add(() => {
                    this.onCaptureRequested();
                });
            });
            this.appendLine("Awaiting mobile connection…");
            try {
                this.session = await this.createSessionAsync(() => {
                    this.session = null;
                    this.appendLine("Disconnected");
                });
                this.appendLine("Connected — press RoundButton to capture and send");
            }
            catch (error) {
                this.appendLine("Mobile Kit unavailable: " + error);
            }
        }
        createSessionAsync(onDisconnect) {
            return new Promise((resolve, reject) => {
                try {
                    const session = this.module.createSession();
                    session.onDisconnected.add(onDisconnect);
                    session.onConnected.add(() => {
                        resolve(session);
                    });
                    session.start();
                }
                catch (error) {
                    reject(error);
                }
            });
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
            this.appendLine("Capturing…");
            try {
                const sourceTexture = this.cameraTexture.getCameraTexture();
                ValidationUtils_1.ValidationUtils.assertNotNull(sourceTexture, "Camera texture is not ready yet");
                const stillTexture = ProceduralTextureProvider.createFromTexture(sourceTexture);
                this.placeholderPass.baseTex = stillTexture;
                if (this.enableLogging) {
                    this.logger.success(`Captured ${stillTexture.getWidth()}x${stillTexture.getHeight()} still frame`);
                }
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
            Base64.encodeTextureAsync(texture, (base64) => {
                self.sendBase64(session, base64);
            }, () => {
                self.appendLine("Image encode failed");
                self.isSending = false;
            }, CompressionQuality.IntermediateQuality, EncodingType.Jpg);
        }
        sendBase64(session, base64) {
            const transferId = Date.now().toString() + "-" + Math.floor(Math.random() * 100000).toString();
            const chunks = [];
            let i = 0;
            while (i < base64.length) {
                chunks.push(base64.substring(i, i + this.chunkSize));
                i += this.chunkSize;
            }
            session.sendData(JSON.stringify({
                op: "img_start",
                id: transferId,
                total: chunks.length,
                bytes: base64.length
            }));
            this.appendLine("Transfer " + transferId + ": " + chunks.length + " chunks");
            this.sendNextChunk(session, chunks, transferId, 0);
        }
        sendNextChunk(session, chunks, transferId, index) {
            const self = this;
            if (index >= chunks.length) {
                session.sendData(JSON.stringify({ op: "img_end", id: transferId }));
                this.appendLine("Transfer complete");
                this.isSending = false;
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
                .then(() => {
                if (self.enableLogging) {
                    self.logger.info("Sent chunk " + (index + 1) + "/" + chunks.length);
                }
                self.sendNextChunk(session, chunks, transferId, index + 1);
            })
                .catch((error) => {
                self.appendLine("Chunk failed: " + error);
                self.isSending = false;
            });
        }
        appendLine(txt) {
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
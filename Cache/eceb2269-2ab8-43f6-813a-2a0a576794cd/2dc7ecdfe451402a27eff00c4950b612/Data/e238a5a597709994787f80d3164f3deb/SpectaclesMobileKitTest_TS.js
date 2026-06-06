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
exports.SpectaclesMobileTest_TS = void 0;
var __selfType = requireType("./SpectaclesMobileKitTest_TS");
function component(target) { target.getTypeName = function () { return __selfType; }; }
/**
 * Specs Inc. 2026
 * Spectacles Mobile Test TS component for the Spectacles Mobile Kit Spectacles lens.
 */
const Logger_1 = require("Utilities.lspkg/Scripts/Utils/Logger");
const decorators_1 = require("SnapDecorators.lspkg/decorators");
let SpectaclesMobileTest_TS = (() => {
    let _classDecorators = [component];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseScriptComponent;
    let _instanceExtraInitializers = [];
    let _onStart_decorators;
    var SpectaclesMobileTest_TS = _classThis = class extends _classSuper {
        constructor() {
            super();
            this.resetAfterDelay = (__runInitializers(this, _instanceExtraInitializers), this.resetAfterDelay);
            this.image = this.image;
            this.gltfContainer = this.gltfContainer;
            this.gltfMaterial = this.gltfMaterial;
            this.logText = this.logText;
            this.enableLogging = this.enableLogging;
            this.enableLoggingLifecycle = this.enableLoggingLifecycle;
            this.module = require("LensStudio:SpectaclesMobileKitModule");
            this.internetModule = require("LensStudio:InternetModule");
            this.session = null;
        }
        __initialize() {
            super.__initialize();
            this.resetAfterDelay = (__runInitializers(this, _instanceExtraInitializers), this.resetAfterDelay);
            this.image = this.image;
            this.gltfContainer = this.gltfContainer;
            this.gltfMaterial = this.gltfMaterial;
            this.logText = this.logText;
            this.enableLogging = this.enableLogging;
            this.enableLoggingLifecycle = this.enableLoggingLifecycle;
            this.module = require("LensStudio:SpectaclesMobileKitModule");
            this.internetModule = require("LensStudio:InternetModule");
            this.session = null;
        }
        appendLine(txt) {
            this.logger.info(txt);
            if (this.logText) {
                this.logText.text += `\n${txt}`;
            }
        }
        async createSessionAsync(onDisconnect) {
            return new Promise((resolve, reject) => {
                const session = this.module.createSession();
                session.onDisconnected.add(onDisconnect);
                session.onConnected.add(() => {
                    resolve(session);
                });
                session.start();
            });
        }
        onAwake() {
            this.logger = new Logger_1.Logger("SpectaclesMobileTest_TS", this.enableLogging || this.enableLoggingLifecycle, true);
            if (this.enableLoggingLifecycle)
                this.logger.debug("LIFECYCLE: onAwake()");
        }
        async onStart() {
            if (this.enableLoggingLifecycle)
                this.logger.debug("LIFECYCLE: onStart()");
            this.image.mainMaterial = this.image.mainMaterial.clone();
            this.mainPass = this.image.mainPass;
            this.appendLine("Script Started");
            try {
                this.appendLine("Awaiting connection");
                if (this.resetAfterDelay) {
                    const delay = this.createEvent("DelayedCallbackEvent");
                    delay.bind(() => {
                        this.appendLine("Stopping the session");
                        if (this.session) {
                            this.session.close();
                            this.session = null;
                        }
                    });
                    delay.reset(10);
                }
                this.session = await this.createSessionAsync(() => {
                    this.appendLine("Disconnected");
                });
                const session = this.session;
                this.appendLine("Client Connected");
                // oneway, not expecting a response
                session.sendData("test data");
                this.appendLine("Sent data");
                // request-app-digest
                // This "app://digest" request is not sent to the mobile app for processing.
                // It is called to get the digest of the connected mobile app,
                // allowing the Lens to determine whether the connected app is trustworthy.
                try {
                    const response = await session.sendRequest("app://digest");
                    this.appendLine(`Digest: ${response}`);
                }
                catch (error) {
                    this.appendLine(`Error: ${error}`);
                }
                // request-response
                try {
                    const response = await session.sendRequest("echo me back");
                    this.appendLine(`Response: ${response}`);
                }
                catch (error) {
                    this.appendLine(`Error: ${error}`);
                }
                // subscribe to a topic
                const subscription = session.startSubscription("hello world times", (error) => {
                    this.appendLine(`Subscription error: ${error}`);
                });
                subscription.add((response) => {
                    this.appendLine(`Subscription response: ${response}`);
                });
                const textureId = "spectacleskit://test.png";
                const textureResource = this.internetModule.makeResourceFromUrl(textureId);
                this.appendLine(`Loading asset: ${textureId}`);
                const remoteMediaModule = require("LensStudio:RemoteMediaModule");
                remoteMediaModule.loadResourceAsImageTexture(textureResource, (texture) => {
                    this.appendLine("Texture loaded");
                    this.mainPass.baseTex = texture;
                }, (error) => {
                    this.appendLine(`Error loading asset: ${error}`);
                });
                const meshId = "spectacleskit://test.glb";
                const meshResource = this.internetModule.makeResourceFromUrl(meshId);
                this.appendLine(`Loading asset: ${meshId}`);
                remoteMediaModule.loadResourceAsGltfAsset(meshResource, (asset) => {
                    this.appendLine("Mesh loaded");
                    asset.tryInstantiate(this.gltfContainer, this.gltfMaterial);
                    // TODO: you can now find a new object in this.gltfContainer and change its textures
                }, (error) => {
                    this.appendLine(`Error loading asset: ${error}`);
                });
                // try other asset types:
                // remoteMediaModule.loadAsAnimatedTexture('spectacleskit://test_asset.gif', ( texture )=> {
                // remoteMediaModule.loadAsVideoTexture('spectacleskit://test_asset.webp', ( texture )=> {
                // remoteMediaModule.loadAsAudioTrackAsset('spectacleskit://test_asset.wav', ( asset )=> {
                // downloadAsset wouldn't work
                // it only supports assets compressed with our proprietary format
                // script.asset.downloadAsset(( asset )=> {
                // stop the subscription
                // session.stopSubscription(subscription)
            }
            catch (error) {
                this.appendLine(`Spectacles Kit is not available: ${error}`);
            }
        }
    };
    __setFunctionName(_classThis, "SpectaclesMobileTest_TS");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        _onStart_decorators = [decorators_1.bindStartEvent];
        __esDecorate(_classThis, null, _onStart_decorators, { kind: "method", name: "onStart", static: false, private: false, access: { has: obj => "onStart" in obj, get: obj => obj.onStart }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        SpectaclesMobileTest_TS = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return SpectaclesMobileTest_TS = _classThis;
})();
exports.SpectaclesMobileTest_TS = SpectaclesMobileTest_TS;
//# sourceMappingURL=SpectaclesMobileKitTest_TS.js.map
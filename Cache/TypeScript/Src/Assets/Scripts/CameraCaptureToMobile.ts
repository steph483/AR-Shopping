/**
 * Specs Inc. 2026
 * Captures a still frame from CropCameraTexture and sends it to the bonded mobile app over BLE.
 */
import { CameraTexture } from "CropCameraTexture.lspkg/Scripts/CameraTexture"
import { bindStartEvent } from "SnapDecorators.lspkg/decorators"
import { RoundButton } from "SpectaclesUIKit.lspkg/Scripts/Components/Button/RoundButton"
import { FoodDataStore } from "./FoodDataStore"
import { Logger } from "Utilities.lspkg/Scripts/Utils/Logger"
import { ValidationUtils } from "Utilities.lspkg/Scripts/Utils/ValidationUtils"

@component
export class CameraCaptureToMobile extends BaseScriptComponent {
  @ui.label('<span style="color: #60A5FA;">Camera Capture to Mobile</span><br/><span style="color: #94A3B8; font-size: 11px;">Press the RoundButton to capture a camera frame and send it to the bonded mobile app over BLE.</span>')
  @ui.separator

  @ui.label('<span style="color: #60A5FA;">Scene References</span>')
  @input
  @hint("CameraTexture component on your CropCameraTextureTS object (live glasses camera feed)")
  cameraTexture: CameraTexture

  @input
  @hint("SceneObject that displays the live camera feed (e.g. CaptureCropped). Shown while aiming; hidden after capture until RoundButton is pressed again.")
  liveFeedObject: SceneObject

  @input
  @hint("Head-locked reticle (child of Camera). Centered on capture region — e.g. ScanReticle")
  reticleObject: SceneObject

  @input
  @hint("Placeholder Image used only when showCapturePreviewOnGlasses is enabled")
  placeholderImage: Image

  @input
  @hint("RoundButton that triggers capture on release (trigger up)")
  captureButton: RoundButton

  @input
  @hint("Text component used to display connection and transfer logs on screen")
  logText: Text

  @input
  @hint("Blank panel text for food lookup results (debug). Wire a Text on your result panel.")
  resultPanelText: Text

  @ui.separator
  @ui.label('<span style="color: #60A5FA;">Scan View</span>')
  @input
  @hint("Show the captured still on glasses after each scan. Off sends to phone only.")
  showCapturePreviewOnGlasses: boolean = false

  @ui.separator
  @ui.label('<span style="color: #60A5FA;">Capture Region</span>')
  @input
  @hint("Send the full camera frame. Off uses the crop region below for live feed and capture.")
  useFullFrameCapture: boolean = true

  @input
  @hint("Half-size of the square crop region in normalized coords. Smaller = more zoom (0.22 ≈ 44% of frame). Ignored when useFullFrameCapture is on.")
  cropHalfSize: number = 0.22

  @input
  @hint("Shift capture region horizontally to match reticle. Ignored when useFullFrameCapture is on.")
  cropHorizontalOffset: number = 0.08

  @ui.separator
  @ui.label('<span style="color: #60A5FA;">Capture Quality</span>')
  @input
  @hint("Use CameraModule.requestImage for a 3200x2400 still. Much sharper than the live stream.")
  useHighResStillCapture: boolean = true

  @ui.separator
  @ui.label('<span style="color: #60A5FA;">Barcode Encode</span>')
  @input
  @hint("Convert to grayscale before JPEG encode. Smaller files, better for barcode scanning.")
  encodeGrayscale: boolean = true

  @input
  @hint("Use maximum JPEG quality (larger transfer, less compression grain). Off uses high quality.")
  maximumJpegQuality: boolean = false

  @ui.separator
  @ui.label('<span style="color: #60A5FA;">Logging</span>')
  @input
  @hint("Enable general logging")
  enableLogging: boolean = false

  @input
  @hint("Enable lifecycle logging (onAwake, onStart)")
  enableLoggingLifecycle: boolean = false

  private logger: Logger
  private camModule: CameraModule = require("LensStudio:CameraModule") as CameraModule
  private module = require("LensStudio:SpectaclesMobileKitModule")
  private placeholderPass: Pass | null = null
  private session: any = null
  private isSending = false
  private isAiming = true
  private isEditor = global.deviceInfoSystem.isEditor()
  private chunkSize = 2048

  onAwake(): void {
    this.logger = new Logger(
      "CameraCaptureToMobile",
      this.enableLogging || this.enableLoggingLifecycle,
      true
    )
    if (this.enableLoggingLifecycle) {
      this.logger.debug("LIFECYCLE: onAwake()")
    }

    if (this.isEditor) {
      this.createEvent("TouchStartEvent").bind(() => {
        this.logger.info("Editor touch — capture and send")
        this.onCaptureRequested()
      })
    }
  }

  @bindStartEvent
  async onStart(): Promise<void> {
    if (this.enableLoggingLifecycle) {
      this.logger.debug("LIFECYCLE: onStart()")
    }

    ValidationUtils.assertNotNull(this.cameraTexture, "Assign the CameraTexture component from CropCameraTextureTS")
    ValidationUtils.assertNotNull(this.liveFeedObject, "Assign the live feed SceneObject (CaptureCropped)")
    ValidationUtils.assertNotNull(this.reticleObject, "Assign the reticle SceneObject (ScanReticle)")
    ValidationUtils.assertNotNull(this.captureButton, "Assign the RoundButton used to capture")
    ValidationUtils.assertNotNull(this.logText, "Assign the log Text (e.g. Test Log under Camera)")

    if (this.logText) {
      this.logText.text = "Camera Capture → Mobile:"
    }

    if (this.resultPanelText) {
      this.resultPanelText.text = ""
    }

    this.setupScanView()
    this.applyCaptureCrop()

    if (this.showCapturePreviewOnGlasses) {
      ValidationUtils.assertNotNull(this.placeholderImage, "Assign the placeholder Image when preview is enabled")
      const placeholderMaterial = this.placeholderImage.mainMaterial.clone()
      this.placeholderImage.mainMaterial = placeholderMaterial
      this.placeholderPass = placeholderMaterial.mainPass
    }

    this.captureButton.onInitialized.add(() => {
      this.captureButton.onTriggerUp.add(() => {
        this.appendLine("RoundButton released")
        this.onCaptureRequested()
      })
    })

    this.appendLine("Script started")
    this.startMobileSession()
  }

  private setupScanView(): void {
    this.setAimingMode(true)
    if (!this.showCapturePreviewOnGlasses && this.placeholderImage) {
      this.placeholderImage.getSceneObject().enabled = false
    }
  }

  private setAimingMode(aiming: boolean): void {
    this.isAiming = aiming
    if (this.liveFeedObject) {
      this.liveFeedObject.enabled = aiming
    }
    if (this.reticleObject) {
      this.reticleObject.enabled = aiming
    }
  }

  private getCropRect(): { left: number; right: number; bottom: number; top: number } {
    if (this.useFullFrameCapture) {
      return { left: -1, right: 1, bottom: -1, top: 1 }
    }

    const half = this.cropHalfSize
    const shiftX = this.cropHorizontalOffset
    return {
      left: -half + shiftX,
      right: half + shiftX,
      bottom: -half,
      top: half
    }
  }

  private applyCaptureCrop(): void {
    const rect = this.getCropRect()
    this.cameraTexture.cropLeft = rect.left
    this.cameraTexture.cropRight = rect.right
    this.cameraTexture.cropBottom = rect.bottom
    this.cameraTexture.cropTop = rect.top
  }

  private getCropScreenTexture(): Texture {
    const screenTexture = (this.cameraTexture as { screenTexture?: Texture }).screenTexture
    ValidationUtils.assertNotNull(screenTexture, "CameraTexture has no screenTexture (Screen Crop Texture)")
    return screenTexture
  }

  private applyCropToTexture(source: Texture): Texture {
    const cropTexture = this.getCropScreenTexture()
    const cropProvider = cropTexture.control as RectCropTextureProvider
    ValidationUtils.assertNotNull(cropProvider, "Screen crop texture has no RectCropTextureProvider")

    cropProvider.inputTexture = source
    const rect = this.getCropRect()
    cropProvider.cropRect.left = rect.left
    cropProvider.cropRect.right = rect.right
    cropProvider.cropRect.bottom = rect.bottom
    cropProvider.cropRect.top = rect.top

    return cropTexture
  }

  private restoreStreamingCrop(): void {
    this.applyCaptureCrop()
    this.cameraTexture.getCameraTexture()
  }

  private async captureHighResStill(): Promise<Texture> {
    const imageRequest = CameraModule.createImageRequest()
    ;(imageRequest as { cameraId?: CameraModule.CameraId }).cameraId =
      CameraModule.CameraId.Default_Color

    this.appendLine("Requesting high-res still (3200x2400)…")
    const imageFrame = await this.camModule.requestImage(imageRequest)
    const fullTexture = imageFrame.texture
    ValidationUtils.assertNotNull(fullTexture, "High-res still returned no texture")

    this.appendLine(`Full still: ${fullTexture.getWidth()}x${fullTexture.getHeight()}`)
    if (this.useFullFrameCapture) {
      return fullTexture
    }
    return this.applyCropToTexture(fullTexture)
  }

  private prepareBarcodeTexture(source: Texture): Texture {
    if (!this.encodeGrayscale) {
      return ProceduralTextureProvider.createFromTexture(source)
    }

    const width = source.getWidth()
    const height = source.getHeight()
    const gray = new Uint8Array(width * height)
    TensorMath.textureToGrayscale(source, gray, new vec3(width, height, 1))

    const rgba = new Uint8Array(width * height * 4)
    for (let i = 0; i < gray.length; i++) {
      const value = gray[i]
      const offset = i * 4
      rgba[offset] = value
      rgba[offset + 1] = value
      rgba[offset + 2] = value
      rgba[offset + 3] = 255
    }

    const grayTexture = ProceduralTextureProvider.createWithFormat(
      width,
      height,
      TextureFormat.RGBA8Unorm
    )
    const provider = grayTexture.control as ProceduralTextureProvider
    provider.setPixels(0, 0, width, height, rgba)
    return grayTexture
  }

  private startMobileSession(): void {
    if (this.session) {
      try {
        this.session.close()
      } catch (error) {
        this.logger.info("Closing previous session: " + error)
      }
      this.session = null
    }

    this.appendLine("Starting BLE session listener…")

    try {
      const session = this.module.createSession()
      this.session = session

      session.onDisconnected.add(() => {
        this.session = null
        this.appendLine("Disconnected — restarting listener…")
        const restart = this.createEvent("DelayedCallbackEvent")
        restart.bind(() => {
          this.startMobileSession()
        })
        restart.reset(1)
      })

      session.onConnected.add(() => {
        this.appendLine("Client connected")
        this.appendLine("Press RoundButton to capture and send")
      })

      session.start()
      this.appendLine("Awaiting mobile connection…")
      this.appendLine("(Start Session in the iOS app while this lens is running)")
    } catch (error) {
      this.appendLine("Mobile Kit unavailable: " + error)
    }
  }

  private onCaptureRequested(): void {
    if (this.isSending) {
      this.appendLine("Transfer in progress")
      return
    }

    if (!this.isAiming) {
      FoodDataStore.reset()
      this.setResultPanelText("")
      this.setAimingMode(true)
      this.appendLine("Live feed restored — aim at barcode and press again to capture")
      return
    }

    if (!this.session || !this.session.isConnected) {
      this.appendLine("Not connected to mobile app")
      return
    }

    this.setAimingMode(false)
    this.isSending = true
    this.appendLine("Capturing…")
    this.captureAndSend()
  }

  private async captureAndSend(): Promise<void> {
    try {
      let sourceTexture: Texture

      if (this.useHighResStillCapture && !this.isEditor) {
        sourceTexture = await this.captureHighResStill()
      } else {
        sourceTexture = this.useFullFrameCapture
          ? this.cameraTexture.getOriginalCameraTexture()
          : this.cameraTexture.getCameraTexture()
        ValidationUtils.assertNotNull(sourceTexture, "Camera texture is not ready yet")
      }

      const stillTexture = this.prepareBarcodeTexture(sourceTexture)
      this.restoreStreamingCrop()

      if (this.showCapturePreviewOnGlasses && this.placeholderPass) {
        this.placeholderPass.baseTex = stillTexture
      }

      this.appendLine(
        `Captured ${stillTexture.getWidth()}x${stillTexture.getHeight()}${this.useFullFrameCapture ? " full frame" : " cropped"}${this.encodeGrayscale ? " grayscale" : ""} still frame`
      )

      this.encodeAndSend(stillTexture)
    } catch (error) {
      this.appendLine("Capture failed: " + error)
      this.isSending = false
      this.setAimingMode(true)
    }
  }

  private encodeAndSend(texture: Texture): void {
    const session = this.session
    const self = this
    const quality = this.maximumJpegQuality
      ? CompressionQuality.MaximumQuality
      : CompressionQuality.HighQuality

    Base64.encodeTextureAsync(
      texture,
      (base64: string) => {
        const mode = self.encodeGrayscale ? "grayscale JPEG" : "JPEG"
        self.appendLine(`Encoded ${mode} (${base64.length} base64 chars)`)
        self.sendBase64(session, base64)
      },
      () => {
        self.appendLine("Image encode failed")
        self.isSending = false
        self.setAimingMode(true)
      },
      quality,
      EncodingType.Jpg
    )
  }

  private sendBase64(session: any, base64: string): void {
    const self = this
    const transferId = Date.now().toString() + "-" + Math.floor(Math.random() * 100000).toString()
    const chunks: string[] = []
    let i = 0
    while (i < base64.length) {
      chunks.push(base64.substring(i, i + this.chunkSize))
      i += this.chunkSize
    }

    const startMsg = JSON.stringify({
      op: "img_start",
      id: transferId,
      total: chunks.length,
      bytes: base64.length
    })

    session
      .sendRequest(startMsg)
      .then((ack: string) => {
        self.appendLine(`img_start ack (${chunks.length} chunks, ${base64.length} bytes): ${ack}`)
        self.sendNextChunk(session, chunks, transferId, 0)
      })
      .catch((error: string) => {
        self.appendLine("img_start failed: " + error)
        self.isSending = false
        self.setAimingMode(true)
      })
  }

  private sendNextChunk(session: any, chunks: string[], transferId: string, index: number): void {
    const self = this
    if (index >= chunks.length) {
      session.sendData(JSON.stringify({ op: "img_end", id: transferId }))
      this.appendLine("Sent img_end — transfer complete")
      this.requestFoodLookup(session)
      return
    }

    const chunkMsg = JSON.stringify({
      op: "img_chunk",
      id: transferId,
      i: index,
      data: chunks[index]
    })

    session
      .sendRequest(chunkMsg)
      .then((ack: string) => {
        self.appendLine(`Sent chunk ${index + 1}/${chunks.length} (ack: ${ack})`)
        self.sendNextChunk(session, chunks, transferId, index + 1)
      })
      .catch((error: string) => {
        self.appendLine("Chunk failed: " + error)
        self.isSending = false
        self.setAimingMode(true)
      })
  }

  private requestFoodLookup(session: any): void {
    const self = this
    FoodDataStore.setLoading()
    this.setResultPanelText("Looking up...")
    this.appendLine("Requesting food lookup from mobile app…")

    const lookupMsg = JSON.stringify({ op: "food_lookup" })

    session
      .sendRequest(lookupMsg)
      .then((response: string) => {
        self.appendLine("Food lookup response received")
        FoodDataStore.applyFromJson(response)
        self.setResultPanelText(FoodDataStore.formatDisplayText())
        self.isSending = false
      })
      .catch((error: string) => {
        FoodDataStore.status = "error"
        FoodDataStore.message = "Food lookup failed: " + error
        self.setResultPanelText(FoodDataStore.message)
        self.appendLine(FoodDataStore.message)
        self.isSending = false
      })
  }

  private setResultPanelText(text: string): void {
    if (this.resultPanelText) {
      this.resultPanelText.text = text
    }
  }

  private appendLine(txt: string): void {
    print(txt)
    this.logger.info(txt)
    if (this.logText) {
      this.logText.text += "\n" + txt
    }
  }
}

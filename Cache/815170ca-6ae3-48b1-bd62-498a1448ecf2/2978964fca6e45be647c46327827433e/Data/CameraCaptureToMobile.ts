/**
 * Specs Inc. 2026
 * Captures a still frame from CropCameraTexture and sends it to the bonded mobile app over BLE.
 */
import { CameraTexture } from "CropCameraTexture.lspkg/Scripts/CameraTexture"
import { bindStartEvent } from "SnapDecorators.lspkg/decorators"
import { RoundButton } from "SpectaclesUIKit.lspkg/Scripts/Components/Button/RoundButton"
import { Logger } from "Utilities.lspkg/Scripts/Utils/Logger"
import { ValidationUtils } from "Utilities.lspkg/Scripts/Utils/ValidationUtils"

@component
export class CameraCaptureToMobile extends BaseScriptComponent {
  @ui.label('<span style="color: #60A5FA;">Camera Capture to Mobile</span><br/><span style="color: #94A3B8; font-size: 11px;">Press the RoundButton to capture a cropped camera frame and send it to the bonded mobile app over BLE.</span>')
  @ui.separator

  @ui.label('<span style="color: #60A5FA;">Scene References</span>')
  @input
  @hint("CameraTexture component on your CropCameraTextureTS object (live glasses camera feed)")
  cameraTexture: CameraTexture

  @input
  @hint("Placeholder Image that will show the captured still frame")
  placeholderImage: Image

  @input
  @hint("RoundButton that triggers capture on release (trigger up)")
  captureButton: RoundButton

  @input
  @hint("Text component used to display connection and transfer logs on screen")
  logText: Text

  @ui.separator
  @ui.label('<span style="color: #60A5FA;">Logging</span>')
  @input
  @hint("Enable general logging")
  enableLogging: boolean = false

  @input
  @hint("Enable lifecycle logging (onAwake, onStart)")
  enableLoggingLifecycle: boolean = false

  private logger: Logger
  private module = require("LensStudio:SpectaclesMobileKitModule")
  private placeholderPass: Pass
  private session: any = null
  private isSending = false
  private isEditor = global.deviceInfoSystem.isEditor()
  private chunkSize = 8192

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
    ValidationUtils.assertNotNull(this.placeholderImage, "Assign the placeholder Image")
    ValidationUtils.assertNotNull(this.captureButton, "Assign the RoundButton used to capture")

    const placeholderMaterial = this.placeholderImage.mainMaterial.clone()
    this.placeholderImage.mainMaterial = placeholderMaterial
    this.placeholderPass = placeholderMaterial.mainPass

    this.captureButton.onInitialized.add(() => {
      this.captureButton.onTriggerUp.add(() => {
        this.onCaptureRequested()
      })
    })

    this.appendLine("Awaiting mobile connection…")

    try {
      this.session = await this.createSessionAsync(() => {
        this.session = null
        this.appendLine("Disconnected")
      })
      this.appendLine("Connected — press RoundButton to capture and send")
    } catch (error) {
      this.appendLine("Mobile Kit unavailable: " + error)
    }
  }

  private createSessionAsync(onDisconnect: () => void): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        const session = this.module.createSession()
        session.onDisconnected.add(onDisconnect)
        session.onConnected.add(() => {
          resolve(session)
        })
        session.start()
      } catch (error) {
        reject(error)
      }
    })
  }

  private onCaptureRequested(): void {
    if (this.isSending) {
      this.appendLine("Transfer in progress")
      return
    }

    if (!this.session || !this.session.isConnected) {
      this.appendLine("Not connected to mobile app")
      return
    }

    this.isSending = true
    this.appendLine("Capturing…")

    try {
      const sourceTexture = this.cameraTexture.getCameraTexture()
      ValidationUtils.assertNotNull(sourceTexture, "Camera texture is not ready yet")

      const stillTexture = ProceduralTextureProvider.createFromTexture(sourceTexture)
      this.placeholderPass.baseTex = stillTexture

      if (this.enableLogging) {
        this.logger.success(
          `Captured ${stillTexture.getWidth()}x${stillTexture.getHeight()} still frame`
        )
      }

      this.encodeAndSend(stillTexture)
    } catch (error) {
      this.appendLine("Capture failed: " + error)
      this.isSending = false
    }
  }

  private encodeAndSend(texture: Texture): void {
    const session = this.session
    const self = this

    Base64.encodeTextureAsync(
      texture,
      (base64: string) => {
        self.sendBase64(session, base64)
      },
      () => {
        self.appendLine("Image encode failed")
        self.isSending = false
      },
      CompressionQuality.IntermediateQuality,
      EncodingType.Jpg
    )
  }

  private sendBase64(session: any, base64: string): void {
    const transferId = Date.now().toString() + "-" + Math.floor(Math.random() * 100000).toString()
    const chunks: string[] = []
    let i = 0
    while (i < base64.length) {
      chunks.push(base64.substring(i, i + this.chunkSize))
      i += this.chunkSize
    }

    session.sendData(
      JSON.stringify({
        op: "img_start",
        id: transferId,
        total: chunks.length,
        bytes: base64.length
      })
    )
    this.appendLine("Transfer " + transferId + ": " + chunks.length + " chunks")
    this.sendNextChunk(session, chunks, transferId, 0)
  }

  private sendNextChunk(session: any, chunks: string[], transferId: string, index: number): void {
    const self = this
    if (index >= chunks.length) {
      session.sendData(JSON.stringify({ op: "img_end", id: transferId }))
      this.appendLine("Transfer complete")
      this.isSending = false
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
      .then(() => {
        if (self.enableLogging) {
          self.logger.info("Sent chunk " + (index + 1) + "/" + chunks.length)
        }
        self.sendNextChunk(session, chunks, transferId, index + 1)
      })
      .catch((error: string) => {
        self.appendLine("Chunk failed: " + error)
        self.isSending = false
      })
  }

  private appendLine(txt: string): void {
    this.logger.info(txt)
    if (this.logText) {
      this.logText.text += "\n" + txt
    }
  }
}

/**
 * Specs Inc. 2026
 * Captures a still frame from the CropCameraTexture feed and applies it to a placeholder Image.
 */
import { CameraTexture } from "CropCameraTexture.lspkg/Scripts/CameraTexture"
import { bindStartEvent } from "SnapDecorators.lspkg/decorators"
import { RoundButton } from "SpectaclesUIKit.lspkg/Scripts/Components/Button/RoundButton"
import { Logger } from "Utilities.lspkg/Scripts/Utils/Logger"
import { ValidationUtils } from "Utilities.lspkg/Scripts/Utils/ValidationUtils"

@component
export class CameraCaptureToPlaceholder extends BaseScriptComponent {
  @ui.label('<span style="color: #60A5FA;">Camera Capture to Placeholder</span><br/><span style="color: #94A3B8; font-size: 11px;">Press the RoundButton to freeze the current cropped camera frame onto the placeholder image.</span>')
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

  @ui.separator
  @ui.label('<span style="color: #60A5FA;">Logging</span>')
  @input
  @hint("Enable general logging")
  enableLogging: boolean = false

  @input
  @hint("Enable lifecycle logging (onAwake, onStart)")
  enableLoggingLifecycle: boolean = false

  private logger: Logger
  private placeholderPass: Pass
  private isCapturing = false

  onAwake(): void {
    this.logger = new Logger(
      "CameraCaptureToPlaceholder",
      this.enableLogging || this.enableLoggingLifecycle,
      true
    )
    if (this.enableLoggingLifecycle) {
      this.logger.debug("LIFECYCLE: onAwake()")
    }
  }

  @bindStartEvent
  onStart(): void {
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
        this.captureStillFrame()
      })
    })
  }

  private captureStillFrame(): void {
    if (this.isCapturing) {
      return
    }
    this.isCapturing = true

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
    } catch (error) {
      this.logger.error("Capture failed: " + error)
    } finally {
      this.isCapturing = false
    }
  }
}

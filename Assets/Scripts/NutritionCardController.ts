import {FoodDataStore} from "./FoodDataStore"

@component
export class NutritionCardController extends BaseScriptComponent {
  @input("SceneObject")
  @hint("Parent object for the whole nutrition card")
  private cardRoot: SceneObject

  @input("Component.Text")
  private statusText: Text

  @input("Component.Text")
  private productNameText: Text

  @input("Component.Text")
  private brandText: Text

  @input("Component.Text")
  private caloriesText: Text

  @input("Component.Text")
  private proteinText: Text

  @input("Component.Text")
  private carbsText: Text

  @input("Component.Text")
  private fatText: Text

  @input("Component.Text")
  private barcodeText: Text

  @input("SceneObject")
  private caloriesBar: SceneObject

  @input("SceneObject")
  private proteinBar: SceneObject

  @input("SceneObject")
  private carbsBar: SceneObject

  @input("SceneObject")
  private fatBar: SceneObject

  private lastStatus: string = ""
  private originalScales = new Map<SceneObject, vec3>()

  public onAwake() {
    this.createEvent("OnStartEvent").bind(() => {
      this.storeOriginalBarScales()
      this.refreshUI()
    })

    this.createEvent("UpdateEvent").bind(() => {
      this.checkForUpdates()
    })
  }

  private checkForUpdates(): void {
    if (FoodDataStore.status === this.lastStatus && FoodDataStore.status !== "ok") {
      return
    }

    this.lastStatus = FoodDataStore.status
    this.refreshUI()
  }

  private refreshUI(): void {
    switch (FoodDataStore.status) {
      case "idle":
        if (this.cardRoot) {
          this.cardRoot.enabled = false
        }
        break

      case "loading":
        if (this.cardRoot) {
          this.cardRoot.enabled = true
        }

        if (this.statusText) {
          this.statusText.text = "Looking up..."
        }

        this.clearProductText()
        this.setAllBarsEmpty()
        break

      case "error":
        if (this.cardRoot) {
          this.cardRoot.enabled = true
        }

        if (this.statusText) {
          this.statusText.text = FoodDataStore.message
        }

        this.clearProductText()
        this.setAllBarsEmpty()
        break

      case "ok":
        if (this.cardRoot) {
          this.cardRoot.enabled = true
        }

        if (this.statusText) {
          this.statusText.text = "Nutrition per 100g"
        }

        if (this.productNameText) {
          this.productNameText.text = FoodDataStore.productName
        }

        if (this.brandText) {
          this.brandText.text = FoodDataStore.brand
        }

        if (this.caloriesText) {
          this.caloriesText.text = FoodDataStore.calories.toString() + " kcal"
        }

        if (this.proteinText) {
          this.proteinText.text = FoodDataStore.protein.toString() + " g"
        }

        if (this.carbsText) {
          this.carbsText.text = FoodDataStore.carbs.toString() + " g"
        }

        if (this.fatText) {
          this.fatText.text = FoodDataStore.fat.toString() + " g"
        }

        if (this.barcodeText) {
          this.barcodeText.text = "Barcode: " + FoodDataStore.barcode
        }

        this.updateBar(this.caloriesBar, FoodDataStore.calories / 600)
        this.updateBar(this.proteinBar, FoodDataStore.protein / 50)
        this.updateBar(this.carbsBar, FoodDataStore.carbs / 100)
        this.updateBar(this.fatBar, FoodDataStore.fat / 70)
        break
    }
  }

  private clearProductText(): void {
    if (this.productNameText) {
      this.productNameText.text = ""
    }

    if (this.brandText) {
      this.brandText.text = ""
    }

    if (this.caloriesText) {
      this.caloriesText.text = ""
    }

    if (this.proteinText) {
      this.proteinText.text = ""
    }

    if (this.carbsText) {
      this.carbsText.text = ""
    }

    if (this.fatText) {
      this.fatText.text = ""
    }

    if (this.barcodeText) {
      this.barcodeText.text = ""
    }
  }

  private storeOriginalBarScales(): void {
    const bars = [
      this.caloriesBar,
      this.proteinBar,
      this.carbsBar,
      this.fatBar
    ]

    bars.forEach((bar) => {
      if (!bar) {
        return
      }

      this.originalScales.set(
        bar,
        bar.getTransform().getLocalScale()
      )
    })
  }

  private updateBar(bar: SceneObject, percent: number): void {
    if (!bar) {
      return
    }

    percent = Math.max(0, Math.min(1, percent))

    const originalScale = this.originalScales.get(bar)

    if (!originalScale) {
      return
    }

    bar.getTransform().setLocalScale(
      new vec3(
        originalScale.x * percent,
        originalScale.y,
        originalScale.z
      )
    )
  }

  private setAllBarsEmpty(): void {
    this.updateBar(this.caloriesBar, 0)
    this.updateBar(this.proteinBar, 0)
    this.updateBar(this.carbsBar, 0)
    this.updateBar(this.fatBar, 0)
  }
}
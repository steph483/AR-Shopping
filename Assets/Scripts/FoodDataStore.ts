/**
 * Specs Inc. 2026
 * Shared in-memory food lookup result for lens UI scripts to read.
 */
export type FoodLookupStatus = "idle" | "loading" | "ok" | "error"

export class FoodDataStore {
  static status: FoodLookupStatus = "idle"
  static message: string = ""
  static productName: string = ""
  static brand: string = ""
  static calories: number = 0
  static protein: number = 0
  static carbs: number = 0
  static fat: number = 0
  static barcode: string = ""

  static reset(): void {
    FoodDataStore.status = "idle"
    FoodDataStore.message = ""
    FoodDataStore.productName = ""
    FoodDataStore.brand = ""
    FoodDataStore.calories = 0
    FoodDataStore.protein = 0
    FoodDataStore.carbs = 0
    FoodDataStore.fat = 0
    FoodDataStore.barcode = ""
  }

  static setLoading(): void {
    FoodDataStore.status = "loading"
    FoodDataStore.message = "Looking up..."
  }

  static applyFromJson(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString) as {
        status?: string
        message?: string
        productName?: string
        brand?: string
        calories?: number
        protein?: number
        carbs?: number
        fat?: number
        barcode?: string
      }

      if (parsed.status === "error") {
        FoodDataStore.status = "error"
        FoodDataStore.message = parsed.message ?? "Unknown error"
        return false
      }

      if (parsed.status !== "ok") {
        FoodDataStore.status = "error"
        FoodDataStore.message = "Invalid response from mobile app"
        return false
      }

      FoodDataStore.status = "ok"
      FoodDataStore.message = ""
      FoodDataStore.productName = parsed.productName ?? "Unknown"
      FoodDataStore.brand = parsed.brand ?? "Unknown"
      FoodDataStore.calories = parsed.calories ?? 0
      FoodDataStore.protein = parsed.protein ?? 0
      FoodDataStore.carbs = parsed.carbs ?? 0
      FoodDataStore.fat = parsed.fat ?? 0
      FoodDataStore.barcode = parsed.barcode ?? ""
      return true
    } catch (error) {
      FoodDataStore.status = "error"
      FoodDataStore.message = "Failed to parse food data: " + error
      return false
    }
  }

  static formatDisplayText(): string {
    if (FoodDataStore.status === "loading") {
      return "Looking up..."
    }

    if (FoodDataStore.status === "error") {
      return FoodDataStore.message
    }

    if (FoodDataStore.status !== "ok") {
      return ""
    }

    return [
      FoodDataStore.productName,
      FoodDataStore.brand,
      "Barcode: " + FoodDataStore.barcode,
      "(per 100g)",
      "Calories: " + FoodDataStore.calories + " kcal",
      "Protein: " + FoodDataStore.protein + " g",
      "Carbs: " + FoodDataStore.carbs + " g",
      "Fat: " + FoodDataStore.fat + " g"
    ].join("\n")
  }
}

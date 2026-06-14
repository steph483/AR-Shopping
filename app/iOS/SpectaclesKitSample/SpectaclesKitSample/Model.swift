// Copyright © 2024 Snap, Inc. All rights reserved.

import Combine
import CryptoKit
import Foundation
import SpectaclesKit
import UIKit
import Vision

final class testAuthentication: Authentication {}

private let testLensId = "SpecsMobileKit"

final class Model: ObservableObject {
    var (deeplinkStream, deeplinkContinuation) = AsyncStream<URL>.makeStream()
    let bondingManager: any BondingManager
    var currentSession: SpectaclesSession?
    @Published var sessionStarted: Bool = false
    @Published var connectionStatusText: String = ""

    @Published var receivedMessage: String = ""
    @Published var receivedImage: UIImage?
    var sendContinuation = PassthroughSubject<String, Never>()

    @Published var bondings: [BondingData] = []
    @Published var statusMessage: String = "Lens name for binding: \(testLensId)"

    @Published var debugScanStatus: String = "Idle"
    @Published var debugDetectedBarcode: String = ""
    @Published var debugApiSummary: String = ""
    @Published var debugSentToGlasses: String = ""

    /// Called on the main actor whenever a complete image arrives from Spectacles.
    /// `receivedImage` is updated before this runs. Use this hook for barcode scanning or other processing.
    var onImageReceived: (@MainActor (UIImage) -> Void)?

    let imageTransferReceiver = ImageTransferReceiver()

    private var connectionObserverTask: Task<Void, Never>?
    @MainActor private var lookupInProgress = false
    @MainActor private var cachedLookupJSON: String?

    init() {
        bondingManager = BuilderFactory.create().setIdentifier(ClientIdentifier(clientId: Bundle.main.bundleIdentifier!, appName: "SampleApp")!).setVersion("1.0").setAuth(testAuthentication()).build()

        imageTransferReceiver.onTransferStarted = { [weak self] in
            Task { @MainActor in
                guard let self else { return }
                self.receivedImage = nil
                self.resetLookupCache()
                self.debugScanStatus = "Receiving image…"
            }
        }
        imageTransferReceiver.onTransferFailed = { [weak self] in
            Task { @MainActor in
                guard let self else { return }
                self.receivedImage = nil
                self.cacheLookupError("Image transfer failed")
            }
        }
        imageTransferReceiver.onImageReceived = { [weak self] image in
            guard let self else { return }
            self.receivedImage = image
            self.onImageReceived?(image)
            
            Task {
                    await self.processFoodImage(image)
                }
        }

        getAllBonding()
    }

    func pushDeeplinkURL(url: URL) {
        deeplinkContinuation.yield(url)
    }

    func getAllBonding() {
        self.bondings.removeAll()
        let bondings = bondingManager.availableBondings()
        for bonding in bondings {
            self.bondings.append(BondingData(id: bonding.id))
        }
    }

    func unbind(id: String) {
        Task { @MainActor in
            (deeplinkStream, deeplinkContinuation) = AsyncStream<URL>.makeStream()
            let result = await bondingManager.unbind(id: id, deeplinkAsyncStream: deeplinkStream)
            switch result {
            case .success:
                getAllBonding()
                print("[SampleApp] unbind:\(id)")
            case let .failure(error):
                print("[SampleApp] unbind error:\(error)")
            }
        }
    }

    func bind() {
        Task { @MainActor in
            statusMessage = "Opening Spectacles App to bind lens \"\(testLensId)\"…"
            (deeplinkStream, deeplinkContinuation) = AsyncStream<URL>.makeStream()

            // [WARNING] Since names are not unique, singleLensByLensName is for development use. Use singleLens in production for better security.
            // Using lensName is only intended for development when lensId is not yet known.
            // Must match Lens Studio → Project Settings → Lens Name exactly.
            let request = BondingRequest.singleLensByName(lensName: testLensId)
            // let request = BondingRequest.singleLens(lensId: testLensId) // preferred in production

            let result = await bondingManager.bind(request: request, deeplinkAsyncStream: deeplinkStream)
            switch result {
            case let .success(newBonding):
                getAllBonding()
                statusMessage = "Bind succeeded (\(newBonding.id)). Tap the bonding row to start a session."
                print("[SampleApp] newBonding:\(newBonding)")
            case let .failure(error):
                statusMessage = "Bind failed: \(error.localizedDescription)"
                print("[SampleApp] bind error:\(error)")
            }
        }
    }

    func startSession(binding: any Bonding) {
        sendContinuation = PassthroughSubject<String, Never>()
        imageTransferReceiver.reset()
        receivedImage = nil
        connectionObserverTask?.cancel()
        connectionObserverTask = nil

        do {
            // set acceptUntrustedLenses to allow untrusted lens connections, When using singleLensByLensName.
            let session = try bondingManager.createSession(
                bonding: binding,
                request: SessionRequest(autoReconnect: true, acceptUnfusedSpectacles: true, acceptUntrustedLenses: true),
                delegateBuilder: { _ in self }
            )
            currentSession = session
            sessionStarted = true
            connectionStatusText = "Session created — opening L2CAP to glasses…"
            observeConnectionStatus(session)
        } catch {
            currentSession = nil
            sessionStarted = false
            connectionStatusText = "Session failed to start: \(error.localizedDescription)"
            print("[SampleApp] createSession error: \(error)")
        }
    }

    func stopSession() {
        connectionObserverTask?.cancel()
        connectionObserverTask = nil
        currentSession?.close(reason: nil)
        currentSession = nil
        sessionStarted = false
        receivedMessage = ""
        receivedImage = nil
        imageTransferReceiver.reset()
        connectionStatusText = ""
        Task { @MainActor in
            self.resetLookupCache()
            self.debugScanStatus = "Idle"
            self.debugDetectedBarcode = ""
            self.debugApiSummary = ""
            self.debugSentToGlasses = ""
        }
    }

    @MainActor
    private func resetLookupCache() {
        lookupInProgress = false
        cachedLookupJSON = nil
    }

    @MainActor
    private func cacheLookupError(_ message: String) {
        lookupInProgress = false
        cachedLookupJSON = encodeLookupResponse(FoodLookupResponse.error(message))
        debugScanStatus = "Error"
        debugSentToGlasses = cachedLookupJSON ?? ""
    }

    @MainActor
    private func cacheLookupSuccess(_ response: FoodLookupResponse) {
        lookupInProgress = false
        cachedLookupJSON = encodeLookupResponse(response)
        debugScanStatus = "Ready for glasses"
        debugSentToGlasses = cachedLookupJSON ?? ""
    }

    private func encodeLookupResponse(_ response: FoodLookupResponse) -> String? {
        guard let data = try? JSONEncoder().encode(response) else {
            return nil
        }
        return String(data: data, encoding: .utf8)
    }

    private func isFoodLookupRequest(_ body: String) -> Bool {
        guard let data = body.data(using: .utf8),
              let message = try? JSONDecoder().decode(FoodLookupRequest.self, from: data)
        else {
            return body.contains("\"op\":\"food_lookup\"")
        }
        return message.op == "food_lookup"
    }

    private func getFoodLookupResponse() async -> String {
        let timeoutSeconds = 30.0
        let start = Date()

        while await MainActor.run(body: { self.lookupInProgress }) {
            if Date().timeIntervalSince(start) > timeoutSeconds {
                return await MainActor.run {
                    self.cacheLookupError("Lookup timed out")
                    return self.cachedLookupJSON ?? encodeLookupResponse(FoodLookupResponse.error("Lookup timed out"))!
                }
            }
            try? await Task.sleep(nanoseconds: 100_000_000)
        }

        return await MainActor.run {
            self.cachedLookupJSON ?? encodeLookupResponse(FoodLookupResponse.error("No scan result available"))!
        }
    }

    private func observeConnectionStatus(_ session: any SpectaclesSession) {
        connectionObserverTask = Task {
            for await status in session.connectionStatusStream {
                await MainActor.run {
                    switch status {
                    case .connectStart:
                        self.connectionStatusText = "Connecting — opening L2CAP channel…"
                    case let .connected(metadata):
                        self.connectionStatusText = "Connected to lens \(metadata.lensId) v\(metadata.lensVersion)"
                    case let .error(error):
                        self.connectionStatusText = "Connection error: \(error.localizedDescription)"
                        print("[SampleApp] connection error: \(error)")
                    case let .disconnected(reason):
                        self.connectionStatusText = "Disconnected: \(String(describing: reason))"
                    }
                }
            }
        }
    }
    
    func detectBarcode(from image: UIImage) async throws -> String {

        guard let cgImage = image.cgImage else {
            throw NSError(
                domain: "BarcodeDetection",
                code: 1,
                userInfo: [
                    NSLocalizedDescriptionKey:
                    "Unable to create CGImage"
                ]
            )
        }

        let request = VNDetectBarcodesRequest()

        let handler = VNImageRequestHandler(
            cgImage: cgImage
        )

        try handler.perform([request])

        guard let observation =
            request.results?.first,
            let barcode =
            observation.payloadStringValue
        else {

            throw NSError(
                domain: "BarcodeDetection",
                code: 2,
                userInfo: [
                    NSLocalizedDescriptionKey:
                    "No barcode found"
                ]
            )
        }

        return barcode
    }
    
    func fetchProduct(
        barcode: String
    ) async throws -> (product: Product, rawSummary: String) {

        let urlString =
            "https://world.openfoodfacts.org/api/v0/product/\(barcode).json"

        guard let url = URL(string: urlString) else {
            throw URLError(.badURL)
        }

        let (data, _) =
            try await URLSession.shared.data(from: url)

        let rawSummary = String(data: data, encoding: .utf8) ?? ""

        let response =
            try JSONDecoder().decode(
                OpenFoodFactsResponse.self,
                from: data
            )

        guard response.status == 1, let product = response.product else {
            throw NSError(
                domain: "OpenFoodFacts",
                code: 404,
                userInfo: [
                    NSLocalizedDescriptionKey: "Product not found in Open Food Facts"
                ]
            )
        }

        return (product, rawSummary)
    }

    func processFoodImage(
        _ image: UIImage
    ) async {

        await MainActor.run {
            self.lookupInProgress = true
            self.cachedLookupJSON = nil
            self.debugScanStatus = "Scanning barcode…"
            self.debugDetectedBarcode = ""
            self.debugApiSummary = ""
            self.debugSentToGlasses = ""
        }

        do {

            let barcode =
                try await detectBarcode(
                    from: image
                )

            print("Detected barcode:")
            print(barcode)

            await MainActor.run {
                self.debugDetectedBarcode = barcode
                self.debugScanStatus = "Fetching from Open Food Facts…"
            }

            let fetchResult =
                try await fetchProduct(
                    barcode: barcode
                )
            let product = fetchResult.product

            print("Product:")
            print(product.product_name ?? "Unknown")

            let lookupResponse = FoodLookupResponse.success(
                productName: product.product_name ?? "Unknown",
                brand: product.brands ?? "Unknown",
                calories: product.nutriments?.energy_kcal_100g ?? 0,
                protein: product.nutriments?.proteins_100g ?? 0,
                carbs: product.nutriments?.carbohydrates_100g ?? 0,
                fat: product.nutriments?.fat_100g ?? 0,
                barcode: barcode
            )

            await MainActor.run {
                self.debugApiSummary = self.formatApiSummary(product: product, rawSummary: fetchResult.rawSummary)
                self.cacheLookupSuccess(lookupResponse)
                self.receivedMessage = "Food lookup ready for glasses"
            }

        } catch {

            print("Food processing error:")
            print(error)

            await MainActor.run {
                self.cacheLookupError(error.localizedDescription)
                self.receivedMessage =
                    "Food processing failed: \(error.localizedDescription)"
            }
        }
    }

    @MainActor
    private func formatApiSummary(product: Product, rawSummary: String) -> String {
        var lines: [String] = []
        lines.append("product_name: \(product.product_name ?? "—")")
        lines.append("brands: \(product.brands ?? "—")")
        if let nutriments = product.nutriments {
            lines.append("energy_kcal_100g: \(formatOptionalDouble(nutriments.energy_kcal_100g))")
            lines.append("proteins_100g: \(formatOptionalDouble(nutriments.proteins_100g))")
            lines.append("carbohydrates_100g: \(formatOptionalDouble(nutriments.carbohydrates_100g))")
            lines.append("fat_100g: \(formatOptionalDouble(nutriments.fat_100g))")
        }
        lines.append("")
        lines.append("Raw response (truncated):")
        lines.append(String(rawSummary.prefix(1200)))
        return lines.joined(separator: "\n")
    }

    private func formatOptionalDouble(_ value: Double?) -> String {
        guard let value else {
            return "—"
        }
        return String(value)
    }
    
    
}

extension Model: SpectaclesRequestDelegate {
    func processServiceRequest(_ request: SpectaclesRequest) async {
        switch request {
        case let .api(apiRequest):
            switch apiRequest {
            case let .call(callRequest):
                let body = String(data: callRequest.params, encoding: .utf8) ?? ""
                if let message = imageTransferReceiver.handleCall(body) {
                    await MainActor.run {
                        self.onReceiveMessage(message: message)
                    }
                    callRequest.yield("ok".data(using: .utf8)!, isComplete: true)
                } else if isFoodLookupRequest(body) {
                    let responseJSON = await getFoodLookupResponse()
                    await MainActor.run {
                        self.debugSentToGlasses = responseJSON
                        self.onReceiveMessage(message: "Sent food lookup to glasses")
                    }
                    callRequest.yield(responseJSON.data(using: .utf8)!, isComplete: true)
                } else if body.contains("\"op\":\"img_") {
                    await MainActor.run {
                        self.onReceiveMessage(message: "Image transfer message could not be parsed")
                    }
                    callRequest.yield("ok".data(using: .utf8)!, isComplete: true)
                } else {
                    await MainActor.run {
                        self.onReceiveMessage(message: body)
                    }
                    let sendStream = makeStream()
                    for await sendMessage in sendStream {
                        callRequest.yield(sendMessage.data(using: .utf8)!, isComplete: false)
                    }
                }

            case let .notify(notifyRequest):
                let notifyBody = String(data: notifyRequest.params, encoding: .utf8) ?? ""
                let message = imageTransferReceiver.handleNotify(notifyBody)
                await MainActor.run {
                    self.onReceiveMessage(message: message)
                }
                print("[SampleApp] \(notifyRequest)")
            }
        case let .asset(assetRequest):
            switch assetRequest {
            case let .load(asset): do {
                    print("[SampleApp] Load asset:\(asset)")
                    if let data = getData(from: asset.uri) {
                        let dataKey = data.sha256Hash()
                        asset.complete(returning: SpectaclesAssetRequest.Asset(name: dataKey, version: dataKey, data: data))
                    } else {
                        asset.complete(throwing: SpectaclesRequestError.notFound)
                    }
                }
            }
        }
    }

    @MainActor
    func onReceiveMessage(message: String) {
        receivedMessage = message
    }

    @MainActor
    func onSendMessage(message: String) {
        sendContinuation.send(message)
    }

    private func makeStream() -> AsyncStream<String> {
        AsyncStream { continuation in
            let subscription = sendContinuation.sink { value in
                continuation.yield(value)
            }
            continuation.onTermination = { _ in
                subscription.cancel()
            }
        }
    }
}

struct OpenFoodFactsResponse: Codable {
    let status: Int
    let product: Product?
}

struct Product: Codable {
    let product_name: String?
    let brands: String?
    let nutriments: Nutriments?
}

struct Nutriments: Codable {
    let energy_kcal_100g: Double?
    let proteins_100g: Double?
    let carbohydrates_100g: Double?
    let fat_100g: Double?
}

struct FoodLookupRequest: Codable {
    let op: String
}

struct FoodLookupResponse: Codable {
    let status: String
    let message: String?
    let productName: String?
    let brand: String?
    let calories: Double?
    let protein: Double?
    let carbs: Double?
    let fat: Double?
    let barcode: String?

    static func success(
        productName: String,
        brand: String,
        calories: Double,
        protein: Double,
        carbs: Double,
        fat: Double,
        barcode: String
    ) -> FoodLookupResponse {
        FoodLookupResponse(
            status: "ok",
            message: nil,
            productName: productName,
            brand: brand,
            calories: calories,
            protein: protein,
            carbs: carbs,
            fat: fat,
            barcode: barcode
        )
    }

    static func error(_ message: String) -> FoodLookupResponse {
        FoodLookupResponse(
            status: "error",
            message: message,
            productName: nil,
            brand: nil,
            calories: nil,
            protein: nil,
            carbs: nil,
            fat: nil,
            barcode: nil
        )
    }
}

extension Data {
    func sha256Hash() -> String {
        let hash = SHA256.hash(data: self)
        return hash.map { String(format: "%02hhx", $0) }.joined()
    }
}

func getData(from input: String) -> Data? {
    guard let end = input.lastIndex(of: ".") else {
        return nil
    }

    let filePath = String(input[..<end])
    let fileExtension = String(input[input.index(after: end)...])

    print("[SampleApp] filePath:\(filePath) extension:\(fileExtension)")

    if fileExtension == "png" {
        return UIImage(named: filePath + "." + fileExtension)?.pngData()
    } else {
        guard let fileURL = Bundle.main.url(forResource: filePath, withExtension: fileExtension) else { return nil }
        return try? Data(contentsOf: fileURL)
    }
}

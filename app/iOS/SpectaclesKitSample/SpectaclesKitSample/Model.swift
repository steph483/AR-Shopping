// Copyright © 2024 Snap, Inc. All rights reserved.

import Combine
import CryptoKit
import Foundation
import SpectaclesKit
import UIKit

final class testAuthentication: Authentication {}

private let testLensId = "SpecsMobileKit"

private struct ImageTransferMessage: Decodable {
    let op: String
    let id: String?
    let total: Int?
    let bytes: Int?
    let i: Int?
    let data: String?
}

private final class ImageTransferState {
    let id: String
    let totalChunks: Int
    let expectedBytes: Int
    private var chunks: [Int: String] = [:]

    init(id: String, totalChunks: Int, expectedBytes: Int) {
        self.id = id
        self.totalChunks = totalChunks
        self.expectedBytes = expectedBytes
    }

    func storeChunk(index: Int, data: String) {
        chunks[index] = data
    }

    var receivedChunkCount: Int {
        chunks.count
    }

    func assembledBase64() -> String? {
        guard chunks.count == totalChunks else {
            return nil
        }
        var result = ""
        result.reserveCapacity(expectedBytes)
        for index in 0 ..< totalChunks {
            guard let chunk = chunks[index] else {
                return nil
            }
            result += chunk
        }
        return result
    }
}

final class Model: ObservableObject {
    var (deeplinkStream, deeplinkContinuation) = AsyncStream<URL>.makeStream()
    let bondingManager: any BondingManager
    var currentSession: SpectaclesSession?
    @Published var sessionStarted: Bool = false

    @Published var receivedMessage: String = ""
    @Published var receivedImage: UIImage?
    var sendContinuation = PassthroughSubject<String, Never>()

    @Published var bondings: [BondingData] = []
    @Published var statusMessage: String = "Lens name for binding: \(testLensId)"

    private var activeTransfer: ImageTransferState?

    init() {
        bondingManager = BuilderFactory.create().setIdentifier(ClientIdentifier(clientId: Bundle.main.bundleIdentifier!, appName: "SampleApp")!).setVersion("1.0").setAuth(testAuthentication()).build()

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
        activeTransfer = nil
        receivedImage = nil
        // set acceptUntrustedLenses to allow untrusted lens connections, When using singleLensByLensName.
        currentSession = try? bondingManager.createSession(bonding: binding, request: SessionRequest(autoReconnect: true, acceptUnfusedSpectacles: true, acceptUntrustedLenses: true), delegateBuilder: { _ in
            self
        })
        sessionStarted = true
    }

    func stopSession() {
        currentSession?.close(reason: nil)
        currentSession = nil
        sessionStarted = false
        receivedMessage = ""
        receivedImage = nil
        activeTransfer = nil
    }
}

extension Model: SpectaclesRequestDelegate {
    func processServiceRequest(_ request: SpectaclesRequest) async {
        switch request {
        case let .api(apiRequest):
            switch apiRequest {
            case let .call(callRequest):
                let body = String(data: callRequest.params, encoding: .utf8) ?? ""
                if let message = self.handleImageTransferCall(body) {
                    await MainActor.run {
                        self.onReceiveMessage(message: message)
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
                let message = self.handleImageTransferNotify(notifyBody)
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

    private func handleImageTransferCall(_ body: String) -> String? {
        guard let message = decodeTransferMessage(body), message.op == "img_chunk" else {
            return nil
        }

        guard let transferId = message.id,
              let index = message.i,
              let data = message.data,
              let transfer = activeTransfer,
              transfer.id == transferId
        else {
            return "Image chunk ignored (no active transfer)"
        }

        transfer.storeChunk(index: index, data: data)
        return "Image chunk \(index + 1)/\(transfer.totalChunks) received"
    }

    private func handleImageTransferNotify(_ body: String) -> String {
        guard let message = decodeTransferMessage(body) else {
            return body
        }

        switch message.op {
        case "img_start":
            guard let transferId = message.id,
                  let total = message.total,
                  let bytes = message.bytes
            else {
                return "Image transfer start ignored (invalid payload)"
            }
            activeTransfer = ImageTransferState(id: transferId, totalChunks: total, expectedBytes: bytes)
            Task { @MainActor in
                self.receivedImage = nil
            }
            return "Image transfer started (\(total) chunks, \(bytes) bytes)"

        case "img_end":
            guard let transferId = message.id,
                  let transfer = activeTransfer,
                  transfer.id == transferId,
                  let base64 = transfer.assembledBase64(),
                  let imageData = Data(base64Encoded: base64),
                  let image = UIImage(data: imageData)
            else {
                activeTransfer = nil
                Task { @MainActor in
                    self.receivedImage = nil
                }
                return "Image transfer failed (missing or invalid chunks)"
            }

            activeTransfer = nil
            Task { @MainActor in
                self.receivedImage = image
            }
            return "Image transfer complete (\(Int(image.size.width))x\(Int(image.size.height)))"

        default:
            return body
        }
    }

    private func decodeTransferMessage(_ body: String) -> ImageTransferMessage? {
        guard let data = body.data(using: .utf8) else {
            return nil
        }
        return try? JSONDecoder().decode(ImageTransferMessage.self, from: data)
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

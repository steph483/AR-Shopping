// Copyright © 2024 Snap, Inc. All rights reserved.

import Foundation
import UIKit

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

/// Reassembles chunked image payloads sent from a Spectacles Lens over Mobile Kit.
final class ImageTransferReceiver {
    /// Called on the main actor when a new transfer starts and any previous image is invalidated.
    var onTransferStarted: (@MainActor () -> Void)?

    /// Called on the main actor when a complete image has been assembled.
    var onImageReceived: (@MainActor (UIImage) -> Void)?

    /// Called on the main actor when a transfer fails or is aborted.
    var onTransferFailed: (@MainActor () -> Void)?

    private var activeTransfer: ImageTransferState?

    func reset() {
        activeTransfer = nil
    }

    /// Handles request/response messages (`img_start`, `img_chunk`). Returns a status string when handled.
    func handleCall(_ body: String) -> String? {
        guard let message = decodeTransferMessage(body) else {
            return nil
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
            notifyTransferStarted()
            return "Image transfer started (\(total) chunks, \(bytes) bytes)"

        case "img_chunk":
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

        default:
            return nil
        }
    }

    /// Handles one-way notify messages (`img_start`, `img_end`). Returns a status string for logging/UI.
    func handleNotify(_ body: String) -> String {
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
            notifyTransferStarted()
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
                notifyTransferFailed()
                return "Image transfer failed (missing or invalid chunks)"
            }

            activeTransfer = nil
            notifyImageReceived(image)
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

    private func notifyTransferStarted() {
        Task { @MainActor in
            onTransferStarted?()
        }
    }

    private func notifyImageReceived(_ image: UIImage) {
        Task { @MainActor in
            onImageReceived?(image)
        }
    }

    private func notifyTransferFailed() {
        Task { @MainActor in
            onTransferFailed?()
        }
    }
}

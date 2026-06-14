// Copyright © 2024 Snap, Inc. All rights reserved.
import SwiftUI

struct SessionView: View {
    @EnvironmentObject private var model: Model
    var bonding: BondingData

    @State private var sendMessage: String = "Hello from mobile"

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(alignment: .leading) {
                Text(bonding.id)
                    .font(.headline)

                Button(model.sessionStarted ? "Stop Session" : "Start Session") {
                    if model.sessionStarted {
                        model.stopSession()
                    } else {
                        model.startSession(binding: bonding)
                    }
                }.buttonStyle(.bordered)

                if !model.connectionStatusText.isEmpty {
                    Text(model.connectionStatusText)
                        .font(.footnote)
                        .foregroundStyle(.secondary)
                        .padding(.bottom, 8)
                }

                Text("Received Image:")
                    .font(.subheadline)
                    .padding(.top, 8)

                if let image = model.receivedImage {
                    Image(uiImage: image)
                        .resizable()
                        .scaledToFit()
                        .frame(maxHeight: 280)
                        .cornerRadius(10)
                        .padding(.bottom, 8)
                } else {
                    Text("No image received yet")
                        .foregroundStyle(.secondary)
                        .frame(maxWidth: .infinity, minHeight: 120)
                        .background(Color(.systemGray6))
                        .cornerRadius(10)
                        .padding(.bottom, 8)
                }

                Text("Send Message:")
                    .font(.subheadline)
                    .padding(.bottom, 4)

                TextEditor(text: $sendMessage)
                    .frame(minHeight: 80)
                    .padding(8)
                    .background(Color(.systemGray6))
                    .cornerRadius(10)
                    .shadow(radius: 2)
                    .overlay(RoundedRectangle(cornerRadius: 10).stroke(Color.gray.opacity(0.5)))
                    .padding(.bottom, 8)

                Button(action: {
                    model.onSendMessage(message: sendMessage)
                    sendMessage = ""
                    hideKeyboard()
                }) {
                    Text("Send")
                        .frame(maxWidth: .infinity)
                        .padding()
                        .foregroundColor(.white)
                        .background(Color.blue)
                        .cornerRadius(8)
                }
                .padding(.bottom, 16)

                Text("Received Message:")
                    .font(.subheadline)
                    .padding(.bottom, 4)
                TextEditor(text: $model.receivedMessage)
                    .frame(minHeight: 100)
                    .padding(8)
                    .background(Color(.systemGray6))
                    .cornerRadius(10)
                    .shadow(radius: 2)
                    .overlay(RoundedRectangle(cornerRadius: 10).stroke(Color.gray.opacity(0.5)))
                    .disabled(true)
                    .padding(.bottom, 16)

                Text("Food Scan Debug")
                    .font(.headline)
                    .padding(.top, 8)

                debugRow(label: "Status", value: model.debugScanStatus)
                debugRow(label: "Barcode", value: model.debugDetectedBarcode.isEmpty ? "—" : model.debugDetectedBarcode)

                Text("Barcode scan detail:")
                    .font(.subheadline)
                    .padding(.top, 4)
                TextEditor(text: .constant(model.debugBarcodeScanDetail.isEmpty ? "—" : model.debugBarcodeScanDetail))
                    .frame(minHeight: 80)
                    .padding(8)
                    .background(Color(.systemGray6))
                    .cornerRadius(10)
                    .disabled(true)
                    .padding(.bottom, 8)

                Text("API summary:")
                    .font(.subheadline)
                    .padding(.top, 8)
                TextEditor(text: .constant(model.debugApiSummary.isEmpty ? "—" : model.debugApiSummary))
                    .frame(minHeight: 140)
                    .padding(8)
                    .background(Color(.systemGray6))
                    .cornerRadius(10)
                    .disabled(true)
                    .padding(.bottom, 8)

                Text("JSON sent to glasses:")
                    .font(.subheadline)
                TextEditor(text: .constant(model.debugSentToGlasses.isEmpty ? "—" : model.debugSentToGlasses))
                    .frame(minHeight: 120)
                    .padding(8)
                    .background(Color(.systemGray6))
                    .cornerRadius(10)
                    .disabled(true)
                    .padding(.bottom, 16)

                Spacer()
            }
            .padding(.top, 20)
            .padding(.horizontal, 16)
        }
    }

    private func hideKeyboard() {
        UIApplication.shared.sendAction(#selector(UIResponder.resignFirstResponder), to: nil, from: nil, for: nil)
    }

    private func debugRow(label: String, value: String) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(label)
                .font(.subheadline)
                .foregroundStyle(.secondary)
            Text(value)
                .font(.body)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.bottom, 8)
    }
}

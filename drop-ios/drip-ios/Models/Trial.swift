//
//  Trial.swift
//  drip-ios
//
//  Created by Harsh Patel on 04/04/25.
//

import Foundation
import SwiftData

@Model
final class Trial {
    var id: UUID
    var productId: String
    var tryOnImageData: Data?
    var status: TrialStatus
    var createdAt: Date
    var sizeRecommendation: String?
    var fitNotes: String?
    
//    @Relationship(deleteRule: .cascade, inverse: \Product.trials)
    var product: Product?
    
    init(
        id: UUID = UUID(),
        productId: String,
        tryOnImageData: Data? = nil,
        status: TrialStatus = .pending,
        createdAt: Date = Date(),
        sizeRecommendation: String? = nil,
        fitNotes: String? = nil,
        product: Product? = nil
    ) {
        self.id = id
        self.productId = productId
        self.tryOnImageData = tryOnImageData
        self.status = status
        self.createdAt = createdAt
        self.sizeRecommendation = sizeRecommendation
        self.fitNotes = fitNotes
        self.product = product
    }
}

enum TrialStatus: String, Codable {
    case pending = "Pending"
    case processing = "Processing"
    case completed = "Completed"
    case failed = "Failed"
}

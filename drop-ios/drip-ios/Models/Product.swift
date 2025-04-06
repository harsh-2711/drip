//
//  Product.swift
//  drip-ios
//
//  Created by Harsh Patel on 04/04/25.
//

import Foundation
import SwiftData

@Model
final class Product {
    var productId: String
    var title: String
    var brand: String
    var price: Double
    var currency: String
    var imageUrl: String
    var category: String
    var styleType: String?
    var primaryColor: String?
    var fabric: String?
    var fitType: String?
    var availableSizes: [String]
    var matchScore: Double?
    var matchReasons: [String]
    
    @Relationship(deleteRule: .cascade, inverse: \Trial.product)
    var trials: [Trial]? = []
    
    init(
        productId: String,
        title: String,
        brand: String,
        price: Double,
        currency: String = "INR",
        imageUrl: String,
        category: String,
        styleType: String? = nil,
        primaryColor: String? = nil,
        fabric: String? = nil,
        fitType: String? = nil,
        availableSizes: [String] = [],
        matchScore: Double? = nil,
        matchReasons: [String] = []
    ) {
        self.productId = productId
        self.title = title
        self.brand = brand
        self.price = price
        self.currency = currency
        self.imageUrl = imageUrl
        self.category = category
        self.styleType = styleType
        self.primaryColor = primaryColor
        self.fabric = fabric
        self.fitType = fitType
        self.availableSizes = availableSizes
        self.matchScore = matchScore
        self.matchReasons = matchReasons
    }
}

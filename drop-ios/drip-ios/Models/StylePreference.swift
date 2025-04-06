//
//  StylePreference.swift
//  drip-ios
//
//  Created by Harsh Patel on 04/04/25.
//

import Foundation
import SwiftData

@Model
final class StylePreference {
    var id: String
    var name: String
    var category: String
    var imageUrl: String
    var isSelected: Bool
    var attributes: String
    
    init(
        id: String = UUID().uuidString,
        name: String,
        category: String,
        imageUrl: String = "",
        isSelected: Bool = false,
        attributes: String = ""
    ) {
        self.id = id
        self.name = name
        self.category = category
        self.imageUrl = imageUrl
        self.isSelected = isSelected
        self.attributes = attributes
    }
}

// Style categories
enum StyleCategory: String, CaseIterable {
    case tops = "Tops"
    case bottoms = "Bottoms"
    case onePiece = "One-Piece"
}

//
//  UserPersona.swift
//  drip-ios
//
//  Created by Harsh Patel on 04/04/25.
//

import Foundation
import SwiftData

@Model
final class UserPersona {
    var userId: String
    var gender: String?
    var bodyShape: String?
    var skinTone: String?
    var undertone: String?
    var bestFits: [String]
    var dislikedTags: [String]
    var bestColors: [String]
    var lovedColors: [String]
    var lovedFits: [String]
    var idealSize: IdealSize?
    var userPhoto: Data?
    var lovedTags: [String]
    var occasions: [String]
    var styleKeywords: [String]
    
    init(
        userId: String = "user1",
        gender: String? = nil,
        bodyShape: String? = nil,
        skinTone: String? = nil,
        undertone: String? = nil,
        bestFits: [String] = [],
        dislikedTags: [String] = [],
        bestColors: [String] = [],
        lovedColors: [String] = [],
        lovedFits: [String] = [],
        idealSize: IdealSize? = nil,
        userPhoto: Data? = nil,
        lovedTags: [String] = [],
        occasions: [String] = [],
        styleKeywords: [String] = []
    ) {
        self.userId = userId
        self.gender = gender
        self.bodyShape = bodyShape
        self.skinTone = skinTone
        self.undertone = undertone
        self.bestFits = bestFits
        self.dislikedTags = dislikedTags
        self.bestColors = bestColors
        self.lovedColors = lovedColors
        self.lovedFits = lovedFits
        self.idealSize = idealSize
        self.userPhoto = userPhoto
        self.lovedTags = lovedTags
        self.occasions = occasions
        self.styleKeywords = styleKeywords
    }
}

@Model
final class IdealSize {
    var tops: String
    var bottoms: String
    
    init(tops: String = "M", bottoms: String = "M") {
        self.tops = tops
        self.bottoms = bottoms
    }
}

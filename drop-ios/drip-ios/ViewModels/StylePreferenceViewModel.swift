//
//  StylePreferenceViewModel.swift
//  drip-ios
//
//  Created by Harsh Patel on 04/04/25.
//

import Foundation
import SwiftUI
import Combine
import SwiftData

class StylePreferenceViewModel: ObservableObject {
    @Published var stylePreferences: [String: [StylePreference]] = [:]
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    private var cancellables = Set<AnyCancellable>()
    private let modelContext: ModelContext
    
    init(modelContext: ModelContext) {
        self.modelContext = modelContext
        loadStylePreferences()
    }
    
    // In a real app, this would fetch from an API
    private func loadStylePreferences() {
        // Create style preferences for all categories
        var preferences: [String: [StylePreference]] = [:]
        
        // Create a single "All" category with all style images
        var allStyles: [StylePreference] = []
        for i in 1...40 {
            let stylePreference = StylePreference(
                id: "s\(i)",
                name: "Style \(i)",
                category: "All",
                imageUrl: "s\(i)",
                attributes: "" // Empty string for now as requested
            )
            allStyles.append(stylePreference)
        }
        
        preferences["All"] = allStyles
        
        // Save to SwiftData
        for preference in allStyles {
            modelContext.insert(preference)
        }
        
        self.stylePreferences = preferences
    }
    
    func togglePreference(_ preference: StylePreference) {
        if let index = stylePreferences[preference.category]?.firstIndex(where: { $0.id == preference.id }) {
            stylePreferences[preference.category]?[index].isSelected.toggle()
        }
    }
    
    func getSelectedPreferences() -> [StylePreference] {
        var selected: [StylePreference] = []
        
        for category in stylePreferences.values {
            selected.append(contentsOf: category.filter { $0.isSelected })
        }
        
        return selected
    }
    
    func savePreferences() {
        // In a real app, this would send the selected preferences to the backend
        // For now, we just save them to SwiftData
        try? modelContext.save()
    }
}

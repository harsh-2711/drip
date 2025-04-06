//
//  OnboardingViewModel.swift
//  drip-ios
//
//  Created by Harsh Patel on 04/04/25.
//

import Foundation
import SwiftUI
import Combine
import SwiftData

enum OnboardingStep: Int, CaseIterable {
    case welcome
    case photoUpload
    case stylePreference
    case personaCreation
    case complete
}

class OnboardingViewModel: ObservableObject {
    @Published var currentStep: OnboardingStep = .welcome
    @Published var userPhoto: UIImage?
    @Published var userPhotoData: Data?
    @Published var bodyShape: String?
    @Published var skinTone: String?
    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var selectedStylePreferences: [StylePreference] = []
    @Published var userPersona: UserPersona?
    
    private var cancellables = Set<AnyCancellable>()
    private let modelContext: ModelContext
    
    init(modelContext: ModelContext) {
        self.modelContext = modelContext
    }
    
    func nextStep() {
        guard let nextIndex = OnboardingStep.allCases.firstIndex(where: { $0 == currentStep })?.advanced(by: 1),
              nextIndex < OnboardingStep.allCases.count else {
            return
        }
        
        currentStep = OnboardingStep.allCases[nextIndex]
    }
    
    func previousStep() {
        guard let prevIndex = OnboardingStep.allCases.firstIndex(where: { $0 == currentStep })?.advanced(by: -1),
              prevIndex >= 0 else {
            return
        }
        
        currentStep = OnboardingStep.allCases[prevIndex]
    }
    
    func setUserPhoto(_ image: UIImage) {
        // Resize image to 1080x1350 pixels (4:5 aspect ratio)
        let resizedImage = ImageUtils.resizeToAspectRatio(image: image)
        userPhoto = resizedImage
        userPhotoData = ImageUtils.compressImage(image: resizedImage)
    }
    
    func toggleStylePreference(_ preference: StylePreference) {
        if let index = selectedStylePreferences.firstIndex(where: { $0.id == preference.id }) {
            selectedStylePreferences.remove(at: index)
        } else {
            // Create a new StylePreference with the same ID but with isSelected set to true
            let newPreference = StylePreference(
                id: preference.id,
                name: preference.name,
                category: preference.category,
                imageUrl: preference.imageUrl,
                isSelected: true,
                attributes: preference.attributes
            )
            selectedStylePreferences.append(newPreference)
        }
    }
    
    func createUserPersona() {
        guard let userPhotoData = userPhotoData else {
            errorMessage = "Please upload a photo first"
            return
        }
        
        isLoading = true
        errorMessage = nil
        
        // Collect attributes from selected style preferences
        let selectedAttributes = selectedStylePreferences.compactMap { $0.attributes }
        
        APIService.shared.generateUserPersona(
            userId: "user1",
            userImageData: userPhotoData,
            attributes: selectedAttributes
        )
        .sink(
            receiveCompletion: { [weak self] completion in
                self?.isLoading = false
                
                if case .failure(let error) = completion {
                    self?.errorMessage = "Failed to create persona: \(error.localizedDescription)"
                }
            },
            receiveValue: { [weak self] personaDTO in
                guard let self = self else { return }
                
                // Create IdealSize object
                let idealSize = IdealSize(
                    tops: personaDTO.ideal_size.tops,
                    bottoms: personaDTO.ideal_size.bottoms
                )
                
                // Create and save UserPersona to SwiftData
                let persona = UserPersona(
                    userId: personaDTO.user_id,
                    gender: personaDTO.gender,
                    bodyShape: personaDTO.body_shape,
                    skinTone: personaDTO.skin_tone,
                    undertone: personaDTO.undertone,
                    bestFits: personaDTO.best_fits,
                    dislikedTags: personaDTO.disliked_tags,
                    bestColors: personaDTO.best_colors,
                    lovedColors: [], // Initialize as empty, will be populated as user likes items
                    lovedFits: [], // Initialize as empty, will be populated as user likes items
                    idealSize: idealSize,
                    userPhoto: self.userPhotoData,
                    lovedTags: personaDTO.loved_tags,
                    occasions: personaDTO.occasions,
                    styleKeywords: personaDTO.style_keywords
                )
                
                // First, delete any existing user personas to avoid duplicates
                let descriptor = FetchDescriptor<UserPersona>()
                do {
                    let existingPersonas = try self.modelContext.fetch(descriptor)
                    for existingPersona in existingPersonas {
                        self.modelContext.delete(existingPersona)
                    }
                } catch {
                    print("Error deleting existing personas: \(error)")
                }
                
                // Insert the new persona
                self.modelContext.insert(persona)
                
                // Explicitly save changes to ensure persistence
                do {
                    try self.modelContext.save()
                    print("User persona saved successfully with ID: \(persona.userId), gender: \(persona.gender ?? "nil")")
                } catch {
                    print("Error saving user persona: \(error)")
                }
                
                self.userPersona = persona
                
                // Move to next step
                self.nextStep()
            }
        )
        .store(in: &cancellables)
    }
    
    func completeOnboarding() {
        // Save any final data and move to the main app
        currentStep = .complete
    }
}

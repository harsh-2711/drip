//
//  TrialRoomViewModel.swift
//  drip-ios
//
//  Created by Harsh Patel on 04/04/25.
//

import Foundation
import SwiftUI
import Combine
import SwiftData

class TrialRoomViewModel: ObservableObject {
    @Published var trials: [Trial] = []
    @Published var selectedTrial: Trial?
    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var sizeRecommendation: String?
    @Published var fitNotes: String?
    
    private var cancellables = Set<AnyCancellable>()
    private let modelContext: ModelContext
    private var userPersona: UserPersona?
    
    init(modelContext: ModelContext) {
        self.modelContext = modelContext
        
        // Load user persona
        loadUserPersona()
        
        // Load trials
        loadTrials()
    }
    
    private func loadUserPersona() {
        let descriptor = FetchDescriptor<UserPersona>()
        
        do {
            let personas = try modelContext.fetch(descriptor)
            userPersona = personas.first
            
            if let persona = userPersona {
                print("TrialRoomViewModel: Loaded user persona - ID: \(persona.userId), gender: \(persona.gender ?? "nil")")
            } else {
                print("TrialRoomViewModel: No user persona found in database")
            }
        } catch {
            print("Error fetching user persona: \(error)")
        }
    }
    
    func loadTrials() {
        let descriptor = FetchDescriptor<Trial>(sortBy: [SortDescriptor(\.createdAt, order: .reverse)])
        
        do {
            trials = try modelContext.fetch(descriptor)
        } catch {
            errorMessage = "Failed to load trials: \(error.localizedDescription)"
        }
    }
    
    func selectTrial(_ trial: Trial) {
        selectedTrial = trial
        
        // If the trial has size recommendation and fit notes, use them
        if let sizeRec = trial.sizeRecommendation, let notes = trial.fitNotes {
            sizeRecommendation = sizeRec
            fitNotes = notes
        } else {
            // Otherwise, generate them
            generateSizeRecommendation(for: trial)
        }
    }
    
    func generateSizeRecommendation(for trial: Trial) {
        guard let product = trial.product, let userPersona = userPersona else { 
            print("TrialRoomViewModel: Error - Missing product or user persona when generating size recommendation")
            return 
        }
        
        print("TrialRoomViewModel: Generating size recommendation for product '\(product.title)' with user persona - ID: \(userPersona.userId), gender: \(userPersona.gender ?? "nil")")
        
        isLoading = true
        errorMessage = nil
        
        // Convert SwiftData UserPersona to DTO
        let idealSizeDTO = IdealSizeDTO(
            tops: userPersona.idealSize?.tops ?? "M",
            bottoms: userPersona.idealSize?.bottoms ?? "M"
        )
        
        let userPersonaDTO = UserPersonaDTO(
            user_id: userPersona.userId,
            gender: userPersona.gender ?? "",
            body_shape: userPersona.bodyShape ?? "",
            skin_tone: userPersona.skinTone ?? "",
            undertone: userPersona.undertone ?? "",
            best_fits: userPersona.bestFits,
            best_colors: userPersona.bestColors,
            ideal_size: idealSizeDTO,
            preferred_colors: userPersona.lovedColors,
            preferred_fits: userPersona.lovedFits,
            disliked_tags: userPersona.dislikedTags,
            loved_tags: userPersona.lovedTags,
            occasions: userPersona.occasions,
            style_keywords: userPersona.styleKeywords,
            recent_feedback: RecentFeedbackDTO(liked: [], disliked: [])
        )
        
        print("TrialRoomViewModel: Sending user persona DTO to API - ID: \(userPersonaDTO.user_id), gender: \(userPersonaDTO.gender ?? "nil")")
        
        // Call the API to get fit advice
        APIService.shared.getFitAdvice(
            productId: product.productId,
            userPersona: userPersonaDTO
        )
        .sink(
            receiveCompletion: { [weak self] completion in
                if case .failure(let error) = completion {
                    self?.errorMessage = "Failed to get fit advice: \(error.localizedDescription)"
                    self?.isLoading = false
                }
            },
            receiveValue: { [weak self] fitAdvice in
                guard let self = self else { return }
                
                self.sizeRecommendation = fitAdvice.recommended_size
                self.fitNotes = fitAdvice.fitting_advice
                
                // Save to the trial
                trial.sizeRecommendation = self.sizeRecommendation
                trial.fitNotes = self.fitNotes
                
                try? self.modelContext.save()
                
                self.isLoading = false
            }
        )
        .store(in: &cancellables)
    }
    
    func addToCart(_ trial: Trial) {
        // In a real app, this would add the product to a shopping cart
        // For now, we'll just print a message
        print("Added \(trial.product?.title ?? "product") to cart")
    }
    
    func removeTrial(_ trial: Trial) {
        modelContext.delete(trial)
        
        if selectedTrial?.id == trial.id {
            selectedTrial = nil
            sizeRecommendation = nil
            fitNotes = nil
        }
        
        loadTrials()
    }
    
    func clearAllTrials() {
        // Clear selected trial and its details
        selectedTrial = nil
        sizeRecommendation = nil
        fitNotes = nil
        
        // Delete all trials from the database
        for trial in trials {
            modelContext.delete(trial)
        }
        
        // Clear the trials array
        trials = []
    }
}

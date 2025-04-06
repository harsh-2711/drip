//
//  ExploreViewModel.swift
//  drip-ios
//
//  Created by Harsh Patel on 04/04/25.
//

import Foundation
import SwiftUI
import Combine
import SwiftData

class ExploreViewModel: ObservableObject {
    @Published var categories: [String] = []
    @Published var selectedCategory: String?
    @Published var products: [Product] = []
    @Published var currentProductIndex: Int = 0
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    private var cancellables = Set<AnyCancellable>()
    private let modelContext: ModelContext
    private var userPersona: UserPersona?
    
    init(modelContext: ModelContext) {
        self.modelContext = modelContext
        
        // Load categories
        categories = StyleCategory.allCases.map { $0.rawValue }
        
        // Load user persona
        loadUserPersona()
    }
    
    private func loadUserPersona() {
        let descriptor = FetchDescriptor<UserPersona>()
        
        do {
            let personas = try modelContext.fetch(descriptor)
            userPersona = personas.first
            
            if let persona = userPersona {
                print("ExploreViewModel: Loaded user persona - ID: \(persona.userId), gender: \(persona.gender ?? "nil")")
                
                // If we have a user persona and no category is selected yet, select the first category
                if selectedCategory == nil && !categories.isEmpty {
                    selectCategory(categories[0])
                }
            } else {
                print("ExploreViewModel: No user persona found in database")
            }
        } catch {
            print("Error fetching user persona: \(error)")
        }
    }
    
    func selectCategory(_ category: String) {
        selectedCategory = category
        loadProductsForCategory(category)
    }
    
    func loadProductsForCategory(_ category: String) {
        guard let userPersona = userPersona else {
            errorMessage = "User persona not found. Please complete onboarding first."
            print("ExploreViewModel: Error - User persona not found when trying to load products for category: \(category)")
            return
        }
        
        print("ExploreViewModel: Loading products for category '\(category)' with user persona - ID: \(userPersona.userId), gender: \(userPersona.gender ?? "nil")")
        
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
        
        print("ExploreViewModel: Sending user persona DTO to API - ID: \(userPersonaDTO.user_id), gender: \(userPersonaDTO.gender ?? "nil")")
        
        // Call the API to get recommendations
        APIService.shared.getRecommendations(
            userPersona: userPersonaDTO,
            category: category,
            limit: 10
        )
        .sink(
            receiveCompletion: { [weak self] completion in
                self?.isLoading = false
                
                if case .failure(let error) = completion {
                    self?.errorMessage = "Failed to load products: \(error.localizedDescription)"
                }
            },
            receiveValue: { [weak self] productDTOs in
                guard let self = self else { return }
                
                // Convert DTOs to SwiftData models
                var newProducts: [Product] = []
                
                for dto in productDTOs {
                    let product = Product(
                        productId: dto.product_id,
                        title: dto.title,
                        brand: dto.brand,
                        price: dto.price,
                        imageUrl: dto.image_url,
                        category: category,
                        styleType: dto.style_type,
                        primaryColor: dto.primary_color,
                        fabric: dto.fabric,
                        fitType: dto.fit_type,
                        availableSizes: dto.available_sizes ?? [],
                        matchScore: dto.match_score,
                        matchReasons: dto.match_reasons ?? []
                    )
                    
                    self.modelContext.insert(product)
                    newProducts.append(product)
                }
                
                self.products = newProducts
                self.currentProductIndex = 0
            }
        )
        .store(in: &cancellables)
    }
    
    func nextProduct() {
        if currentProductIndex < products.count - 1 {
            currentProductIndex += 1
        }
    }
    
    func previousProduct() {
        if currentProductIndex > 0 {
            currentProductIndex -= 1
        }
    }
    
    func likeCurrentProduct() {
        guard currentProductIndex < products.count else { return }
        
        let product = products[currentProductIndex]
        addToTrials(product)
        nextProduct()
    }
    
    func dislikeCurrentProduct() {
        nextProduct()
    }
    
    func addToTrials(_ product: Product) {
        guard let userPersona = userPersona, let userPhotoData = userPersona.userPhoto else {
            print("Error: User photo not available")
            return
        }
        
        let trial = Trial(
            productId: product.productId,
            status: .processing,
            product: product
        )
        
        modelContext.insert(trial)
        
        // Call the API to generate a virtual try-on image
        APIService.shared.generateVirtualTryOn(
            userImageData: userPhotoData,
            productId: product.productId
        )
        .sink(
            receiveCompletion: { [weak self] completion in
                if case .failure(let error) = completion {
                    print("Error generating try-on image: \(error.localizedDescription)")
                    
                    // Update trial status to failed
                    trial.status = .failed
                    try? self?.modelContext.save()
                }
            },
            receiveValue: { [weak self] base64Image in
                guard let self = self, let imageData = Data(base64Encoded: base64Image) else {
                    trial.status = .failed
                    try? self?.modelContext.save()
                    return
                }
                
                // Update trial with the try-on image
                trial.tryOnImageData = imageData
                trial.status = .completed
                
                // Save changes
                try? self.modelContext.save()
            }
        )
        .store(in: &cancellables)
    }
    
    func provideFeedback(_ feedback: String) {
        guard let userPersona = userPersona, currentProductIndex < products.count else { return }
        
        let product = products[currentProductIndex]
        
        // Process feedback and get dislike tags
        APIService.shared.processFeedback(
            userId: userPersona.userId,
            feedback: feedback,
            productId: product.productId
        )
        .sink(
            receiveCompletion: { completion in
                if case .failure(let error) = completion {
                    print("Error processing feedback: \(error.localizedDescription)")
                }
            },
            receiveValue: { [weak self] dislikeTags in
                guard let self = self else { return }
                
                // Update user persona with new dislike tags
                userPersona.dislikedTags.append(contentsOf: dislikeTags)
                
                // Remove duplicates
                userPersona.dislikedTags = Array(Set(userPersona.dislikedTags))
                
                // Save changes
                try? self.modelContext.save()
                
                print("Feedback processed for \(product.title). Added dislike tags: \(dislikeTags)")
            }
        )
        .store(in: &cancellables)
    }
}

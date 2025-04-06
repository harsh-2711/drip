//
//  SpecificViewModel.swift
//  drip-ios
//
//  Created by Harsh Patel on 04/04/25.
//

import Foundation
import SwiftUI
import Combine
import SwiftData

class SpecificViewModel: ObservableObject {
    @Published var searchQuery: String = ""
    @Published var searchImage: UIImage?
    @Published var searchImageData: Data?
    @Published var products: [Product] = []
    @Published var currentProductIndex: Int = 0
    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var showingImagePicker = false
    
    private var cancellables = Set<AnyCancellable>()
    private let modelContext: ModelContext
    private var userPersona: UserPersona?
    
    init(modelContext: ModelContext) {
        self.modelContext = modelContext
        
        // Load user persona
        loadUserPersona()
    }
    
    private func loadUserPersona() {
        let descriptor = FetchDescriptor<UserPersona>()
        
        do {
            let personas = try modelContext.fetch(descriptor)
            userPersona = personas.first
            
            if let persona = userPersona {
                print("Loaded user persona - ID: \(persona.userId), gender: \(persona.gender ?? "nil")")
            } else {
                print("No user persona found in database")
            }
        } catch {
            print("Error fetching user persona: \(error)")
        }
    }
    
    func searchProducts(query: String, ref_image: String? = nil) {
        guard let userPersona = userPersona else {
            errorMessage = "User persona not found. Please complete onboarding first."
            print("Error: User persona not found when trying to search products")
            return
        }
        
        print("Searching products with user persona - ID: \(userPersona.userId), gender: \(userPersona.gender ?? "nil")")
        
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
        
        print("Sending user persona DTO to API - ID: \(userPersonaDTO.user_id), gender: \(userPersonaDTO.gender ?? "nil")")
        
        // Call the API to get recommendations based on the search query
        APIService.shared.getRecommendations(
            userPersona: userPersonaDTO,
            userPrompt: query,
            refImage: ref_image,
            limit: 10
        )
        .sink(
            receiveCompletion: { [weak self] completion in
                self?.isLoading = false
                
                if case .failure(let error) = completion {
                    self?.errorMessage = "Failed to search products: \(error.localizedDescription)"
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
                        category: dto.style_type ?? "Unknown",
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
    
    func searchWithImage() {
        guard let imageData = searchImageData else {
            errorMessage = "Please select an image first"
            return
        }
        
        // Convert image data to base64 string
        let base64Image = imageData.base64EncodedString()
        
        // Use the searchProducts function with the base64 image
        searchProducts(query: searchQuery, ref_image: base64Image)
    }
    
    func setSearchImage(_ image: UIImage) {
        // Resize image to max height of 2000px
        if let resizedImage = ImageUtils.resizeImage(image: image) {
            searchImage = resizedImage
            searchImageData = ImageUtils.compressImage(image: resizedImage)
        } else {
            searchImage = image
            searchImageData = ImageUtils.compressImage(image: image)
        }
        
        // Don't automatically search with the image
        // This will be done when the user clicks the submit button
    }
    
    private func createMockProductsForQuery(_ query: String) -> [Product] {
        // Create mock products based on the query
        // In a real app, this would be a search against the API
        
        let lowercaseQuery = query.lowercased()
        var mockProducts: [Product] = []
        
        // Add products that match the query
        if lowercaseQuery.contains("linen") || lowercaseQuery.contains("natural") {
            mockProducts.append(
                Product(
                    productId: "search1",
                    title: "Premium Linen Shirt",
                    brand: "EcoFabrics",
                    price: 79.99,
                    imageUrl: "https://example.com/linen-shirt.jpg",
                    category: StyleCategory.tops.rawValue,
                    styleType: "smart casual",
                    primaryColor: "off-white",
                    fabric: "linen",
                    fitType: "relaxed",
                    availableSizes: ["S", "M", "L", "XL"],
                    matchScore: 0.96,
                    matchReasons: ["Made from 100% natural linen", "Breathable fabric perfect for warm weather"]
                )
            )
            
            mockProducts.append(
                Product(
                    productId: "search2",
                    title: "Linen Blend Trousers",
                    brand: "EcoFabrics",
                    price: 89.99,
                    imageUrl: "https://example.com/linen-trousers.jpg",
                    category: StyleCategory.bottoms.rawValue,
                    styleType: "smart casual",
                    primaryColor: "beige",
                    fabric: "linen blend",
                    fitType: "relaxed",
                    availableSizes: ["28", "30", "32", "34", "36"],
                    matchScore: 0.94,
                    matchReasons: ["Natural linen blend fabric", "Relaxed fit for comfort"]
                )
            )
        }
        
        if lowercaseQuery.contains("cotton") || lowercaseQuery.contains("tshirt") || lowercaseQuery.contains("t-shirt") {
            mockProducts.append(
                Product(
                    productId: "search3",
                    title: "Organic Cotton T-Shirt",
                    brand: "EcoBasics",
                    price: 29.99,
                    imageUrl: "https://example.com/cotton-tshirt.jpg",
                    category: StyleCategory.tops.rawValue,
                    styleType: "casual",
                    primaryColor: "olive",
                    fabric: "organic cotton",
                    fitType: "regular",
                    availableSizes: ["XS", "S", "M", "L", "XL"],
                    matchScore: 0.92,
                    matchReasons: ["Made from 100% organic cotton", "Versatile basic for everyday wear"]
                )
            )
        }
        
        if lowercaseQuery.contains("dress") || lowercaseQuery.contains("maxi") {
            mockProducts.append(
                Product(
                    productId: "search4",
                    title: "Flowy Maxi Dress",
                    brand: "SummerEssentials",
                    price: 119.99,
                    imageUrl: "https://example.com/maxi-dress.jpg",
                    category: StyleCategory.onePiece.rawValue,
                    styleType: "casual",
                    primaryColor: "terracotta",
                    fabric: "viscose",
                    fitType: "flowy",
                    availableSizes: ["XS", "S", "M", "L"],
                    matchScore: 0.91,
                    matchReasons: ["Flowy silhouette perfect for summer", "Color matches your preferred palette"]
                )
            )
        }
        
        if lowercaseQuery.contains("kurta") || lowercaseQuery.contains("ethnic") {
            mockProducts.append(
                Product(
                    productId: "search5",
                    title: "Handcrafted Cotton Kurta",
                    brand: "IndianCrafts",
                    price: 69.99,
                    imageUrl: "https://example.com/kurta.jpg",
                    category: StyleCategory.tops.rawValue,
                    styleType: "traditional",
                    primaryColor: "off-white",
                    fabric: "handloom cotton",
                    fitType: "relaxed",
                    availableSizes: ["S", "M", "L", "XL"],
                    matchScore: 0.95,
                    matchReasons: ["Handcrafted by artisans", "Natural fabric with traditional design"]
                )
            )
        }
        
        // If no specific matches, return some default products
        if mockProducts.isEmpty {
            mockProducts = [
                Product(
                    productId: "default1",
                    title: "Classic White Shirt",
                    brand: "ModernMinimal",
                    price: 59.99,
                    imageUrl: "https://example.com/white-shirt.jpg",
                    category: StyleCategory.tops.rawValue,
                    styleType: "smart casual",
                    primaryColor: "white",
                    fabric: "cotton",
                    fitType: "regular",
                    availableSizes: ["S", "M", "L", "XL"],
                    matchScore: 0.85,
                    matchReasons: ["Versatile wardrobe essential", "Clean, minimal design"]
                ),
                Product(
                    productId: "default2",
                    title: "Slim Fit Chinos",
                    brand: "ModernMinimal",
                    price: 69.99,
                    imageUrl: "https://example.com/chinos.jpg",
                    category: StyleCategory.bottoms.rawValue,
                    styleType: "smart casual",
                    primaryColor: "navy",
                    fabric: "cotton twill",
                    fitType: "slim",
                    availableSizes: ["28", "30", "32", "34", "36"],
                    matchScore: 0.83,
                    matchReasons: ["Versatile smart casual staple", "Comfortable cotton twill fabric"]
                )
            ]
        }
        
        // Save to SwiftData
        for product in mockProducts {
            modelContext.insert(product)
        }
        
        return mockProducts
    }
    
    private func createMockProductsForImageSearch() -> [Product] {
        // In a real app, this would analyze the image and find similar products
        // For now, we'll just return some mock products
        
        let mockProducts = [
            Product(
                productId: "img1",
                title: "Textured Linen Shirt",
                brand: "EcoFabrics",
                price: 89.99,
                imageUrl: "https://example.com/textured-shirt.jpg",
                category: StyleCategory.tops.rawValue,
                styleType: "smart casual",
                primaryColor: "beige",
                fabric: "linen",
                fitType: "relaxed",
                availableSizes: ["S", "M", "L", "XL"],
                matchScore: 0.97,
                matchReasons: ["Similar to your uploaded image", "Natural fabric with textured finish"]
            ),
            Product(
                productId: "img2",
                title: "Linen Blend Overshirt",
                brand: "ModernMinimal",
                price: 99.99,
                imageUrl: "https://example.com/overshirt.jpg",
                category: StyleCategory.tops.rawValue,
                styleType: "smart casual",
                primaryColor: "olive",
                fabric: "linen blend",
                fitType: "oversized",
                availableSizes: ["S", "M", "L", "XL"],
                matchScore: 0.94,
                matchReasons: ["Similar style to your uploaded image", "Versatile layering piece"]
            ),
            Product(
                productId: "img3",
                title: "Textured Weave Shirt",
                brand: "SummerEssentials",
                price: 79.99,
                imageUrl: "https://example.com/textured-weave.jpg",
                category: StyleCategory.tops.rawValue,
                styleType: "casual",
                primaryColor: "off-white",
                fabric: "cotton blend",
                fitType: "regular",
                availableSizes: ["S", "M", "L", "XL"],
                matchScore: 0.91,
                matchReasons: ["Similar texture to your uploaded image", "Breathable fabric for comfort"]
            )
        ]
        
        // Save to SwiftData
        for product in mockProducts {
            modelContext.insert(product)
        }
        
        return mockProducts
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
        let trial = Trial(
            productId: product.productId,
            status: .pending,
            product: product
        )
        
        modelContext.insert(trial)
        
        // In a real app, this would send a request to the backend to generate a try-on image
        // For now, we'll just simulate it with a delay
        DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) { [weak self] in
            guard let self = self else { return }
            
            // Update trial status
            trial.status = .completed
            
            // Save changes
            try? self.modelContext.save()
        }
    }
    
    func provideFeedback(_ feedback: String) {
        guard let userPersona = userPersona, currentProductIndex < products.count else { return }
        
        let product = products[currentProductIndex]
        
        // In a real app, this would send the feedback to the backend
        // For now, we'll just print it
        print("Feedback for \(product.title): \(feedback)")
    }
}

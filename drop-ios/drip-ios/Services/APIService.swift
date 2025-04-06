//
//  APIService.swift
//  drip-ios
//
//  Created by Harsh Patel on 04/04/25.
//

import Foundation
import Combine

// Response models
struct HealthResponse: Decodable {
    let status: String
    let timestamp: String
    let version: String
}

struct UserPersonaResponse: Decodable {
    let userPersona: UserPersonaDTO
}

// Add a new response model for the stylist/persona endpoint
struct StylistPersonaResponse: Decodable {
    let success: Bool
    let userPersona: UserPersonaDTO
}

struct StylistRecommendationsResponse: Decodable {
    let success: Bool
    let count: Int
    let recommendations: [ProductDTO]
}

struct FeedbackResponse: Decodable {
    let success: Bool
    let dislike_tags: [String]
}

struct SizeRecommendationResponse: Decodable {
    let sizeRecommendation: SizeRecommendationDTO
}

struct FitAdviceResponse: Decodable {
    let success: Bool
    let recommended_size: String
    let fitting_advice: String
}

struct VisualizationResponse: Decodable {
    let success: Bool
    let image: String
}

// DTO models
struct UserPersonaDTO: Codable {
    let user_id: String
    let gender: String?
    let body_shape: String?
    let skin_tone: String?
    let undertone: String?
    let best_fits: [String]
    let best_colors: [String]
    let ideal_size: IdealSizeDTO
    let preferred_colors: [String]
    let preferred_fits: [String]
    let disliked_tags: [String]
    let loved_tags: [String]
    let occasions: [String]
    let style_keywords: [String]
    let recent_feedback: RecentFeedbackDTO
}

struct RecentFeedbackDTO: Codable {
    let liked: [String]
    let disliked: [String]
}

struct IdealSizeDTO: Codable {
    let tops: String
    let bottoms: String
}

struct ProductDTO: Codable {
    let id: Int
    let product_id: String
    let title: String
    let description: String?
    let price: Double
    let currency: String
    let available_sizes: [String]?
    let tags: [String]?
    let product_url: String?
    let image_urls: [String]
    let style_type: String?
    let aesthetic: String?
    let primary_color: String?
    let fabric: String?
    let cut: String?
    let gender: String?
    let fit_type: String?
    let occasion: [String]?
    let similarity_score: Double?
    let recommendation_reason: String?
    let BrandId: Int?
    let Brand: BrandDTO?
    let FitInsight: FitInsightDTO?
    
    // For backward compatibility with existing code
    var image_url: String {
        return image_urls.first ?? ""
    }
    
    var match_score: Double? {
        return similarity_score
    }
    
    var match_reasons: [String]? {
        return recommendation_reason != nil ? [recommendation_reason!] : nil
    }
    
    var brand: String {
        return Brand?.name ?? ""
    }
}

struct BrandDTO: Codable {
    let id: Int
    let name: String
    let url: String?
    let country: String?
    let style_tags: [String]?
    let homepage_type: String?
    let rating_estimate: Double?
    let created_at: String?
    let updated_at: String?
    let createdAt: String?
    let updatedAt: String?
}

struct FitInsightDTO: Codable {
    let id: Int
    let fit_consensus: String?
    let size_recommendation: String?
    let common_complaints: [String]?
    let body_type_insights: [String: String]?
    let confidence_score: Double?
    let created_at: String?
    let updated_at: String?
    let createdAt: String?
    let updatedAt: String?
    let ProductId: Int?
}

struct FeedbackInsightsDTO: Codable {
    let likedFeatures: [String]
    let dislikedFeatures: [String]
    let preferredAlternatives: [String]
}

struct SizeRecommendationDTO: Codable {
    let recommended_size: String
    let confidence_level: String
    let alternative_size: String?
    let fit_notes: String?
    let sizing_advice: String?
}

struct VisualizationDTO: Codable {
    let prompt: String
    let imageUrl: String
    let format: String
    let products: [String]
}

// Request models
struct UserPersonaRequest: Encodable {
    let userId: String
    let imageBase64: String // base64 encoded image
    let attributes: [String]? // Optional array of style attributes
}

struct RecommendationsRequest: Encodable {
    let userPersona: UserPersonaDTO
    let category: String?
    let dislike_tags: [String]?
    let price_min: Double?
    let price_max: Double?
    let loved_colors: [String]?
    let loved_fits: [String]?
    let user_prompt: String?
    let ref_image: String?
    let limit: Int?
}

struct FeedbackRequest: Encodable {
    let userId: String
    let feedback: String
    let productId: String
}

struct FitAdviceRequest: Encodable {
    let productId: String
    let userPersona: UserPersonaDTO
}

struct VisualizationRequest: Encodable {
    let userImageBase64: String // base64 encoded image
    let productId: String
}

// API Service
class APIService {
    static let shared = APIService()
    
    private init() {}
    
    // Health check
    func checkHealth() -> AnyPublisher<HealthResponse, NetworkError> {
        return NetworkService.shared.get(endpoint: "health")
            .receive(on: DispatchQueue.main) // Ensure callbacks run on main thread
            .eraseToAnyPublisher()
    }
    
    // Generate user persona from image
    func generateUserPersona(userId: String, userImageData: Data, attributes: [String]? = nil) -> AnyPublisher<UserPersonaDTO, NetworkError> {
        let base64Image = userImageData.base64EncodedString()
        let request = UserPersonaRequest(
            userId: userId,
            imageBase64: base64Image,
            attributes: attributes
        )
        
        return NetworkService.shared.post(endpoint: "stylist/persona", body: request)
            .map { (response: StylistPersonaResponse) in
                return response.userPersona
            }
            .receive(on: DispatchQueue.main) // Ensure callbacks run on main thread
            .eraseToAnyPublisher()
    }
    
    // Get recommendations
    func getRecommendations(
        userPersona: UserPersonaDTO,
        category: String? = nil,
        lovedColors: [String]? = nil,
        lovedFits: [String]? = nil,
        dislikeTags: [String]? = nil,
        userPrompt: String? = nil,
        refImage: String? = nil,
        priceMin: Double? = nil,
        priceMax: Double? = nil,
        limit: Int = 5
    ) -> AnyPublisher<[ProductDTO], NetworkError> {
        let request = RecommendationsRequest(
            userPersona: userPersona,
            category: category,
            dislike_tags: dislikeTags,
            price_min: priceMin,
            price_max: priceMax,
            loved_colors: lovedColors,
            loved_fits: lovedFits,
            user_prompt: userPrompt,
            ref_image: refImage,
            limit: limit
        )
        
        return NetworkService.shared.post(endpoint: "stylist/recommendations", body: request)
            .map { (response: StylistRecommendationsResponse) in
                return response.recommendations
            }
            .receive(on: DispatchQueue.main) // Ensure callbacks run on main thread
            .eraseToAnyPublisher()
    }
    
    // Process feedback and get dislike tags
    func processFeedback(userId: String, feedback: String, productId: String) -> AnyPublisher<[String], NetworkError> {
        let request = FeedbackRequest(
            userId: userId,
            feedback: feedback,
            productId: productId
        )
        
        return NetworkService.shared.post(endpoint: "feedback/refine", body: request)
            .map { (response: FeedbackResponse) in
                return response.dislike_tags
            }
            .receive(on: DispatchQueue.main) // Ensure callbacks run on main thread
            .eraseToAnyPublisher()
    }
    
    // Get fit advice
    func getFitAdvice(productId: String, userPersona: UserPersonaDTO) -> AnyPublisher<FitAdviceResponse, NetworkError> {
        let request = FitAdviceRequest(
            productId: productId,
            userPersona: userPersona
        )
        
        return NetworkService.shared.post(endpoint: "fit/advice", body: request)
            .map { (response: FitAdviceResponse) in
                return response
            }
            .receive(on: DispatchQueue.main) // Ensure callbacks run on main thread
            .eraseToAnyPublisher()
    }
    
    // Generate virtual try-on visualization
    func generateVirtualTryOn(userImageData: Data, productId: String) -> AnyPublisher<String, NetworkError> {
        let base64Image = userImageData.base64EncodedString()
        let request = VisualizationRequest(
            userImageBase64: base64Image,
            productId: productId
        )
        
        return NetworkService.shared.post(endpoint: "visual/outfit", body: request)
            .map { (response: VisualizationResponse) in
                return response.image
            }
            .receive(on: DispatchQueue.main) // Ensure callbacks run on main thread
            .eraseToAnyPublisher()
    }
}

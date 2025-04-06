//
//  ImageUtils.swift
//  drip-ios
//
//  Created by Harsh Patel on 04/04/25.
//

import Foundation
import UIKit
import SwiftUI

class ImageUtils {
    static func resizeImage(image: UIImage, targetHeight: CGFloat = 2000) -> UIImage? {
        let aspectRatio = image.size.width / image.size.height
        let targetWidth = targetHeight * aspectRatio
        
        let size = CGSize(width: targetWidth, height: targetHeight)
        let renderer = UIGraphicsImageRenderer(size: size)
        
        return renderer.image { context in
            image.draw(in: CGRect(origin: .zero, size: size))
        }
    }
    
    static func resizeToAspectRatio(image: UIImage, width: CGFloat = 1080, height: CGFloat = 1350) -> UIImage {
        // Calculate target size while maintaining aspect ratio
        let originalAspect = image.size.width / image.size.height
        let targetAspect = width / height
        
        var scaledSize = CGSize.zero
        
        if originalAspect > targetAspect {
            // Image is wider than target aspect ratio
            scaledSize.width = image.size.height * targetAspect
            scaledSize.height = image.size.height
        } else {
            // Image is taller than target aspect ratio
            scaledSize.width = image.size.width
            scaledSize.height = image.size.width / targetAspect
        }
        
        // Calculate crop rect to get the center portion of the image
        let x = (image.size.width - scaledSize.width) / 2.0
        let y = (image.size.height - scaledSize.height) / 2.0
        
        // Crop the image to the correct aspect ratio
        let cropRect = CGRect(x: x, y: y, width: scaledSize.width, height: scaledSize.height)
        guard let croppedCGImage = image.cgImage?.cropping(to: cropRect) else {
            return image // Return original if cropping fails
        }
        
        let croppedImage = UIImage(cgImage: croppedCGImage, scale: image.scale, orientation: image.imageOrientation)
        
        // Now resize to the target dimensions
        let finalSize = CGSize(width: width, height: height)
        let renderer = UIGraphicsImageRenderer(size: finalSize)
        
        return renderer.image { context in
            croppedImage.draw(in: CGRect(origin: .zero, size: finalSize))
        }
    }
    
    static func compressImage(image: UIImage, quality: CGFloat = 0.7) -> Data? {
        return image.jpegData(compressionQuality: quality)
    }
    
    static func loadImage(from url: URL, completion: @escaping (UIImage?) -> Void) {
        URLSession.shared.dataTask(with: url) { data, response, error in
            guard let data = data, error == nil else {
                completion(nil)
                return
            }
            
            let image = UIImage(data: data)
            DispatchQueue.main.async {
                completion(image)
            }
        }.resume()
    }
    
    static func loadImage(from urlString: String, completion: @escaping (UIImage?) -> Void) {
        guard let url = URL(string: urlString) else {
            completion(nil)
            return
        }
        
        loadImage(from: url, completion: completion)
    }
}

// SwiftUI Image extension for loading remote images
struct RemoteImage: View {
    @State private var image: UIImage?
    @State private var isLoading = true
    
    let url: String
    let placeholder: Image
    
    init(url: String, placeholder: Image = Image(systemName: "photo")) {
        self.url = url
        self.placeholder = placeholder
    }
    
    var body: some View {
        Group {
            if let image = image {
                Image(uiImage: image)
                    .resizable()
                    .aspectRatio(contentMode: .fill)
            } else if isLoading {
                placeholder
                    .resizable()
                    .aspectRatio(contentMode: .fit)
                    .overlay(
                        ProgressView()
                            .progressViewStyle(CircularProgressViewStyle())
                    )
            } else {
                placeholder
                    .resizable()
                    .aspectRatio(contentMode: .fit)
            }
        }
        .onAppear {
            loadImage()
        }
    }
    
    private func loadImage() {
        isLoading = true
        ImageUtils.loadImage(from: url) { loadedImage in
            self.image = loadedImage
            self.isLoading = false
        }
    }
}

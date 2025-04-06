//
//  ProductCard.swift
//  drip-ios
//
//  Created by Harsh Patel on 06/04/25.
//

import SwiftUI

struct ProductCard: View {
    let product: Product
    var offset: CGSize = .zero
    var color: Color = .white
    let onFeedback: () -> Void
    
    var body: some View {
        // Main card container
        ZStack {
            // Card content
            VStack(spacing: 0) {
                // Product image container
                ZStack(alignment: .bottomTrailing) {
                    // Background rectangle
                    Rectangle()
                        .fill(Theme.Colors.background)
                        .aspectRatio(1, contentMode: .fit)
                    
                    // Product image
                    AsyncImage(url: URL(string: product.imageUrl)) { phase in
                        switch phase {
                        case .empty:
                            Rectangle()
                                .fill(Theme.Colors.background)
                                .frame(maxWidth: .infinity, maxHeight: 300)
                        case .success(let image):
                            image
                                .resizable()
                                .aspectRatio(contentMode: .fill)
                                .frame(maxWidth: .infinity, maxHeight: 300)
                        case .failure:
                            Image(systemName: "photo")
                                .font(.system(size: 40))
                                .foregroundColor(Theme.Colors.secondaryText)
                        @unknown default:
                            EmptyView()
                        }
                    }
                    
                    // Feedback button
                    Button(action: onFeedback) {
                        Image(systemName: "bubble.left.fill")
                            .font(.system(size: 16))
                            .foregroundColor(.white)
                            .padding(8)
                            .background(Theme.Colors.primary)
                            .clipShape(Circle())
                            .padding(Theme.Spacing.medium)
                    }
                }
                
                // Product info
                VStack(alignment: .leading, spacing: Theme.Spacing.small) {
                    Text(product.title)
                        .font(Theme.Typography.headline)
                        .foregroundColor(Theme.Colors.text)
                        .lineLimit(1)
                    
                    Text(product.brand)
                        .font(Theme.Typography.subheadline)
                        .foregroundColor(Theme.Colors.secondaryText)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding()
                .background(Theme.Colors.background)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .cornerRadius(Theme.Radius.large)
            
            // Overlay for LIKE/NOPE indicators
            ZStack {
                // LIKE
                if offset.width > 0 {
                    Text("🤑")
                        .font(.system(size: 38, weight: .bold))
                        .foregroundColor(Theme.Colors.success)
                        .rotationEffect(.degrees(-30))
                        .opacity(Double(min(abs(offset.width) / 100, 1.0)))
                        .padding(.leading, 35)
                        .padding(.top, 30)
                        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
                }
                
                // NOPE
                if offset.width < 0 {
                    Text("👎")
                        .font(.system(size: 38, weight: .bold))
                        .foregroundColor(Theme.Colors.error)
                        .rotationEffect(.degrees(20))
                        .opacity(Double(min(abs(offset.width) / 100, 1.0)))
                        .padding(.trailing, 35)
                        .padding(.top, 30)
                        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topTrailing)
                }
            }
        }
        .frame(maxWidth: 300, maxHeight: 300)
//        .padding()
        .offset(offset)
        .rotationEffect(.degrees(Double(offset.width / 20)))
        .animation(.interactiveSpring(), value: offset)
    }
}

#Preview {
    ProductCard(product: Product(productId: "123", title: "Black Jeans", brand: "Gucci", price: 500, currency: "USD", imageUrl: "https://media.gucci.com/style/DarkGray_Center_0_0_2400x2400/1727889311/789232_XDC6S_4032_001_100_0000_Light-Lasered-tapered-denim-trouser.jpg", category: "Jeans", matchReasons: []), offset: CGSize(width: 0, height: 0), color: Color.blue) {
    }
}

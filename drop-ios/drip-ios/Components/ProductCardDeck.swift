//
//  ProductCardDeck.swift
//  drip-ios
//
//  Created by Harsh Patel on 06/04/25.
//

import SwiftUI

struct ProductCardDeck: View {
    let products: [Product]
    @Binding var currentIndex: Int
    let onLike: () -> Void
    let onDislike: () -> Void
    let onFeedback: () -> Void
    
    @State private var offset = CGSize.zero
    @State private var color: Color = .white
    @State private var previousCardOffset: CGSize = .zero
    
    var body: some View {
        ZStack {
            ForEach(products.indices.reversed(), id: \.self) { index in
                if index >= currentIndex && index <= currentIndex + 2 {
                    ProductCard(
                        product: products[index],
                        offset: index == currentIndex ? offset : .zero,
                        color: index == currentIndex ? color : .white,
                        onFeedback: onFeedback
                    )
                    .scaleEffect(index == currentIndex ? 1.0 : 0.95)
                    .offset(y: CGFloat(index - currentIndex) * 10)
                    .zIndex(Double(products.count - index))
                    .gesture(
                        index == currentIndex ?
                            DragGesture()
                                .onChanged { gesture in
                                    offset = gesture.translation
                                    withAnimation(.easeInOut(duration: 0.2)) {
                                        color = offset.width > 0 ? Theme.Colors.success : Theme.Colors.error
                                    }
                                }
                                .onEnded { gesture in
                                    withAnimation(.spring(response: 0.3, dampingFraction: 0.7)) {
                                        if abs(gesture.translation.width) > 100 {
                                            if gesture.translation.width > 0 {
                                                offset = CGSize(width: 500, height: 0)
                                                onLike()
                                            } else {
                                                offset = CGSize(width: -500, height: 0)
                                                onDislike()
                                            }
                                        } else {
                                            offset = .zero
                                            color = .white
                                        }
                                    }
                                }
                            : nil
                    )
                }
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .padding(.horizontal, 40)
        .padding(.vertical, 60)
        .onChange(of: currentIndex) { _, _ in
            // Reset offset and color when moving to a new card
            offset = .zero
            color = .white
        }
    }
}

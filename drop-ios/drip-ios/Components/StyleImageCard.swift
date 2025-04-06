//
//  StyleImageCard.swift
//  drip-ios
//
//  Created by Harsh Patel on 06/04/25.
//

import SwiftUI

struct StyleImageCard: View {
    let styleImage: StyleImage
    let isSelected: Bool
    let onTap: () -> Void
    
    var body: some View {
        VStack {
            ZStack {
                Rectangle()
                    .fill(Theme.Colors.secondaryBackground)
                    .cornerRadius(Theme.Radius.medium)
                    .frame(width: 160, height: 220)
                
                Image(styleImage.imageName)
                    .resizable()
                    .aspectRatio(contentMode: .fill)
                    .frame(width: 160, height: 220)
                    .clipped()
                    .cornerRadius(Theme.Radius.medium)
                
                if isSelected {
                    ZStack {
                        Circle()
                            .fill(Theme.Colors.primary)
                            .frame(width: 30, height: 30)
                        
                        Image(systemName: "checkmark")
                            .font(.system(size: 16, weight: .bold))
                            .foregroundColor(.white)
                    }
                    .position(x: 140, y: 20)
                }
                
                // Add a subtle overlay when selected
                if isSelected {
                    Rectangle()
                        .fill(Color.black.opacity(0.2))
                        .cornerRadius(Theme.Radius.medium)
                        .frame(height: 220)
                }
            }
            .overlay(
                RoundedRectangle(cornerRadius: Theme.Radius.medium)
                    .stroke(isSelected ? Theme.Colors.primary : Color.clear, lineWidth: 2)
            )
        }
        .onTapGesture {
            withAnimation {
                onTap()
            }
        }
    }
}


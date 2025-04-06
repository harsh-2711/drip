//
//  LoadingTextView.swift
//  drip-ios
//
//  Created by Harsh Patel on 06/04/25.
//

import SwiftUI

struct LoadingTextView: View {
    @State private var currentTextIndex = 0
    @State private var opacity = 0.0
    
    private let loadingTexts = [
        "You look awesome today ✨",
        "Cooking up final changes 👩‍🍳",
        "Making your dope style guide 🧥",
        "Just adding final touches ✨",
        "Analyzing your preferences 🧐",
        "Creating your personalized style 🎨",
        "Almost there! 🚀"
    ]
    
    var body: some View {
        Text(loadingTexts[currentTextIndex])
            .font(Theme.Typography.body)
            .foregroundColor(Theme.Colors.secondaryText)
            .multilineTextAlignment(.center)
            .padding(.horizontal)
            .opacity(opacity)
            .onAppear {
                startAnimation()
            }
    }
    
    private func startAnimation() {
        // Initial animation
        withAnimation(.easeIn(duration: 0.5)) {
            opacity = 1.0
        }
        
        // Set up timer to change text every 3 seconds
        Timer.scheduledTimer(withTimeInterval: 5.0, repeats: true) { _ in
            // Fade out
            withAnimation(.easeOut(duration: 0.5)) {
                opacity = 0.0
            }
            
            // Change text after fade out
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                currentTextIndex = (currentTextIndex + 1) % loadingTexts.count
                
                // Fade in
                withAnimation(.easeIn(duration: 0.5)) {
                    opacity = 1.0
                }
            }
        }
    }
}


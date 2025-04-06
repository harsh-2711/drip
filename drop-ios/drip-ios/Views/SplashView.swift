//
//  SplashView.swift
//  drip-ios
//
//  Created by Harsh Patel on 04/04/25.
//

import SwiftUI

struct SplashView: View {
    @State private var isActive = false
    @State private var opacity = 0.0
    @State private var scale: CGFloat = 0.8
    
    var body: some View {
        ZStack {
            Color(UIColor.systemBackground)
                .ignoresSafeArea()
            
            Image(.splashBackground).blur(radius: 10)
            
            VStack(spacing: Theme.Spacing.large) {
                Text("DRIP")
                    .font(.system(size: 60, weight: .bold, design: .serif))
                    .foregroundColor(Color.white)
                
                Text("Hyper-personalized Fashion")
                    .font(Theme.Typography.title3)
                    .foregroundColor(Color.white)
                
                Spacer()
                    .frame(height: Theme.Spacing.xxl)
                
                Button(action: {
                    withAnimation {
                        isActive = true
                    }
                }) {
                    Text("Explore")
                        .font(Theme.Typography.headline)
                        .frame(minWidth: 200)
                }
                .primaryButtonStyle()
            }
            .padding()
            .scaleEffect(scale)
            .opacity(opacity)
            .onAppear {
                withAnimation(.easeInOut(duration: 1.0)) {
                    opacity = 1.0
                    scale = 1.0
                }
            }
        }
        .fullScreenCover(isPresented: $isActive) {
            OnboardingView()
        }
    }
}

#Preview {
    SplashView()
}

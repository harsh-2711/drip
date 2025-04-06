//
//  Theme.swift
//  drip-ios
//
//  Created by Harsh Patel on 04/04/25.
//

import SwiftUI

struct Theme {
    // MARK: - Colors
    struct Colors {
        // Primary colors
        static let primary = Color.black
        static let secondary = Color(UIColor.secondarySystemBackground)
        static let background = Color(UIColor.systemBackground)
        static let secondaryBackground = Color(UIColor.secondarySystemBackground)
        
        // Text colors
        static let text = Color(UIColor.label)
        static let secondaryText = Color(UIColor.secondaryLabel)
        static let tertiaryText = Color(UIColor.tertiaryLabel)
        
        // UI element colors
        static let separator = Color(UIColor.separator)
        static let tint = Color.accentColor
        
        // Status colors
        static let success = Color.green
        static let warning = Color.yellow
        static let error = Color.red
        static let info = Color.blue
    }
    
    // MARK: - Typography
    struct Typography {
        // Title styles
        static let largeTitle = Font.largeTitle
        static let title = Font.title
        static let title2 = Font.title2
        static let title3 = Font.title3
        
        // Body styles
        static let body = Font.body
        static let bodyBold = Font.body.bold()
        static let bodyItalic = Font.body.italic()
        
        // Caption styles
        static let caption = Font.caption
        static let caption2 = Font.caption2
        
        // Headline styles
        static let headline = Font.headline
        static let subheadline = Font.subheadline
    }
    
    // MARK: - Spacing
    struct Spacing {
        static let xxs: CGFloat = 2
        static let xs: CGFloat = 4
        static let small: CGFloat = 8
        static let medium: CGFloat = 16
        static let large: CGFloat = 24
        static let xl: CGFloat = 32
        static let xxl: CGFloat = 48
        static let xxxl: CGFloat = 64
    }
    
    // MARK: - Radius
    struct Radius {
        static let small: CGFloat = 4
        static let medium: CGFloat = 8
        static let large: CGFloat = 12
        static let xl: CGFloat = 16
        static let xxl: CGFloat = 24
        static let circle: CGFloat = 999
    }
    
    // MARK: - Animation
    struct Animation {
        static let standard = SwiftUI.Animation.easeInOut(duration: 0.3)
        static let quick = SwiftUI.Animation.easeInOut(duration: 0.15)
        static let slow = SwiftUI.Animation.easeInOut(duration: 0.5)
    }
    
    // MARK: - Shadows
    struct Shadows {
        static let small = (color: Color.black.opacity(0.1), radius: 4.0, x: 0.0, y: 2.0)
        static let medium = (color: Color.black.opacity(0.15), radius: 8.0, x: 0.0, y: 4.0)
        static let large = (color: Color.black.opacity(0.2), radius: 16.0, x: 0.0, y: 8.0)
    }
}

// MARK: - View Extensions
extension View {
    func primaryButtonStyle() -> some View {
        self
            .padding(.horizontal, Theme.Spacing.xxl)
            .padding(.vertical, Theme.Spacing.medium)
            .background(Theme.Colors.primary)
            .foregroundColor(.white)
            .cornerRadius(Theme.Radius.large)
            .shadow(color: Theme.Colors.primary.opacity(0.2), radius: 5, x: 0, y: 3)
    }
    
    func secondaryButtonStyle() -> some View {
        self
            .padding(.horizontal, Theme.Spacing.large)
            .padding(.vertical, Theme.Spacing.medium)
            .background(Theme.Colors.secondaryBackground)
            .foregroundColor(Theme.Colors.primary)
            .cornerRadius(Theme.Radius.medium)
            .overlay(
                RoundedRectangle(cornerRadius: Theme.Radius.medium)
                    .stroke(Theme.Colors.primary, lineWidth: 1)
            )
    }

    func circularButtonStyle() -> some View {
        self
            .padding(.horizontal, Theme.Spacing.large)
            .padding(.vertical, Theme.Spacing.medium)
            .background(Theme.Colors.secondaryBackground)
            .foregroundColor(Theme.Colors.primary)
            .cornerRadius(Theme.Radius.xxl)
            .overlay(
                RoundedRectangle(cornerRadius: Theme.Radius.xxl)
                    .stroke(Theme.Colors.primary, lineWidth: 1)
            )
    }

    func cardStyle() -> some View {
        self
            .padding(Theme.Spacing.medium)
            .background(Theme.Colors.background)
            .cornerRadius(Theme.Radius.medium)
            .shadow(radius: 5, x: 0, y: 2)
    }
}

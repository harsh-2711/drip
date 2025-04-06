# Drip iOS App

Drip is a hyper-personalized fashion recommendation app that uses AI to provide tailored clothing suggestions based on user preferences, body shape, and skin tone.

## Architecture

The app follows the MVVM (Model-View-ViewModel) architecture pattern:

- **Models**: Data structures for the app
- **ViewModels**: Business logic and data processing
- **Views**: User interface components
- **Services**: API communication and data fetching
- **Utils**: Utility classes and extensions

## Features

- **Personalized Onboarding**: Capture user photos and style preferences
- **AI-Powered Recommendations**: Get clothing suggestions tailored to your style
- **Explore by Category**: Browse products by category
- **Search**: Find specific products by text or image
- **Virtual Try-On**: See how clothes would look on you
- **Size Recommendations**: Get personalized size and fit advice
- **Feedback System**: Provide feedback to improve recommendations

## Tech Stack

- **UI Framework**: SwiftUI
- **Local Storage**: SwiftData
- **Reactive Programming**: Combine
- **Networking**: URLSession
- **Image Handling**: UIKit integration
- **Theme**: Consistent styling using Apple's Human Interface Guidelines

## User Journey

1. **Splash Screen**: Introduction to the app
2. **Onboarding**:
   - Welcome screen
   - Photo upload (for body shape and skin tone analysis)
   - Style preference selection
   - AI persona creation
3. **Main Interface**:
   - Explore tab: Browse by category
   - Search tab: Find specific items
   - Trial Room: View and manage saved items

## Components

### Models
- `UserPersona`: User preferences and characteristics
- `StylePreference`: Style categories and preferences
- `Product`: Fashion item details
- `Trial`: Virtual try-on information

### ViewModels
- `OnboardingViewModel`: Manages the onboarding process
- `StylePreferenceViewModel`: Handles style preference selection
- `ExploreViewModel`: Manages category-based exploration
- `SpecificViewModel`: Handles search functionality
- `TrialRoomViewModel`: Manages virtual try-ons

### Views
- `SplashView`: Initial app screen
- `OnboardingView`: User onboarding flow
- `MainTabView`: Main app interface with tabs
- `ExploreView`: Category-based product browsing
- `SpecificView`: Search functionality
- `TrialRoomView`: Virtual try-on management

### Services
- `NetworkService`: Generic API communication
- `APIService`: Specific API endpoints for the Drip backend

### Utils
- `ImageUtils`: Image handling and processing
- `Theme`: Consistent styling across the app

## Getting Started

1. Clone the repository
2. Open the project in Xcode
3. Build and run the app on a simulator or device

## Backend Integration

The app is designed to work with the Drip backend API, which provides:
- User persona generation
- Product recommendations
- Feedback processing
- Size recommendations
- Visual generation

## Notes

- The app uses mock data for demonstration purposes
- In a production environment, it would connect to the actual Drip backend API

//
//  OnboardingView.swift
//  drip-ios
//
//  Created by Harsh Patel on 04/04/25.
//

import SwiftUI
import SwiftData
import AVFoundation

struct OnboardingView: View {
    @Environment(\.modelContext) private var modelContext
    @StateObject private var viewModel: OnboardingViewModel
    
    init() {
        // This is a workaround since we can't use @Environment in init
        // In a real app, we would use dependency injection
        let container = try! ModelContainer(for: UserPersona.self, StylePreference.self, Product.self, Trial.self)
        let context = ModelContext(container)
        _viewModel = StateObject(wrappedValue: OnboardingViewModel(modelContext: context))
    }
    
    var body: some View {
        ZStack {
            Color(UIColor.systemBackground)
                .ignoresSafeArea()
            
            switch viewModel.currentStep {
            case .welcome:
                welcomeView
            case .photoUpload:
                PhotoUploadView(viewModel: viewModel)
            case .stylePreference:
                StylePreferenceView(viewModel: viewModel)
            case .personaCreation:
                personaCreationView
            case .complete:
                MainTabView()
                    .transition(.opacity)
            }
        }
    }
    
    private var welcomeView: some View {
        VStack(spacing: Theme.Spacing.large) {
            Spacer()
            
            Text("Drip")
                .font(.system(size: 60, weight: .bold, design: .serif))
                .foregroundColor(Theme.Colors.text)
            
            Text("Hyper-personalized Fashion")
                .font(Theme.Typography.title3).fontDesign(.serif)
                .foregroundColor(Theme.Colors.secondaryText)
                .multilineTextAlignment(.center)
                .padding(.horizontal)
            
            Spacer()
            
            Button(action: {
                withAnimation {
                    viewModel.nextStep()
                }
            }) {
                Text("Get Started")
                    .font(Theme.Typography.headline)
                    .frame(minWidth: 200)
            }
            .primaryButtonStyle()
            .padding(.bottom, Theme.Spacing.large)
        }
        .padding()
        .transition(.opacity)
    }
    
    private var personaCreationView: some View {
        VStack(spacing: Theme.Spacing.large) {
            Text("Creating Your Style Profile")
                .font(Theme.Typography.title)
                .foregroundColor(Theme.Colors.text)
                .padding(.top, Theme.Spacing.xxl)
            
            if viewModel.isLoading {
                VStack(spacing: Theme.Spacing.medium) {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle())
                        .scaleEffect(1.5)
                        .padding()
                    
                    // Animated loading text
                    LoadingTextView()
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
            } else if let error = viewModel.errorMessage {
                VStack(spacing: Theme.Spacing.medium) {
                    Image(systemName: "exclamationmark.triangle")
                        .font(.system(size: 50))
                        .foregroundColor(Theme.Colors.error)
                        .padding()
                    
                    Text(error)
                        .font(Theme.Typography.body)
                        .foregroundColor(Theme.Colors.error)
                        .multilineTextAlignment(.center)
                    
                    Button(action: {
                        viewModel.createUserPersona()
                    }) {
                        Text("Try Again")
                            .font(Theme.Typography.headline)
                    }
                    .primaryButtonStyle()
                    .padding(.top)
                }
                .padding()
            } else {
                // Success state - this will be shown briefly before moving to next view
                VStack(spacing: Theme.Spacing.large) {
                    Text("Your style profile is ready! 🎉")
                        .font(Theme.Typography.title2)
                        .foregroundColor(Theme.Colors.text)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal)
                    
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle())
                        .scaleEffect(1.5)
                        .padding()
                }
                .padding()
            }
            
            Spacer()
        }
        .padding()
        .transition(.opacity)
        .onAppear {
            // Automatically trigger persona creation when view appears
            viewModel.createUserPersona()
        }
    }
}

struct PhotoUploadView: View {
    @ObservedObject var viewModel: OnboardingViewModel
    @State private var showingImagePicker = false
    @State private var showingCamera = false
    @State private var showingActionSheet = false
    @State private var showingPermissionAlert = false
    
    var body: some View {
        VStack(spacing: Theme.Spacing.large) {
            Text("Upload your photo")
                .font(Theme.Typography.title).fontDesign(.serif)
                .foregroundColor(Theme.Colors.text)
                .padding(.top, Theme.Spacing.large)
            
            Text("This helps us recommend sassy clothes")
                .font(Theme.Typography.body).fontDesign(.serif)
                .foregroundColor(Theme.Colors.secondaryText)
                .multilineTextAlignment(.center)
                .padding(.horizontal)
            
            Spacer()
            
            if let photo = viewModel.userPhoto {
                Image(uiImage: photo)
                    .resizable()
                    .aspectRatio(4/5, contentMode: .fit)
                    .frame(maxHeight: 400)
                    .cornerRadius(Theme.Radius.large)
                    .padding()
            } else {
                ZStack {
                    Rectangle()
                        .fill(Theme.Colors.secondaryBackground)
                        .cornerRadius(Theme.Radius.large)
                        .aspectRatio(4/5, contentMode: .fit)
                        .frame(maxHeight: 400)
                    
                    VStack(spacing: Theme.Spacing.medium) {
                        Image(systemName: "person.fill")
                            .font(.system(size: 60))
                            .foregroundColor(Theme.Colors.secondaryText)
                        
                        Text("Tap to add a photo")
                            .font(Theme.Typography.body)
                            .foregroundColor(Theme.Colors.secondaryText)
                    }
                }
                .onTapGesture {
                    showingActionSheet = true
                }
                .padding()
            }
            
            Spacer()
            
            HStack(spacing: Theme.Spacing.large) {
                Button(action: {
                    withAnimation {
                        viewModel.previousStep()
                    }
                }) {
                    Image(systemName: "chevron.left")
                }
                .circularButtonStyle()
                
                Button(action: {
                    withAnimation {
                        viewModel.nextStep()
                    }
                }) {
                    Text("Next")
                        .font(Theme.Typography.headline)
                        .frame(minWidth: 100, maxWidth: 140)
                }
                .primaryButtonStyle()
                .disabled(viewModel.userPhoto == nil)
                .opacity(viewModel.userPhoto == nil ? 0.6 : 1.0)
            }
            .padding(.bottom, Theme.Spacing.large)
        }
        .padding()
        .actionSheet(isPresented: $showingActionSheet) {
            ActionSheet(
                title: Text("Select photo"),
                message: Text("Choose a source for your photo"),
                buttons: [
                    .default(Text("Camera")) {
                        checkCameraPermission()
                    },
                    .default(Text("Photo Library")) {
                        showingImagePicker = true
                    },
                    .cancel()
                ]
            )
        }
        .sheet(isPresented: $showingImagePicker) {
            ImagePicker(selectedImage: { image in
                viewModel.setUserPhoto(image)
            })
        }
        .sheet(isPresented: $showingCamera) {
            CameraPicker(selectedImage: { image in
                viewModel.setUserPhoto(image)
            })
        }
        .alert(isPresented: $showingPermissionAlert) {
            Alert(
                title: Text("Camera Access Required"),
                message: Text("Please allow camera access in Settings to take photos."),
                primaryButton: .default(Text("Open Settings")) {
                    if let settingsUrl = URL(string: UIApplication.openSettingsURLString) {
                        UIApplication.shared.open(settingsUrl)
                    }
                },
                secondaryButton: .cancel()
            )
        }
        .transition(.opacity)
    }
    
    private func checkCameraPermission() {
        switch AVCaptureDevice.authorizationStatus(for: .video) {
        case .authorized:
            showingCamera = true
        case .notDetermined:
            AVCaptureDevice.requestAccess(for: .video) { granted in
                DispatchQueue.main.async {
                    if granted {
                        showingCamera = true
                    } else {
                        showingPermissionAlert = true
                    }
                }
            }
        case .denied, .restricted:
            showingPermissionAlert = true
        @unknown default:
            showingPermissionAlert = true
        }
    }
}

struct StylePreferenceView: View {
    @ObservedObject var viewModel: OnboardingViewModel
    @Environment(\.modelContext) private var modelContext
    @StateObject private var styleViewModel: StylePreferenceViewModel
    @State private var shuffledStyleImages: [StyleImage] = []
    private var attributes: [String] = [
        "minimalist, classic, versatile, essential",
        "minimalist, classic, versatile, essential",
        "streetwear, bold-print, expressive, urban",
        "streetwear, bold-print, expressive, urban",
        "streetwear, bold-print, expressive, urban",
        "casual, oversized, streetwear, sporty",
        "casual, oversized, streetwear, sporty",
        "preppy, cozy, retro, relaxed-fit",
        "preppy, cozy, retro, relaxed-fit",
        "refined, minimalist, slim-fit, elegant",
        "refined, minimalist, slim-fit, elegant",
        "classic, tailored, preppy, crisp",
        "classic, tailored, preppy, crisp",
        "floral, tailored",
        "classic, tailored, office, crisp",
        "edgy, classic, fitted, moto-inspired",
        "sporty, military-inspired, cropped, casual",
        "utilitarian, boxy, durable",
        "utilitarian, boxy, durable",
        "utilitarian, boxy, durable",
        "draped, artisanal, avant-garde, cultural",
        "classic, timeless, versatile, denim",
        "classic, timeless, versatile, denim",
        "sleek, form-fitting, modern, rocker, skinny",
        "relaxed, flowy, avant-garde, bohemian",
        "relaxed, flowy, avant-garde, bohemian",
        "utilitarian, functional, streetwear, rugged",
        "formal, sharp, structured, sartorial",
        "athleisure, comfy, relaxed-fit, sporty",
        "athleisure, comfy, relaxed-fit, sporty",
        "edgy, statement, sleek, rocker",
        "textured, retro, heritage, casual",
        "textured, retro, heritage, casual",
        "vintage-inspired, dramatic, 70s-style, bold",
        "baggy, relaxed",
        "modern, trendy, ankle-length, tailored",
        "casual, summer, knee-length, smart",
        "sporty, summer, modern",
        "sporty, summer, modern",
        "sporty, summer, modern, short"
    ]
    
    init(viewModel: OnboardingViewModel) {
        self.viewModel = viewModel
        // This is a workaround since we can't use @Environment in init
        // In a real app, we would use dependency injection
        let container = try! ModelContainer(for: UserPersona.self, StylePreference.self, Product.self, Trial.self)
        let context = ModelContext(container)
        _styleViewModel = StateObject(wrappedValue: StylePreferenceViewModel(modelContext: context))
    }
    
    var body: some View {
        VStack(spacing: Theme.Spacing.medium) {
            Text("Select styles that resonate with you")
                .font(Theme.Typography.title2).fontDesign(.serif)
                .foregroundColor(Theme.Colors.text)
                .padding(.top, Theme.Spacing.large)
                .multilineTextAlignment(.center)
            
            ScrollView {
                LazyVGrid(columns: [
                    GridItem(.flexible(), spacing: Theme.Spacing.medium),
                    GridItem(.flexible(), spacing: Theme.Spacing.medium)
                ], spacing: Theme.Spacing.medium) {
                    ForEach(shuffledStyleImages) { styleImage in
                        StyleImageCard(
                            styleImage: styleImage,
                            isSelected: viewModel.selectedStylePreferences.contains(where: { $0.id == styleImage.id }),
                            onTap: {
                                viewModel.toggleStylePreference(styleImage.toStylePreference())
                            }
                        )
                    }
                }
                .padding()
            }
            
            HStack(spacing: Theme.Spacing.large) {
                Button(action: {
                    withAnimation {
                        viewModel.previousStep()
                    }
                }) {
                    Image(systemName: "chevron.left")
                }
                .circularButtonStyle()
                
                Button(action: {
                    withAnimation {
                        viewModel.nextStep()
                    }
                }) {
                    Text("Next")
                        .font(Theme.Typography.headline)
                        .frame(minWidth: 100, maxWidth: 140)
                }
                .primaryButtonStyle()
                .disabled(viewModel.selectedStylePreferences.isEmpty)
                .opacity(viewModel.selectedStylePreferences.isEmpty ? 0.6 : 1.0)
            }
            .padding(.bottom, Theme.Spacing.large)
        }
        .padding()
        .onAppear {
            loadShuffledStyleImages()
        }
        .transition(.opacity)
    }
    
    private func loadShuffledStyleImages() {
        // Create style images from s1 to s40
        var styleImages: [StyleImage] = []
        for i in 1...40 {
            let styleImage = StyleImage(
                id: "s\(i)",
                imageName: "s\(i)",
                attributes: attributes[i-1]
            )
            styleImages.append(styleImage)
        }
        
        // Shuffle the images
        shuffledStyleImages = styleImages.shuffled()
    }
}

struct StyleImage: Identifiable {
    let id: String
    let imageName: String
    let attributes: String
}

extension StyleImage {
    func toStylePreference() -> StylePreference {
        return StylePreference(
            id: self.id,
            name: "Style \(self.id.dropFirst())", // Remove the 's' prefix
            category: "All",
            attributes: self.attributes
        )
    }
}

#Preview {
    OnboardingView()
}

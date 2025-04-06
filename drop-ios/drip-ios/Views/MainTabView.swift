//
//  MainTabView.swift
//  drip-ios
//
//  Created by Harsh Patel on 04/04/25.
//

import SwiftUI
import SwiftData

struct MainTabView: View {
    @State private var selectedTab = 0
    @Environment(\.modelContext) private var modelContext
    
    var body: some View {
        TabView(selection: $selectedTab) {
            ExploreView(modelContext: modelContext)
                .tabItem {
                    Label("Explore", systemImage: "square.grid.2x2")
                }
                .tag(0)
            
            SpecificView(modelContext: modelContext)
                .tabItem {
                    Label("Search", systemImage: "magnifyingglass")
                }
                .tag(1)
            
            TrialRoomView(modelContext: modelContext)
                .tabItem {
                    Label("Trials", systemImage: "tshirt")
                }
                .tag(2)
        }
        .accentColor(Theme.Colors.primary)
    }
}

struct ExploreView: View {
    @StateObject private var viewModel: ExploreViewModel
    @State private var showingFeedbackSheet = false
    @State private var feedbackText = ""
    
    init(modelContext: ModelContext) {
        _viewModel = StateObject(wrappedValue: ExploreViewModel(modelContext: modelContext))
    }
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Category selection
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: Theme.Spacing.medium) {
                        ForEach(viewModel.categories, id: \.self) { category in
                            CategoryButton(
                                title: category,
                                isSelected: viewModel.selectedCategory == category,
                                action: {
                                    viewModel.selectCategory(category)
                                }
                            )
                        }
                    }
                    .padding(.horizontal)
                    .padding(.vertical, Theme.Spacing.medium)
                }
                .background(Theme.Colors.background)
                
                // Product cards
                ZStack {
                    if viewModel.isLoading {
                        ProgressView()
                            .progressViewStyle(CircularProgressViewStyle())
                            .scaleEffect(1.5)
                    } else if let error = viewModel.errorMessage {
                        VStack(spacing: Theme.Spacing.medium) {
                            Image(systemName: "exclamationmark.triangle")
                                .font(.system(size: 50))
                                .foregroundColor(Theme.Colors.error)
                            
                            Text(error)
                                .font(Theme.Typography.body)
                                .foregroundColor(Theme.Colors.error)
                                .multilineTextAlignment(.center)
                                .padding()
                        }
                    } else if viewModel.products.isEmpty {
                        VStack(spacing: Theme.Spacing.medium) {
                            Image(systemName: "tshirt")
                                .font(.system(size: 50))
                                .foregroundColor(Theme.Colors.secondaryText)
                            
                            if viewModel.selectedCategory == nil {
                                Text("Select a category to see products")
                                    .font(Theme.Typography.body)
                                    .foregroundColor(Theme.Colors.secondaryText)
                                    .multilineTextAlignment(.center)
                                    .padding()
                            } else {
                                Text("No products found for \(viewModel.selectedCategory ?? "")")
                                    .font(Theme.Typography.body)
                                    .foregroundColor(Theme.Colors.secondaryText)
                                    .multilineTextAlignment(.center)
                                    .padding()
                            }
                        }
                    } else {
                        ProductCardDeck(
                            products: viewModel.products,
                            currentIndex: $viewModel.currentProductIndex,
                            onLike: {
                                viewModel.likeCurrentProduct()
                            },
                            onDislike: {
                                viewModel.dislikeCurrentProduct()
                            },
                            onFeedback: {
                                showingFeedbackSheet = true
                            }
                        )
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                        .background(Theme.Colors.secondaryBackground)
                    }
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .background(
                    Theme.Colors.secondaryBackground
                        .edgesIgnoringSafeArea(.bottom)
                )
            }
            .navigationTitle("Explore")
            .sheet(isPresented: $showingFeedbackSheet) {
                FeedbackSheet(
                    product: viewModel.products.isEmpty ? nil : viewModel.products[viewModel.currentProductIndex],
                    feedbackText: $feedbackText,
                    onSubmit: {
                        viewModel.provideFeedback(feedbackText)
                        feedbackText = ""
                        showingFeedbackSheet = false
                    }
                )
            }
            .onAppear {
                // If we have categories but no selected category, select the first one
                if viewModel.selectedCategory == nil && !viewModel.categories.isEmpty {
                    viewModel.selectCategory(viewModel.categories[0])
                }
            }
        }
    }
}

struct SpecificView: View {
    @StateObject private var viewModel: SpecificViewModel
    @State private var showingFeedbackSheet = false
    @State private var feedbackText = ""
    @FocusState private var isSearchFocused: Bool
    
    init(modelContext: ModelContext) {
        _viewModel = StateObject(wrappedValue: SpecificViewModel(modelContext: modelContext))
    }
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Search bar
                HStack(spacing: 8) {
                    Button(action: {
                        viewModel.showingImagePicker = true
                    }) {
                        Image(systemName: "plus")
                            .frame(width: 32, height: 32)
                            .background(Color(.systemGray5))
                            .foregroundColor(.black)
                            .clipShape(Circle())
                    }

                    HStack(spacing: 8) {
                        if let searchImage = viewModel.searchImage {
                            Image(uiImage: searchImage)
                                .resizable()
                                .scaledToFill()
                                .frame(width: 24, height: 24)
                                .clipShape(Circle())
                                .overlay(
                                    Circle()
                                        .stroke(Color.gray.opacity(0.3), lineWidth: 1)
                                )
                        }
                        
                        TextField("matching shirts with black denims..", text: $viewModel.searchQuery)
                            .padding(8)
                            .focused($isSearchFocused)
                    }
                    .padding(8)
                    .background(Theme.Colors.secondaryBackground)
                    .clipShape(RoundedRectangle(cornerRadius: 20))
                    
                    Button(action: {
                        submitSearch()
                    }) {
                        Image(systemName: "arrow.up")
                            .foregroundColor(.white)
                            .frame(width: 32, height: 32)
                            .background(Color(.black))
                            .clipShape(Circle())
                    }
                }
                .padding()
                
                // Product cards
                ZStack {
                    if viewModel.isLoading {
                        ProgressView()
                            .progressViewStyle(CircularProgressViewStyle())
                            .scaleEffect(1.5)
                    } else if let error = viewModel.errorMessage {
                        VStack(spacing: Theme.Spacing.medium) {
                            Image(systemName: "exclamationmark.triangle")
                                .font(.system(size: 50))
                                .foregroundColor(Theme.Colors.error)
                            
                            Text(error)
                                .font(Theme.Typography.body)
                                .foregroundColor(Theme.Colors.error)
                                .multilineTextAlignment(.center)
                                .padding()
                        }
                    } else if viewModel.products.isEmpty {
                        VStack(spacing: Theme.Spacing.medium) {
                            Image(systemName: "magnifyingglass")
                                .font(.system(size: 50))
                                .foregroundColor(Theme.Colors.secondaryText)
                            
                            Text("Go wild, and find your style!")
                                .font(Theme.Typography.body)
                                .foregroundColor(Theme.Colors.secondaryText)
                                .multilineTextAlignment(.center)
                                .padding()
                        }
                    } else {
                        ProductCardDeck(
                            products: viewModel.products,
                            currentIndex: $viewModel.currentProductIndex,
                            onLike: {
                                viewModel.likeCurrentProduct()
                            },
                            onDislike: {
                                viewModel.dislikeCurrentProduct()
                            },
                            onFeedback: {
                                showingFeedbackSheet = true
                            }
                        )
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                        .background(Theme.Colors.secondaryBackground)
                    }
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .background(
                    Theme.Colors.secondaryBackground
                        .edgesIgnoringSafeArea(.bottom)
                )
            }
            .navigationTitle("Search")
            .sheet(isPresented: $viewModel.showingImagePicker) {
                ImagePicker(selectedImage: { image in
                    viewModel.setSearchImage(image)
                })
            }
            .sheet(isPresented: $showingFeedbackSheet) {
                FeedbackSheet(
                    product: viewModel.products.isEmpty ? nil : viewModel.products[viewModel.currentProductIndex],
                    feedbackText: $feedbackText,
                    onSubmit: {
                        viewModel.provideFeedback(feedbackText)
                        feedbackText = ""
                        showingFeedbackSheet = false
                    }
                )
            }
            .onAppear {
                // Focus the search field when the view appears
                isSearchFocused = true
            }
        }
    }
    
    private func submitSearch() {
        // Hide keyboard
        isSearchFocused = false
        
        // If we have an image, search with the image
        if viewModel.searchImage != nil {
            viewModel.searchWithImage()
        } else if !viewModel.searchQuery.isEmpty {
            // Otherwise search with the text query
            viewModel.searchProducts(query: viewModel.searchQuery)
        }
    }
}

struct TrialRoomView: View {
    @StateObject private var viewModel: TrialRoomViewModel
    @State private var showTrialDetailSheet = false
    
    init(modelContext: ModelContext) {
        _viewModel = StateObject(wrappedValue: TrialRoomViewModel(modelContext: modelContext))
    }
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Hand Out Garments button
                if !viewModel.trials.isEmpty {
                    Button(action: {
                        viewModel.clearAllTrials()
                    }) {
                        HStack {
                            Image(systemName: "arrow.triangle.2.circlepath")
                            Text("Hand Out Garments")
                                .font(Theme.Typography.headline)
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, Theme.Spacing.medium)
                    }
                    .foregroundColor(Theme.Colors.primary)
                    .background(Theme.Colors.secondaryBackground)
                    .cornerRadius(Theme.Radius.medium)
                    .padding(.horizontal)
                    .padding(.vertical, Theme.Spacing.medium)
                }
                
                if viewModel.trials.isEmpty {
                    VStack(spacing: Theme.Spacing.large) {
                        Image(systemName: "tshirt")
                            .font(.system(size: 60))
                            .foregroundColor(Theme.Colors.secondaryText)
                        
                        Text("Your trial room is empty")
                            .font(Theme.Typography.title3)
                            .foregroundColor(Theme.Colors.text)
                        
                        Text("Go and start swiping right...")
                            .font(Theme.Typography.body)
                            .foregroundColor(Theme.Colors.secondaryText)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal)
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else {
                    List {
                        ForEach(viewModel.trials) { trial in
                            TrialCell(
                                trial: trial,
                                isSelected: viewModel.selectedTrial?.id == trial.id,
                                onTap: {
                                    viewModel.selectTrial(trial)
                                    showTrialDetailSheet = true
                                }
                            )
                            .swipeActions {
                                Button(role: .destructive) {
                                    viewModel.removeTrial(trial)
                                } label: {
                                    Label("Delete", systemImage: "trash")
                                }
                            }
                        }
                    }
                    .listStyle(PlainListStyle())
                }
            }
            .navigationTitle("Trial Room")
            .onAppear {
                viewModel.loadTrials()
            }
            .sheet(isPresented: $showTrialDetailSheet) {
                if let selectedTrial = viewModel.selectedTrial {
                    TrialDetailSheet(
                        trial: selectedTrial,
                        sizeRecommendation: viewModel.sizeRecommendation,
                        fitNotes: viewModel.fitNotes,
                        isLoading: viewModel.isLoading,
                        onAddToCart: {
                            viewModel.addToCart(selectedTrial)
                            showTrialDetailSheet = false
                        },
                        onDismiss: {
                            showTrialDetailSheet = false
                        }
                    )
                }
            }
        }
    }
}

struct TrialDetailSheet: View {
    let trial: Trial
    let sizeRecommendation: String?
    let fitNotes: String?
    let isLoading: Bool
    let onAddToCart: () -> Void
    let onDismiss: () -> Void
    
    var body: some View {
        VStack(spacing: Theme.Spacing.medium) {
            // Header with close button
            HStack {
                Spacer()
                Button(action: onDismiss) {
                    Image(systemName: "xmark.circle.fill")
                        .font(.system(size: 24))
                        .foregroundColor(Theme.Colors.secondaryText)
                }
            }
            .padding(.horizontal)
            .padding(.top)
            
            // Try-on image
            if trial.status == .completed, let imageData = trial.tryOnImageData, let uiImage = UIImage(data: imageData) {
                Image(uiImage: uiImage)
                    .resizable()
                    .scaledToFit()
                    .frame(maxHeight: UIScreen.main.bounds.height * 0.5)
                    .cornerRadius(Theme.Radius.medium)
                    .padding(.horizontal)
            } else if trial.status == .pending || trial.status == .processing {
                ZStack {
                    Rectangle()
                        .fill(Theme.Colors.secondaryBackground)
                        .frame(height: UIScreen.main.bounds.height * 0.5)
                        .cornerRadius(Theme.Radius.medium)
                    
                    VStack(spacing: Theme.Spacing.medium) {
                        if trial.status == .pending {
                            Text("Pending")
                                .font(Theme.Typography.title3)
                                .foregroundColor(Theme.Colors.secondaryText)
                        } else {
                            ProgressView()
                                .progressViewStyle(CircularProgressViewStyle())
                                .scaleEffect(1.5)
                            
                            Text("Processing your try-on...")
                                .font(Theme.Typography.body)
                                .foregroundColor(Theme.Colors.secondaryText)
                        }
                    }
                }
                .padding(.horizontal)
            } else {
                Rectangle()
                    .fill(Theme.Colors.secondaryBackground)
                    .frame(height: UIScreen.main.bounds.height * 0.5)
                    .cornerRadius(Theme.Radius.medium)
                    .padding(.horizontal)
            }
            
            // Product info
            VStack(alignment: .leading, spacing: Theme.Spacing.small) {
                Text(trial.product?.title ?? "Product")
                    .font(Theme.Typography.title3)
                    .foregroundColor(Theme.Colors.text)
                
                Text(trial.product?.brand ?? "Brand")
                    .font(Theme.Typography.headline)
                    .foregroundColor(Theme.Colors.secondaryText)
                
                if let price = trial.product?.price, let currency = trial.product?.currency {
                    Text("\(price, specifier: "%.2f") \(currency)")
                        .font(Theme.Typography.headline)
                        .foregroundColor(Theme.Colors.primary)
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.horizontal)
            
            Divider()
                .padding(.horizontal)
            
            // Size recommendation
            VStack(alignment: .leading, spacing: Theme.Spacing.small) {
                if isLoading {
                    HStack {
                        ProgressView()
                            .progressViewStyle(CircularProgressViewStyle())
                        
                        Text("Generating size recommendation...")
                            .font(Theme.Typography.body)
                            .foregroundColor(Theme.Colors.secondaryText)
                            .padding(.leading)
                    }
                } else {
                    if let sizeRec = sizeRecommendation {
                        HStack {
                            Text("Recommended Size:")
                                .font(Theme.Typography.body)
                                .foregroundColor(Theme.Colors.secondaryText)
                            
                            Text(sizeRec)
                                .font(Theme.Typography.bodyBold)
                                .foregroundColor(Theme.Colors.text)
                        }
                    }
                    
                    if let notes = fitNotes {
                        Text(notes)
                            .font(Theme.Typography.body)
                            .foregroundColor(Theme.Colors.text)
                            .padding(.top, Theme.Spacing.small)
                            .lineLimit(2)
                    }
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.horizontal)
            
            Spacer()
            
            // Add to Cart button
            Button(action: onAddToCart) {
                Text("Add to Cart")
                    .font(Theme.Typography.headline)
            }
            .primaryButtonStyle()
            .padding(.horizontal)
            .padding(.bottom, Theme.Spacing.large)
        }
        .background(Theme.Colors.background)
        .gesture(
            DragGesture()
                .onEnded { gesture in
                    if gesture.translation.height > 100 {
                        onDismiss()
                    }
                }
        )
    }
}

struct CategoryButton: View {
    let title: String
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            Text(title)
                .font(Theme.Typography.headline)
                .padding(.horizontal, Theme.Spacing.medium)
                .padding(.vertical, Theme.Spacing.small)
                .background(isSelected ? Theme.Colors.primary : Theme.Colors.secondaryBackground)
                .foregroundColor(isSelected ? .white : Theme.Colors.text)
                .cornerRadius(Theme.Radius.medium)
        }
    }
}

struct TrialCell: View {
    let trial: Trial
    let isSelected: Bool
    let onTap: () -> Void
    
    var body: some View {
        HStack(spacing: Theme.Spacing.medium) {
            // Product image or try-on image
            ZStack {
                Rectangle()
                    .fill(Theme.Colors.secondaryBackground)
                    .frame(width: 80, height: 80)
                    .cornerRadius(Theme.Radius.medium)
                
                if trial.status == .completed, let imageData = trial.tryOnImageData, let uiImage = UIImage(data: imageData) {
                    Image(uiImage: uiImage)
                        .resizable()
                        .scaledToFill()
                        .frame(width: 80, height: 80)
                        .cornerRadius(Theme.Radius.medium)
                } else {
                    // In a real app, we would use RemoteImage to load from URL
                    Image(systemName: "tshirt.fill")
                        .font(.system(size: 30))
                        .foregroundColor(Theme.Colors.secondaryText)
                }
                
                if trial.status == .pending || trial.status == .processing {
                    ZStack {
                        Color.black.opacity(0.7)
                        
                        if trial.status == .pending {
                            Text("Pending")
                                .font(Theme.Typography.caption)
                                .foregroundColor(.white)
                        } else {
                            ProgressView()
                                .progressViewStyle(CircularProgressViewStyle(tint: .white))
                                .scaleEffect(0.8)
                        }
                    }
                    .frame(width: 80, height: 80)
                    .cornerRadius(Theme.Radius.medium)
                }
            }
            
            // Product info
            VStack(alignment: .leading, spacing: Theme.Spacing.xs) {
                Text(trial.product?.title ?? "Product")
                    .font(Theme.Typography.headline)
                    .foregroundColor(Theme.Colors.text)
                    .lineLimit(1)
                
                Text(trial.product?.brand ?? "Brand")
                    .font(Theme.Typography.subheadline)
                    .foregroundColor(Theme.Colors.secondaryText)
                
                if let price = trial.product?.price, let currency = trial.product?.currency {
                    Text("\(price, specifier: "%.2f") \(currency)")
                        .font(Theme.Typography.caption)
                        .foregroundColor(Theme.Colors.primary)
                }
                
                if let sizeRec = trial.sizeRecommendation {
                    Text("Size: \(sizeRec)")
                        .font(Theme.Typography.caption)
                        .foregroundColor(Theme.Colors.secondaryText)
                }
            }
            
            Spacer()
            
            // Status indicator
            if isSelected {
                Image(systemName: "checkmark.circle.fill")
                    .foregroundColor(Theme.Colors.primary)
            }
        }
        .padding(.vertical, Theme.Spacing.small)
        .contentShape(Rectangle())
        .onTapGesture {
            onTap()
        }
        .background(isSelected ? Theme.Colors.secondaryBackground.opacity(0.5) : Color.clear)
    }
}

struct FeedbackSheet: View {
    let product: Product?
    @Binding var feedbackText: String
    let onSubmit: () -> Void
    
    var body: some View {
        NavigationView {
            VStack(spacing: Theme.Spacing.large) {
                if let product = product {
                    HStack(spacing: Theme.Spacing.medium) {
                        // Product image
                        Rectangle()
                            .fill(Theme.Colors.secondaryBackground)
                            .frame(width: 80, height: 80)
                            .cornerRadius(Theme.Radius.medium)
                            .overlay(
                                // In a real app, we would use RemoteImage to load from URL
                                Image(systemName: "tshirt.fill")
                                    .font(.system(size: 30))
                                    .foregroundColor(Theme.Colors.secondaryText)
                            )
                        
                        // Product info
                        VStack(alignment: .leading, spacing: Theme.Spacing.xs) {
                            Text(product.title)
                                .font(Theme.Typography.headline)
                                .foregroundColor(Theme.Colors.text)
                                .lineLimit(1)
                            
                            Text(product.brand)
                                .font(Theme.Typography.subheadline)
                                .foregroundColor(Theme.Colors.secondaryText)
                        }
                        
                        Spacer()
                    }
                    .padding(.horizontal)
                }
                
                VStack(alignment: .leading, spacing: Theme.Spacing.small) {
                    Text("What do you think about this item?")
                        .font(Theme.Typography.headline)
                        .foregroundColor(Theme.Colors.text)
                    
                    Text("Your feedback helps us improve our recommendations")
                        .font(Theme.Typography.caption)
                        .foregroundColor(Theme.Colors.secondaryText)
                    
                    TextEditor(text: $feedbackText)
                        .frame(minHeight: 150)
                        .padding(Theme.Spacing.small)
                        .background(Theme.Colors.secondaryBackground)
                        .cornerRadius(Theme.Radius.medium)
                }
                .padding(.horizontal)
                
                Spacer()
                
                Button(action: onSubmit) {
                    Text("Submit Feedback")
                        .font(Theme.Typography.headline)
                        .frame(maxWidth: .infinity)
                }
                .primaryButtonStyle()
                .padding(.horizontal)
                .disabled(feedbackText.isEmpty)
                .opacity(feedbackText.isEmpty ? 0.6 : 1.0)
            }
            .padding(.vertical)
            .navigationTitle("Feedback")
            .navigationBarTitleDisplayMode(.inline)
        }
    }
}

#Preview {
    MainTabView()
}

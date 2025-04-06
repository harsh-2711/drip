//
//  drip_iosApp.swift
//  drip-ios
//
//  Created by Harsh Patel on 04/04/25.
//

import SwiftUI
import SwiftData

@main
struct drip_iosApp: App {
    var sharedModelContainer: ModelContainer = {
        let schema = Schema([
            UserPersona.self,
            StylePreference.self,
            Product.self,
            Trial.self
        ])
        
        // Configure the model container to persist data to disk
        let modelConfiguration = ModelConfiguration(
            schema: schema, 
            isStoredInMemoryOnly: false,
            allowsSave: true
        )
        
        // Set the URL for the store file
        let url = URL.documentsDirectory.appendingPathComponent("drip_data.store")
        print("SwiftData store URL: \(url.path)")
        
        do {
            let container = try ModelContainer(for: schema, configurations: [modelConfiguration])
            print("SwiftData ModelContainer created successfully")
            return container
        } catch {
            print("Error creating ModelContainer: \(error)")
            fatalError("Could not create ModelContainer: \(error)")
        }
    }()

    var body: some Scene {
        WindowGroup {
            OnboardingView()
        }
        .modelContainer(sharedModelContainer)
    }
}

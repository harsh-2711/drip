📱 AI Wardrobe iOS App — Final Technical Architecture & User Journey

🧱 Architecture Principles
MVVM Pattern (Strict separation of View, ViewModel, and Model layers)
SwiftUI as the core UI framework
SwiftData for local state (replacing CoreData)
Combine for real-time interactions
Light-only theme using Apple’s standard color palette
✅ Previews with Mock Data: All Views must support #Preview with dummy data.
✅ Atomic Components:
Every UI should be made up of small, reusable SwiftUI components.
Avoid bloated views — no logic dumping into views.
Logic lives in ViewModels. Views are composed from components.
🧭 Updated User Journey

1. Splash & Onboarding
Splash screen with “Explore” button
Tapping begins onboarding flow
2. User Photo Upload
Capture via Camera or Gallery
Resize to max height < 2000px
Upload to backend (to detect: skin tone, gender, body shape)
Store locally via SwiftData
3. Style Preference Selection
Scrollable list of different types tops & bottoms -- like baggy jeans, oversized tshirts, normal shirts, korean pants, etc. etc.
Tap to select favorite styles
Stored locally + POSTed to backend
4. AI Persona Initialization
Backend creates user persona → returns recommendations

🏠 Main Page Structure
Two Tabs:

🔍 Specific (User-Led Discovery)
Search/chat bar
Optional image upload with prompt
Backend: OpenAI → clothing attributes → vector search
Output: Deck of cards of best matches
🧭 Explore (Landing Tab)
Category grid (gender-aware): Shirts, Pants, Kurtis, etc.
Selecting category → opens deck of swipeable cards
💳 Deck of Cards UX

Stack of swipeable cards, centered
Blur background overlay
Tinder-style interaction:
Left swipe → dislike
Right swipe → add for trials
Each card contains:
Auto-playing carousel (IG story style)
80%: product image w/ negative spacing
10%: product brand, title, and “Add for Trials” button
“Leave a comment” → feedback sent to Agent F -- example A simple chat view to say things like:
“Avoid skinny jeans”
“Prefer earthy tones”
“I’m going to a beach wedding”
Top buttons:
Undo (revives last card)
Close (closes deck and returns to tab)

🧪 Virtual Try-On
On “Add for Trials”, item + user photo sent to backend
Server returns try-on image → saved to local state

🧼 Trial Room
Access from top nav on Main Page
Shows:
Processed try-ons
“Waiting…” message for in-process ones
Tapping a try-on shows:
Product info
Fit recs
Add to cart button


🔧 Technical Stack
Layer	Stack
Architecture	MVVM (Strictly Enforced)
Views	Built using Atomic Components, reusable, testable
UI Framework	SwiftUI (with #Previews + mock data for every screen)
Networking	REST with URLSession (GraphQL ready)
Storage	SwiftData for UserPersona, Trials, Preferences
Reactivity	Combine (debounced feedback, binding to ViewModels)
Image Capture	UIImagePickerController, VisionKit
Theme	Centralized Theme.swift (spacing, typography, system colors only)
Animations	SwiftUI transitions, Lottie, UIViewPropertyAnimator
Try-On	Server-side processing using captured image + fashion item overlay
Auth	Skipped for now, assume one user user123

📦 Dev & Testing Strategy

✅ Every view must support #Preview with mock data
✅ Use MockViewModels for preview testing
✅ Always build UI with atomic SwiftUI components
✅ Views should have no business logic
ViewModels handle state, input/output
View = layout & user interaction only
🔁 Preview mode uses locally mocked JSON + data instead of real API

🎨 UX & UI Recommendations
Visual language: Clean, minimalist, luxury-focused. Use fashion photography and editorial layout.
Images: Add placeholder image with a description to be replaced by a more realistic and creative image later
Interaction: Mimic Instagram reels for stories + Tinder for product cards → high engagement.
Color palette: Soft neutrals, muted earth tones, serif headers + minimalist icons.
Micro-interactions: Subtle haptics, button bounce on "Love It", Lottie for feedback animations.
Dark mode: Not required now. Light mode wins here.

🔒 Authentication & User Tracking
No auth required as of now. Can assume all routes are open and there is only one user with id user123. Hence, start with the onboarding page only.

🔄 Networking & Backend Sync
API Type	Recommendation
REST	For quick prototype
Uploads	Base64


✅ Hackathon Build Priorities
Feature	Priority	Build?
Onboarding & Photo Upload	High	✅
Style Preference Selector	High	✅
Deck of Cards (Explore/Specific)	High	✅
Prompt → Vector Search → Cards	High	✅
Try-On Integration	Medium	✅
Trial Room + Add to Cart	Medium	✅
Checkout Flow	Low	❌

# FoodLens App Wireframes and User Flow Documentation

## Overview

This document provides detailed wireframes and user flow documentation for the FoodLens app - a React Native mobile application for tracking food through AI-powered photo recognition. The target audience is women aged 20-30 in the US market who are busy professionals seeking a simple way to log their meals.

## Core User Flow

```
+---------------------+     +---------------------+     +---------------------+
|                     |     |                     |     |                     |
|    Splash Screen    |---->|    Onboarding      |---->|  Permission Request |
|                     |     |                     |     |                     |
+---------------------+     +---------------------+     +---------------------+
                                                               |
                                                               v
+---------------------+     +---------------------+     +---------------------+
|                     |     |                     |     |                     |
|   Food Entry Form   |<----| AI Analysis Results |<----| Camera/Photo Screen |
|   (Notes, Save)     |     |   (Food Details)    |     |                     |
+---------------------+     +---------------------+     +---------------------+
        |                                                      ^
        v                                                      |
+---------------------+                                        |
|                     |                                        |
|   Food History      |----------------------------------------+
|   Dashboard         |
|                     |
+---------------------+
```

## Screen Specifications

### 1. Splash Screen

```
+----------------------------------------------+
|                                              |
|                                              |
|                                              |
|                                              |
|                                              |
|                 [FoodLens Logo]              |
|                                              |
|                                              |
|                                              |
|                                              |
|                                              |
|             Track food effortlessly          |
|                                              |
|                                              |
+----------------------------------------------+
```

**Description:**
- Displayed for 2-3 seconds when app launches
- Includes FoodLens logo with pink gradient background
- Brief tagline: "Track food effortlessly"
- Auto-transitions to onboarding or home screen

### 2. Onboarding Screens

#### 2.1 First Onboarding Screen

```
+----------------------------------------------+
|                                        Skip  |
|                                              |
|                                              |
|                                              |
|          [Illustration: Camera/Food]         |
|                                              |
|                                              |
|                                              |
|         Snap & Recognize Instantly           |
|                                              |
|     Take a photo of your meal and our AI     |
|     will identify it automatically           |
|                                              |
|                                              |
|   [Progress Indicator: 1 of 3]     [Next >]  |
+----------------------------------------------+
```

#### 2.2 Second Onboarding Screen

```
+----------------------------------------------+
|                                        Skip  |
|                                              |
|                                              |
|                                              |
|      [Illustration: Food Journal/Notes]      |
|                                              |
|                                              |
|                                              |
|         Log Your Meals Effortlessly          |
|                                              |
|     Add notes and keep track of all your     |
|     meals with just a few taps               |
|                                              |
|                                              |
|   [Progress Indicator: 2 of 3]     [Next >]  |
+----------------------------------------------+
```

#### 2.3 Third Onboarding Screen

```
+----------------------------------------------+
|                                              |
|                                              |
|                                              |
|                                              |
|       [Illustration: Dashboard/History]      |
|                                              |
|                                              |
|                                              |
|         Track Your Eating Habits             |
|                                              |
|     See your meal history and develop        |
|     healthier eating habits                  |
|                                              |
|                                              |
|   [Progress Indicator: 3 of 3]  [Get Started]|
+----------------------------------------------+
```

**Description:**
- Series of 3 screens introducing key features
- Each screen has illustration, heading, and description
- Progress indicator at bottom showing current position
- "Skip" button to bypass onboarding
- "Next" button to advance, "Get Started" on final screen
- Only shown on first app launch

### 3. Permission Request Screen

```
+----------------------------------------------+
|                                              |
|                                              |
|                                              |
|         [Camera Permission Icon]             |
|                                              |
|                                              |
|         Camera Access Required               |
|                                              |
|     FoodLens needs camera access to          |
|     take photos of your meals and            |
|     recognize food items                     |
|                                              |
|                                              |
|    [Not Now]                [Allow Access]   |
+----------------------------------------------+
```

**Description:**
- Explains why camera permission is needed
- Clear call-to-action buttons
- If denied, app will still work but with limited functionality
- Only shown if permission not previously granted

### 4. Home Dashboard Screen

```
+----------------------------------------------+
|                                              |
| FoodLens                           [Profile] |
|                                              |
| Today, June 13                               |
|                                              |
| +------------------------------------------+ |
| |            What's on your plate?         | |
| |                                          | |
| |  [Camera Icon]          [Gallery Icon]   | |
| |  Take Photo             Choose Photo     | |
| |                                          | |
| +------------------------------------------+ |
|                                              |
| Recent Meals                                 |
| +------------------------------------------+ |
| | Breakfast - 8:30 AM                      | |
| | [Thumbnail] Avocado Toast                | |
| +------------------------------------------+ |
| |                                          | |
| | Lunch - 12:15 PM                         | |
| | [Thumbnail] Chicken Salad                | |
| |                                          | |
| +------------------------------------------+ |
|                                              |
| [Home]        [History]        [Settings]    |
+----------------------------------------------+
```

**Description:**
- Main entry point after splash/onboarding
- Shows today's date and greeting
- Prominent buttons for taking or selecting photos
- Recent meals section with thumbnails
- Bottom navigation bar with 3 main sections

### 5. Camera/Photo Screen

```
+----------------------------------------------+
|                                              |
|  [X Close]                                   |
|                                              |
|                                              |
|                                              |
|                                              |
|                                              |
|                                              |
|          [Camera Viewfinder Frame]           |
|                                              |
|                                              |
|                                              |
|                                              |
|                                              |
|       [Flash]    [Capture]    [Switch]       |
+----------------------------------------------+
```

**Description:**
- Full screen camera view with viewfinder frame
- Close button to return to home screen
- Camera controls at bottom: flash, capture, switch camera
- When gallery option chosen, shows photo picker instead

### 6. AI Analysis Loading Screen

```
+----------------------------------------------+
|                                              |
|                                              |
|                                              |
|                                              |
|              [Food Photo Preview]            |
|                                              |
|                                              |
|                                              |
|                                              |
|              [AI Processing Animation]       |
|                                              |
|          Recognizing your food...            |
|                                              |
|                                              |
+----------------------------------------------+
```

**Description:**
- Shows preview of the captured/selected photo
- Loading animation indicating AI processing
- Status text: "Recognizing your food..."
- Automatically transitions to results when analysis complete
- Timeout after 10 seconds with retry option

### 7. AI Analysis Results Screen

```
+----------------------------------------------+
|                                              |
|  [< Back]                                    |
|                                              |
|              [Food Photo]                    |
|                                              |
|  Food Detected: Phở Bò (Vietnamese Beef Soup)|
|                                              |
|  Meal Type:                                  |
|  [Breakfast] [Lunch] [Dinner] [Snack]        |
|                                              |
|  Date & Time: June 13, 2025 - 12:51 PM       |
|                                              |
|  Additional Info:                            |
|  - Estimated calories: 420-520 kcal          |
|  - Contains: beef, rice noodles, herbs       |
|                                              |
|  [Continue]                                  |
+----------------------------------------------+
```

**Description:**
- Shows analyzed food photo
- Displays detected food name prominently
- Meal type selection with auto-suggestion based on time
- Automatically filled date/time (editable)
- Basic nutrition information if available
- "Continue" button to proceed to entry form

### 8. Food Entry Form Screen

```
+----------------------------------------------+
|                                              |
|  [< Back]                           [Save]   |
|                                              |
|  Food: Phở Bò                                |
|                                              |
|  Meal Type:                                  |
|  [Breakfast] [✓Lunch] [Dinner] [Snack]       |
|                                              |
|  Date & Time:                                |
|  [June 13, 2025]          [12:51 PM]         |
|                                              |
|  Notes:                                      |
|  +------------------------------------------+|
|  |                                          ||
|  | Add notes about this meal...             ||
|  |                                          ||
|  +------------------------------------------+|
|                                              |
|  [Add to Favorites]                          |
|                                              |
|  [Save to Journal]                           |
+----------------------------------------------+
```

**Description:**
- Form to finalize and save food entry
- Editable food name, meal type, and date/time
- Text area for adding personal notes
- Option to mark as favorite
- Prominent save button

### 9. Food History Dashboard Screen

```
+----------------------------------------------+
|                                              |
| FoodLens                           [Profile] |
|                                              |
| Meal History                                 |
|                                              |
| [Calendar Icon] June 2025                    |
|                                              |
| Today, June 13                               |
| +------------------------------------------+ |
| | Lunch - 12:51 PM                         | |
| | [Thumbnail] Phở Bò                       | |
| +------------------------------------------+ |
| | Breakfast - 8:30 AM                      | |
| | [Thumbnail] Avocado Toast                | |
| +------------------------------------------+ |
|                                              |
| Yesterday, June 12                           |
| +------------------------------------------+ |
| | Dinner - 7:15 PM                         | |
| | [Thumbnail] Grilled Salmon               | |
| +------------------------------------------+ |
| | Lunch - 12:30 PM                         | |
| | [Thumbnail] Caesar Salad                 | |
| +------------------------------------------+ |
|                                              |
| [Home]        [History]        [Settings]    |
+----------------------------------------------+
```

**Description:**
- Chronological list of all logged meals
- Grouped by date with newest first
- Each entry shows meal type, time, food name, and thumbnail
- Calendar icon to jump to specific dates
- Tapping an entry opens detailed view

## Data Flow Diagram

```
+-----------------+         +----------------+         +-------------------+
|                 |  Image  |                |  Image  |                   |
|  Device Camera  |-------->|  React Native  |-------->|  AI Image Analysis|
|                 |         |     App        |         |  (OpenAI/Gemini)  |
+-----------------+         +----------------+         +-------------------+
                                    ^                           |
                                    |                           |
                                    |  Food Name                |
                                    |  & Details                |
                                    v                           v
+------------------+         +----------------+         +-------------------+
|                  |  Save   |                |  Store  |                   |
|  Local Storage   |<--------|  Data Manager  |<--------|   Analysis Result |
|  (AsyncStorage)  |  Data   |                |  Data   |                   |
+------------------+         +----------------+         +-------------------+
        |                            ^
        |                            |
        |                            |
        v                            |
+------------------+         +----------------+
|                  |  Fetch  |                |
|  History Display |<--------|  Query Manager |
|                  |  Data   |                |
+------------------+         +----------------+
```

## User Journey Map

```
+----------------+     +----------------+     +----------------+     +----------------+
|                |     |                |     |                |     |                |
|  Installation  |---->|   Onboarding   |---->| First Food Log |---->| Regular Usage  |
|                |     |                |     |                |     |                |
+----------------+     +----------------+     +----------------+     +----------------+
        |                     |                      |                      |
        v                     v                      v                      v
+----------------+     +----------------+     +----------------+     +----------------+
| • App discovery| | • Learn features | | • Take photo     | | • Daily logging  |
| • Download     | | • Set up profile| | • See AI results | | • Review history |
| • Installation | | • Grant camera  | | • Add notes      | | • Form habits    |
|                | | • permissions   | | • Save entry     | | • Pattern insight|
+----------------+     +----------------+     +----------------+     +----------------+
```

## Component Hierarchy

```
App
│
├── Navigation
│   ├── TabNavigator
│   ├── StackNavigator
│   └── NavigationService
│
├── Screens
│   ├── SplashScreen
│   ├── OnboardingScreen
│   ├── PermissionScreen
│   ├── HomeScreen
│   ├── CameraScreen
│   ├── AnalysisScreen
│   ├── EntryFormScreen
│   └── HistoryScreen
│
├── Components
│   ├── Header
│   ├── MealCard
│   ├── CameraViewfinder
│   ├── LoadingIndicator
│   ├── MealTypeSelector
│   ├── DateTimePicker
│   └── GradientButton
│
├── Services
│   ├── CameraService
│   ├── AIAnalysisService
│   ├── StorageService
│   └── DateTimeService
│
└── Utils
    ├── Colors
    ├── Typography
    ├── Validation
    └── Formatting
```


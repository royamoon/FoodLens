# FoodLens - Project Overview

## Table of Contents
1. [Project Summary](#project-summary)
2. [Target Audience](#target-audience)
3. [MVP Features](#mvp-features)
4. [Technical Stack](#technical-stack)
5. [UI/UX Design System](#uiux-design-system)
6. [User Flow](#user-flow)
7. [Screen Specifications](#screen-specifications)
8. [API Integration](#api-integration)
9. [Development Requirements](#development-requirements)
10. [Success Metrics](#success-metrics)

---

## Project Summary

**App Name:** FoodLens  
**Platform:** iOS & Android (React Native)  
**Target Market:** United States  
**App Type:** Food Tracking with AI Recognition  
**Development Timeline:** 4-6 weeks for MVP  

### Core Value Proposition
FoodLens helps busy women (ages 20-30) track their daily food intake effortlessly by simply taking a photo. AI automatically recognizes food items, eliminating the tedious manual entry process that causes 37% of users to abandon traditional food tracking apps.

### Key Differentiators
- **AI-Powered Food Recognition**: Automatic food identification from photos
- **Ultra-Fast Logging**: Complete meal entry in under 60 seconds
- **Minimal Interface**: Focus on essential features only
- **Target-Specific Design**: Optimized for busy millennial women

---

## Target Audience

### Primary Persona: Busy Millennial Woman
- **Age**: 20-30 years old
- **Location**: United States (urban/suburban)
- **Education**: College-educated
- **Occupation**: Office workers, professionals, entrepreneurs
- **Income**: Middle to upper-middle class
- **Lifestyle**: Health-conscious but time-constrained
- **Tech Behavior**: Heavy smartphone users, prefer simple solutions

### User Pain Points
- Traditional food tracking takes too much time (37% abandonment reason)
- Difficult to remember logging meals throughout busy days
- Complex interfaces with unnecessary features
- Inaccurate portion estimation and food database searches

---

## MVP Features

### Core Features (Must-Have)
1. **Photo Capture**
   - Native camera integration
   - High-quality photo capture and compression
   - Gallery import option

2. **AI Food Recognition**
   - Integration with OpenAI GPT-4o Vision API
   - Automatic food identification from photos
   - Confidence score display

3. **Quick Food Entry**
   - Edit AI-suggested food names
   - Add personal notes/descriptions
   - Automatic timestamp capture

4. **Daily Food Log**
   - Chronological list of meals
   - Photo thumbnails with food names
   - Daily summary view

5. **Basic Profile**
   - Simple onboarding (name, health goal)
   - Camera permissions setup

### Future Features (Nice-to-Have)
- Nutrition information display
- Weekly/monthly trends
- Export functionality
- Social sharing
- Integration with health apps

---

## UI/UX Design System

### Color Palette
```
Primary Pink: #F9D1D9
Secondary Pink: #F4A5B8
Accent Green: #79C267
Background: #FFFFFF
Text Primary: #2D3748
Text Secondary: #718096
```

### Typography
- **Primary Font**: Figtree google font
- **Headings**: Poppins SemiBold (18-24px)
- **Body Text**: Poppins Regular (14-16px)
- **Captions**: Poppins Regular (12px)

### Design Principles
- **Minimalist**: Clean, uncluttered interface
- **Mobile-First**: Optimized for one-handed use
- **Accessibility**: High contrast, readable fonts
- **Feminine**: Soft colors, rounded corners
- **Modern**: Latest iOS/Android design patterns

### UI Components
- **Buttons**: Rounded (8px), gradient backgrounds
- **Cards**: Subtle shadows, 12px border radius
- **Input Fields**: Clean borders, soft focus states
- **Camera Interface**: Full-screen with prominent capture button

---

## User Flow

### Primary Flow: Add Meal Entry
1. **Home Screen** → Tap "Add Meal" or Camera button
2. **Camera Screen** → Take photo or select from gallery
3. **AI Processing** → Show loading indicator (3-5 seconds)
4. **AI Results** → Display recognized food name + confidence
5. **Edit Entry** → Allow user to modify name, add notes
6. **Save Entry** → Store with timestamp, return to daily log
7. **Daily Log** → Show updated list with new entry

### Secondary Flows
- **Onboarding**: Welcome → Permissions → Basic Profile → Camera Tutorial
- **View History**: Daily Log → Tap entry → Full view with photo
- **Settings**: Basic preferences, account management

---

## Screen Specifications

### 1. Onboarding Screens (3 screens)
- **Welcome**: App introduction, key benefits
- **Permissions**: Camera access request
- **Profile Setup**: Name, basic health goal

### 2. Main Screens (4 screens)
- **Daily Log (Home)**: List of today's meals + Add button
- **Camera Screen**: Photo capture interface
- **AI Results**: Display recognized food + edit options
- **Food Entry Form**: Final details before saving

### 3. Secondary Screens (2 screens)
- **Profile/Settings**: Basic user info, preferences
- **Meal Detail**: Full view of individual meal entry

---


# 📋 Bitrova

> **Version 2.3** - Authentication & Cloud Sync Update

A modern, scalable **SaaS MVP** (Minimum Viable Product) for task management built with React Native and Expo. Designed with premium glassmorphism aesthetics, this project is architected to support both **B2C** (Personal Productivity) and future **B2B** (Team Collaboration) scalability.

![Status](https://img.shields.io/badge/status-active-success)
![React Native](https://img.shields.io/badge/React%20Native-0.76.6-blue)
![Expo](https://img.shields.io/badge/Expo-~52.0-000020?logo=expo)
![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20Sync-3ECF8E?logo=supabase)

## 🚀 Project Overview

Bitrova is a **cloud-native** application that bridges the gap between simple to-do lists and complex project management tools. Currently operating as a B2C product for personal organization, its underlying architecture is built with **multi-tenancy principles** in mind, allowing for a seamless transition to a B2B SaaS model for team collaboration.

## ✨ Key Features

### 🔐 Authentication & Security
- **Supabase Integration** - Secure enterprise-grade authentication with email/password.
- **Session Management** - Persistent login states with secure token handling and auto-refresh.
- **Row Level Security (RLS)** - Data isolation architecture ready for future multi-tenancy scaling.
- **Protected Routes** - Secure access control ensuring data privacy.

### ☁️ Cloud Architecture (SaaS Core)
- **Real-time Sync** - WebSocket-based synchronization across devices (iOS, Android, Web).
- **Cloud Backup** - Automated data persistence strategy ensuring zero data loss.
- **Offline-First** - Local database (AsyncStorage) with conflict resolution upon reconnection.
- **Data Recovery** - Robust restoration protocols for user peace of mind.

### 🎨 Design & UI
- **Glassmorphism Design** - specific modern UI with frosted glass effects and blur intensity control.
- **GlassCard Component** - Custom reusable container for consistent aesthetics.
- **Theme Engine** - Seamless Dark/Light mode switching with persistent user preference.
- **Smooth Animations** - Powered by **React Native Reanimated 3** for 60fps interactions.
- **Responsive Layout** - Optimized UI for diverse form factors (Mobile & Web).

### � Recurring Tasks Engine
- **Complex Patterns** - Supports Daily, Weekly (specific days), Monthly, and Custom intervals.
- **Series Management** - Advanced logic to handle recurring series vs. individual instances.
- **Scoped Actions** - Ability to edit/delete a single instance, future events, or the entire series.
- **Smart Notifications** - CRON-like scheduling for local push notifications.

### 📝 Core Productivity
- **Smart Categories** - Dynamic filtering (Work, Personal, Health, Shopping).
- **Attachments System** - Image upload and gallery view using Supabase Storage buckets.
- **Subtasks & Nesting** - Drag-and-drop support for breaking down complex tasks.
- **Advanced Editing** - Inline editing, undo/redo history stack, and auto-save protection.

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **React Native** | Cross-platform mobile framework |
| **Expo (v52)** | Development toolchain & build system |
| **Supabase** | Backend-as-a-Service (PostgreSQL, Auth, Realtime) |
| **Expo Router** | File-based routing & navigation |
| **React Context** | Global state management |
| **Reanimated 3** | High-performance declarative animations |
| **AsyncStorage** | Local persistence & offline caching |

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/juliandeveloper05/tasklist-app.git

# Navigate to project directory
cd tasklist-app

# Install dependencies
npm install

# Start the development server
npx expo start
```

## 🚀 Running the App

```bash
# iOS Simulator
npx expo start --ios

# Android Emulator
npx expo start --android

# Web Browser
npx expo start --web
```

## 📁 Project Structure

```
tasklist-app/
├── app/                      # Expo Router screens (Auth, Home, Settings)
├── components/               # Reusable UI (GlassCard, TaskItem, Inputs)
├── context/                  # Global State (AuthContext, TaskContext)
├── config/                   # External services setup (Supabase)
├── services/                 # Business Logic (Sync, Backup, Exports)
├── hooks/                    # Custom Hooks (useCloudSync, useHistory)
├── utils/                    # Helpers (Date formatting, Storage)
└── theme/                    # Design tokens & Color palettes
```

## 🗺️ Roadmap & Future Development

### ✅ Phase 1: Core Features (Complete)
- [x] Basic task CRUD operations.
- [x] Category system & Priority levels.
- [x] Dark/Light theme engine.
- [x] Local notifications.
- [x] Search & filter functionality.
- [x] Subtasks with progress tracking.
- [x] Swipe-to-delete gestures.

### ✅ Phase 2: Enhanced SaaS Features (Complete)
- [x] Recurring tasks engine (CRON-like patterns).
- [x] Supabase Authentication System.
- [x] Real-time Cloud Sync & Backup.
- [x] Attachments handling (Storage Buckets).
- [x] Glassmorphism UI Polish.
- [x] Undo/Redo history stack.
- [x] Auto-save with debouncing.
- [x] Custom font size settings.
- [x] Password reset flow.

### 🚀 Phase 3: B2B Pivot & Scalability (Planned)
Transitioning from single-user B2C to Team-based B2B architecture.
- [ ] **Multi-tenancy Support**: Logic to separate data by "Organizations" or "Teams".
- [ ] **Team Workspaces**: Shared task lists and project boards (Kanban view).
- [ ] **RBAC (Role-Based Access Control)**: Admin, Editor, and Viewer roles.
- [ ] **Real-time Collaboration**: Live typing indicators and concurrent editing (CRDTs).
- [ ] **Team Invitations**: Email-based invite system with role assignment.
- [ ] **Activity Feed**: Team-wide activity log and notifications.
- [ ] **Comments & Mentions**: @mention teammates on tasks.

### 💰 Phase 4: Monetization & Analytics
- [ ] **Subscription Infrastructure**: Integration with Stripe/RevenueCat.
- [ ] **Freemium Logic**: Gate features based on subscription tier (Free vs. Pro vs. Enterprise).
- [ ] **Usage Quotas**: Task limits, storage limits per tier.
- [ ] **Advanced Analytics**: Productivity insights dashboard for teams.
- [ ] **AI Integration**: LLM-based task prioritization and auto-suggestions.
- [ ] **Smart Due Dates**: AI-powered deadline recommendations.
- [ ] **Weekly Reports**: Email summaries of productivity metrics.

### 📱 Phase 5: Platform Expansion
- [ ] **Calendar View**: Visual calendar for task scheduling.
- [ ] **Widgets Support**: Home screen widgets (iOS & Android).
- [ ] **Apple Watch / Wear OS**: Quick task capture on wearables.
- [ ] **Desktop Apps**: Native macOS & Windows apps via Electron/Tauri.
- [ ] **Browser Extension**: Quick capture from any webpage.
- [ ] **Voice Input**: Hands-free task creation via speech recognition.
- [ ] **Siri/Google Assistant**: Voice command integrations.

### 🏢 Phase 6: Enterprise Features
- [ ] **SSO (Single Sign-On)**: SAML, OAuth2, OpenID Connect.
- [ ] **Audit Logs**: Compliance-ready activity tracking.
- [ ] **Custom Domains**: White-label branding options.
- [ ] **API Access**: RESTful API for third-party integrations.
- [ ] **Webhooks**: Event-driven automation hooks.
- [ ] **Data Export**: Bulk export (JSON, CSV, PDF).
- [ ] **SLA & Priority Support**: Dedicated enterprise support tiers.

### 🎯 Phase 7: Polish & Optimization
- [ ] **Performance Optimizations**: Lazy loading, virtualized lists.
- [ ] **Accessibility (WCAG)**: Full screen reader support.
- [ ] **Internationalization (i18n)**: Multi-language support.
- [ ] **Comprehensive Testing**: Unit, integration, and E2E tests.
- [ ] **App Store Deployment**: iOS App Store & Google Play releases.
- [ ] **CI/CD Pipeline**: Automated builds and deployments.

## 📄 License
This project is open source and available under the MIT License.

## 👨‍💻 Author
Julian Javier Soto

---

⭐ SaaS MVP Concept - Ready for scalability. If you found this project interesting, feel free to star the repo!
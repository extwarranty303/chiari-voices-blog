# Chiari Voices - AI-Powered Blog Platform

## 1. Overview

This document outlines the plan for building a comprehensive, AI-powered blog platform for the Chiari malformation community. The platform will provide a space for creating, managing, and reading content, with a rich feature set powered by Firebase and Google AI (Gemini 3 Pro via Genkit). The user experience will be consistent with the look, feel, and color scheme of `chiarivoices.org`.

---

## 2. Core Architecture & Technology Stack

*   **Frontend:** React with Vite (TypeScript)
*   **Backend:** Firebase (Authentication, Cloud Firestore, Cloud Storage, Cloud Functions)
*   **AI Integration:** Genkit for complex server-side AI workflows, and Firebase AI Logic for optional client-side tasks.
*   **AI Model:** Gemini 3 Pro
*   **Styling:** Tailwind CSS
*   **Component Library:** Shadcn/ui (for maximum control and a clean, dependency-light approach)

---

## 3. Design and User Experience (UX)

*   **Color Scheme:** The palette will be sampled from `chiarivoices.org` to ensure brand consistency, focusing on its dark theme with purple and teal accents.
*   **Layout:** A clean, modern, and responsive layout that works seamlessly on all devices.
*   **Visual Style:** **Glassmorphism** will be used for key UI elements to create a sense of depth and transparency.
*   **Typography:**
    *   **Body:** `Inter` (sans-serif) for readability.
    *   **Headlines:** `Space Grotesk` (sans-serif) for a bold, technical feel.
*   **Iconography:** Clear, minimalist icons will be used for navigation and interactive elements.
*   **Animation:** Subtle animations will provide feedback for loading states and user interactions.
*   **Header & Footer:** Will be designed to match `chiarivoices.org`.

---

## 4. Key Features & Implementation Plan

### Phase 1: Foundation & Authentication

*   [x] **Firebase Project Setup:** Create a new Firebase project and connect it to this workspace.
*   [x] **Core Services:** Initialize Firebase Authentication, Cloud Firestore, and Cloud Storage.
*   [x] **Styling Foundation:** Configure Tailwind CSS with the `chiarivoices.org` color palette, fonts, and Glassmorphism styles.
*   [x] **Login Page:**
    *   Create a dedicated, responsive login page.
    *   Implement authentication via Email/Password, Google, and Facebook.
    *   Implement a password reset flow for email-based accounts.
*   [x] **User Roles & Security:**
    *   Define three user roles: `admin`, `moderator`, and `user`.
    *   Set up Firestore Security Rules to enforce permissions based on these roles.
    *   Store user data and roles in a `users` collection in Firestore.

### Phase 2: Blog Content Management (Admin/Moderator)

*   [x] **Admin Dashboard:** Create a secure dashboard accessible only to `admin` and `moderator` roles.
*   [x] **Post Creation & Editing:**
    *   Build a `PostEditor` component.
    *   Integrate a full-featured WYSIWYG editor with a "Source Code" view.
    *   Enable fields for `title`, `content` (HTML), and `tags`.
*   [x] **Media Handling:**
    *   Allow image and video uploads directly to Cloud Storage.
    *   Allow embedding media via URL.
*   [x] **Post Management:**
    *   Create a view to list all posts (CRUD operations).
    *   Admins have full CRUD access.
    *   Moderators have Create, Update, and Delete permissions.

### Phase 3: Public Blog & User Features

*   [x] **Blog Post Display:**
    *   Create a main blog page to list all published posts.
    *   Create a single post page (`/posts/:slug`) to display full content.
*   [x] **Nested Comments:** Implement a Reddit-like nested commenting system on post pages.
*   [x] **User Profile Page:**
    *   Create a private, user-only profile page.
    *   Allow users to update their profile picture, location, and other data.
    *   Implement a feature to bookmark favorite articles, storing them in the user's profile data.

### Phase 4: Future AI Feature Integration (Genkit & Gemini 3 Pro)

*   [ ] **Genkit Setup:** Initialize Genkit within a Cloud Functions environment.
*   [ ] **Content Assistance (Generate & Refine):**
    *   **UI:** Add an "AI Assistant" section to the `PostEditor`.
    *   **Genkit Flow:** Create a flow that accepts a topic/keywords and generates:
        *   Blog post ideas
        *   Outlines
        *   Initial drafts
*   [ ] **SEO & Summarization:**
    *   **UI:** Add "Generate SEO" and "Generate Summary" buttons to the editor.
    *   **Genkit Flow (`generateSeoKeywordsFlow`):** Create a flow to analyze post content and generate:
        *   SEO keywords.
        *   A meta description.
    *   **AI Summary:** Implement a feature to generate a concise summary of long posts.
*   [ ] **AI-Powered Tagging:**
    *   **UI:** Show AI-suggested tags in the editor.
    *   **Genkit Flow:** Create a flow to suggest relevant tags based on post content.
*   [ ] **AI Image Generation:**
    *   **UI:** Add a feature to generate an image from a text prompt.
    *   **Genkit/AI Logic Flow:** Create a flow to call the Gemini model for image generation and save it to Cloud Storage.
*   [ ] **AI Comment Moderation:**
    *   **Cloud Function Trigger:** On comment creation, trigger a a function.
    *   **Genkit Flow:** Create a flow that analyzes comment text for spam or offensive language and flags it for moderator review.
*   [ ] **Advanced AI Features (Future):**
    *   [ ] **Content Outdatedness Detector:** AI tool to flag posts that may need updates.
    *   [|] **Personalized Recommendations:** AI to suggest articles to readers.
    *   [ ] **Accessibility:** AI-powered video transcription and text-to-speech.

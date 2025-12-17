# Blueprint: Chiari Voices AI-Powered Blog

## 1. Project Overview
**Goal:** Build a modern, responsive blog platform with a "Glassmorphism" aesthetic, integrated with Firebase for backend services and Google Gemini (via Genkit and Firebase AI Logic) for advanced AI content features.
**Design Philosophy:** Match `chiarivoices.org` (Chiari awareness colors), Clean, Responsive, Glassmorphism, "Inter" (Body) & "Space Grotesk" (Headlines) fonts.
**Tech Stack:** React (Vite), Firebase (Auth, Firestore, Storage, Functions), Genkit, Tailwind CSS.

## 2. Architecture & Roles
*   **Frontend:** React Single Page Application (SPA).
*   **Backend:** Firebase Serverless (Functions, Firestore).
*   **AI:** Gemini 3 Pro via Genkit (Server-side) and Firebase AI Logic (Client-side).
*   **Roles:**
    *   **Admin:** Full access (manage users, settings, all content).
    *   **Moderator:** Create/Edit/Delete posts, Moderate comments.
    *   **User:** Read, Comment, Manage own Profile/Bookmarks.

## 3. Implementation Plan

### Phase 1: Foundation & Design System (COMPLETED)
- [x] **Project Setup:** Install `react-router-dom`, `firebase`, `tailwindcss` (or chosen UI lib), `lucide-react` (icons).
- [x] **Design System:**
    - [x] Import fonts: Inter and Space Grotesk.
    - [x] Define Color Palette (Background: #1A202C, Surface: #EDF2F7, Accent: #805AD5).
    - [x] Create `GlassPanel`, `Button`, `Input` components.
    - [x] Layout Component (Header, Footer, Main Wrapper).

### Phase 2: Authentication & User Management (COMPLETED)
- [x] **Firebase Auth Setup:**
    - [x] Configure `firebase.ts`.
    - [x] Create `AuthContext`.
    - [x] Implement Login (Email, Google, FB) & Signup.
- [x] **User Database:**
    - [x] Create `users` collection in Firestore.
    - [x] Store roles (`admin`, `moderator`, `user`).
- [x] **Profile Page:**
    - [x] View/Edit Profile (Avatar, Name, Bio).
    - [x] Image Upload to Storage.
    - [x] Protected Routes implemented.

### Phase 3: Blog Core (Admin Side - COMPLETED)
- [x] **Data Structure:** Defined `posts` collection in Firestore.
- [x] **Admin Dashboard:**
    - [x] List view of posts (Edit/Delete).
    - [x] Create/Edit Post form.
- [x] **WYSIWYG Editor:**
    - [x] Integrated `react-quill` with custom Glassmorphism styles.
    - [x] Added "Source Code" view toggle.
    - [x] Image Upload handler (Cloud Storage).
- [x] **Tagging System:** Implemented tag input with remove functionality.

### Phase 4: Blog Public View (COMPLETED)
- [x] **Home Page/Blog List:**
    - [x] Fetch and display published posts.
    - [x] Filter by Tag.
    - [x] Skeleton loading states.
- [x] **Post Detail Page:**
    - [x] Render full HTML content safely (DOMPurify).
    - [x] Display Metadata (Author, Date, Tags).
- [x] **Comments System:**
    - [x] Nested/Threaded comments structure.
    - [x] Emoji Picker integration.
    - [x] Like functionality.
    - [x] Real-time updates via `onSnapshot`.

### Phase 5: AI Integration (Gemini 3 Pro) (COMPLETED)
- [x] **Genkit Setup (Cloud Functions):**
    - [x] Created `functions/src/ai.ts` with 3 Genkit flows using Gemini 1.5 Flash.
    - [x] `generatePostIdeas`: Generates titles from a topic.
    - [x] `generateOutline`: Creates structured HTML outline from a title.
    - [x] `generateSeo`: Analyzes content for keywords and meta descriptions.
- [x] **Client-Side Integration:**
    - [x] Updated `AdminDashboard.tsx` with AI toolbar.
    - [x] Implemented "AI Ideas" panel to generate and select titles.
    - [x] Implemented "Gen Outline" to append structured content to the editor.
    - [x] Implemented "Analyze SEO" to fetch keywords and meta description.

### Phase 6: Refinement & Polish (COMPLETED)
- [x] **Accessibility:** Checked contrast, improved ARIA labels for Buttons and Inputs.
- [x] **SEO:** Dynamic `<meta>` tags using `react-helmet-async` implemented on Home and Post pages.
- [x] **Testing:** Unit tests for `AuthContext` and UI components implemented using Vitest.

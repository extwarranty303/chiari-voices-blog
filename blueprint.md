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
- [x] **Navigation:** Updated to use `/posts` instead of `/blog`.

### Phase 2: Authentication & User Management (COMPLETED)
- [x] **Firebase Auth Setup:**
    - [x] Configure `firebase.ts`.
    - [x] Create `AuthContext`.
    - [x] Implement Login (Email, Google, FB) & Signup.
- [x] **User Database:**
    - [x] Create `users` collection in Firestore.
    - [x] Store roles (`admin`, `moderator`, `user`).
- [x] **Profile Page:**
    - [x] View/Edit Profile (Avatar, Name, Bio, Social Media Links).
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
- [x] **Slug-based Routing:** Implemented for posts.

### Phase 4: Posts Public View (COMPLETED)
- [x] **Home Page/Posts List:**
    - [x] Fetch and display published posts.
    - [x] Filter by Tag.
    - [x] Skeleton loading states.
    - [x] Featured Story Hero.
    - [x] Category Filters.
    - [x] Read Time Estimates.
    - [x] Newsletter Signup.
- [x] **Post Detail Page (`PostPage.tsx`):**
    - [x] Fetches post by `slug`.
    - [x] Render full HTML content safely (DOMPurify).
    - [x] Display Metadata (Author, Date, Tags, Read Time).
    - [x] **Syntax Highlighting** for code blocks using `highlight.js`.
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

### Phase 7: Advanced UI & Features (IN PROGRESS)
- [x] **Homepage CTA:** Added a "Journal & Symptom Tracker" call-to-action section.
- [x] **Journal & Symptom Tracker (COMPLETED):**
    - [x] Create dedicated `/journal` page (protected route).
    - [x] Implement UI for creating and viewing entries.
    - [x] Set up `journals` collection in Firestore.
    - [x] Add Edit and Delete functionality for journal entries.
    - [x] Implement filtering and searching for journal entries.
- [ ] **Symptom Data Visualization (IN PROGRESS):**
    - [ ] Create a new component for symptom visualization.
    - [ ] Use a charting library (e.g., Chart.js or D3) to display symptom frequency and trends over time.
    - [ ] Integrate the visualization component into the Journal page.
- [ ] **Typography System:**
    - [ ] Headings: Space Grotesk (Bold, tight tracking).
    - [ ] Body: Inter (Relaxed leading).
    - [ ] Accessibility: OpenDyslexic toggle integration.
- [ ] **Core UI Components:**
    - [ ] "Symptom-Safe" Toggle (Reduced motion, high contrast mode).
    - [ ] Glass Card: Dark glass aesthetic with hover glow (no scale).
    - [ ] "Zipper" Progress Bar.
- [ ] **Layout Updates:**
    - [ ] Landing Page: Aurora Borealis background, new copy, 3D anatomical anchor.
    - [ ] Article View: Centered single column (max 700px), "AI Brief", "Listen" button.
    - [ ] Admin Dashboard: "The Muse" AI panel (Sentiment/Readability gauge).
- [ ] **Interactive Features:**
    - [ ] Sentiment Search (Filter by vibe).
    - [ ] "Spoon" Visualizer (Complexity rating).
- [ ] **Footer:** Update copyright to "Chiari Voices Foundation".

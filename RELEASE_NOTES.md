# Release Notes - Chiari Voices Blog Platform
**Date:** December 24, 2025

## Project Overview
Chiari Voices is a comprehensive, accessible, and community-driven blog platform designed specifically for individuals and families navigating Chiari Malformation. The platform combines a powerful CMS for administrators with a supportive environment for users to share their stories.

---

## Latest Features & Enhancements (v1.5.0)

### 🖋️ Professional Blog Editor (Tiptap Integration)
*   **Rich Text Toolbar:** Comprehensive editing suite including Bold, Italic, Underline, Strike, and Highlighting.
*   **Advanced Formatting:** Support for Blockquotes, Subscript, Superscript, and Task Lists.
*   **Dynamic Typography:** Automatic conversion of special character sequences (e.g., smart dashes and symbols).
*   **Precise Alignment:** Left, Center, Right, and Justify alignment controls.
*   **Intelligent Indentation:** Added Indent/Outdent controls with smart list detection (properly nests bullet points).
*   **Font Size Control:** Intuitive +/- controls for adjusting text size in pixels.
*   **Sticky Toolbar:** The editor toolbar now follows the user during long article scrolls.
*   **Live Metadata:** Real-time Word and Character count tracking.
*   **UI/UX:** High-contrast dark mode toolbar (`bg-slate-950`) for maximum visibility in the admin dashboard.

### 📁 Media & Document Handling
*   **Integrated Image Uploads:** Seamlessly upload images directly from the editor to Firebase Storage. Filenames are preserved for SEO.
*   **Word Document Importer:** Support for importing `.docx` files directly into the editor while preserving basic formatting (headings, lists, bold/italic).

### 🛠️ Admin Dashboard Evolution
*   **Mobile Responsiveness:** Completely redesigned for use on phones and tablets.
*   **Advanced List View:** Added columns for **Created Date**, **Published Date**, and **Updated Date**.
*   **Precise Alignment:** All dashboard data is now perfectly aligned using fixed-width columns for a clean, professional look.
*   **Quick Preview:** New "Eye" icon in the post list to view articles exactly as they will appear to users without leaving the dashboard.
*   **Editor Preview:** "Preview" button within the editor to verify layout and media before saving changes.
*   **Save Feedback:** Real-time visual confirmation ("Changes saved successfully") when updating posts.

### 🛡️ Core Infrastructure & Security
*   **Firebase Consolidation:** Resolved "Duplicate App" initialization errors by centralizing configuration in `src/lib/firebase.ts`.
*   **Role-Based Access Control:** Hardened Firestore security rules to ensure private journal entries and restricted admin access while maintaining public readability for posts.
*   **Admin Setup Tool:** A temporary utility to help project owners promote themselves to the Admin role securely.

---

## Historical Feature Set

### 🔑 Authentication & Identity
*   **Social Sign-In:** Support for Google and Facebook authentication.
*   **Email Auth:** Standard email/password registration and login.
*   **User Profiles:** Customizable profiles with avatars (Firebase Storage) and bios.

### 📔 Community & Journaling
*   **Private Journal:** A secure space for users to log daily experiences.
*   **Symptom Tracker:** Integrated tagging of symptoms (headache, fatigue, etc.) within journal entries.
*   **Interactive Analytics:** Visual charts showing symptom frequency over time.
*   **Comments System:** Nested replies, upvoting/downvoting, and moderation reporting.

### ♿ Accessibility & Safety
*   **Dyslexia Support:** Integrated OpenDyslexic font toggle.
*   **Symptom-Safe Mode:** Ability to blur potentially triggering images until hovered.
*   **Floating Accessibility Menu:** Quick access to visibility and font settings from any page.

### 🔍 Content & SEO
*   **Dynamic Routing:** SEO-friendly URL slugs for all blog posts.
*   **Metadata Management:** Individual SEO titles, descriptions, and keyword management for every post.
*   **Reading Time:** Automatic calculation of "X min read" based on content length.
*   **Social Sharing:** Integrated buttons for sharing posts to Twitter, Facebook, and LinkedIn.

---
© 2025 The Chiari Voices Foundation. All Rights Reserved.

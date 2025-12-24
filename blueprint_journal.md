# Blueprint: AI-Powered Journal Application

## 1. Overview

This document outlines the plan for building a modern, robust, and feature-rich journal application. The application will be built using React, Firebase, and other modern web technologies, with a focus on creating a seamless and error-free user experience. The journal feature allows users to create, edit, and delete private journal entries with a rich text editor.

## 2. Core Features

- **User Authentication:** Secure user sign-up and login functionality using Firebase Authentication.
- **Journal Management:**
    - Create, read, update, and delete journal entries.
    - A dashboard displaying a list of all journal entries for the logged-in user.
    - Search functionality to filter journal entries.
- **Rich Text Editor:** A powerful WYSIWYG editor for writing and editing journal entries, built with Slate.js.
- **Individual Entry Pages:** Each journal entry has its own page for viewing the full content.

## 3. Technical Stack

- **Frontend:** React with Vite
- **Backend & Database:** Firebase (Firestore, Authentication)
- **Styling:** Tailwind CSS
- **Rich Text Editor:** Slate.js
- **Routing:** React Router

## 4. Project Structure

```
src
├── assets
├── components
│   ├── auth
│   │   ├── Login.tsx
│   │   └── SignUp.tsx
│   ├── common
│   │   ├── Navbar.tsx
│   │   └── ...
│   ├── journal
│   │   ├── JournalEditor.tsx
│   │   └── SlateRenderer.tsx
│   └── ui
│       ├── Button.tsx
│       ├── Input.tsx
│       └── GlassPanel.tsx
├── hooks
│   └── useAuth.ts
├── pages
│   ├── HomePage.tsx
│   ├── Journal.tsx
│   ├── JournalPage.tsx
│   ├── NewJournalEntry.tsx
│   └── EditJournalEntry.tsx
├── utils
│   └── slate.ts
├── App.tsx
├── main.tsx
├── firebase.ts
└── styles.css
```

## 5. Implementation Plan

1.  **Setup Firebase:** Initialize Firebase and configure Authentication and Firestore. (✓)
2.  **Implement Authentication:** Build the `Login` and `SignUp` components and the `useAuth` hook. (✓)
3.  **Create Core Pages & Routing:** Set up `HomePage`, `Journal` (dashboard), `JournalPage` (for viewing), `NewJournalEntry`, and `EditJournalEntry` with routing. (✓)
4.  **Build the Journal Dashboard:** Implement the `Journal` component to display a user's journal entries, including search and delete functionality. (✓)
5.  **Implement the Rich Text Editor:** Create the `JournalEditor` component using Slate.js and integrate it into the `NewJournalEntry` and `EditJournalEntry` pages. (✓)
6.  **Connect to Firestore:** Implement the logic to save, retrieve, update, and delete journal entries in Firestore. (✓)
7.  **Create Individual Entry View:** Build the `JournalPage` to display the full content of a single entry, with an edit button. (✓)
8.  **Create Content Renderer:** Implement the `SlateRenderer` component to correctly display the rich text content. (✓)
9.  **Styling and UI Polish:** Apply Tailwind CSS and custom components to create a modern and visually appealing user interface. (✓)
10. **Refine Snippet Display:** Created a utility to parse and show a plain-text snippet of the journal content on the dashboard. (✓)


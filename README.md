
# Chiari Voices - A Community Blog Platform

## 1. Overview

This repository contains the source code for Chiari Voices, a comprehensive blog platform built for the Chiari malformation community. The platform provides a secure and supportive space for users to share stories, connect with others, and find information. It is built using a modern technology stack, with a focus on performance, security, and user experience, consistent with the look and feel of `chiarivoices.org`.

---

## 2. Core Architecture & Technology Stack

*   **Frontend:** React with Vite (TypeScript)
*   **Backend:** Firebase (Authentication, Cloud Firestore, Cloud Storage, Cloud Functions)
*   **Styling:** Tailwind CSS
*   **Component Library:** Shadcn/ui

---

## 3. Design and User Experience (UX)

*   **Color Scheme:** The platform uses a dark theme with purple and teal accents, mirroring the branding of `chiarivoices.org`.
*   **Layout:** The layout is clean, modern, and fully responsive, ensuring a seamless experience across desktops, tablets, and mobile devices.
*   **Visual Style:** A subtle **Glassmorphism** effect is used for key UI elements to create a sense of depth and hierarchy.
*   **Typography:**
    *   **Body:** `Inter` for excellent readability.
    *   **Headlines:** `Space Grotesk` for a bold, distinctive look.

---

## 4. Key Features

### Foundation & Authentication

*   **Secure Authentication:** Users can register and log in using Email/Password, Google, or Facebook.
*   **User Roles:** The platform supports three user roles:
    *   **Admin:** Full control over all content and users.
    *   **Moderator:** Can create, edit, and delete posts and manage comments.
    *   **User:** Can create an account, comment on posts, and manage their own profile.
*   **Firestore Security:** Robust Firestore Security Rules are in place to protect user data and control access based on roles.

### Content Management (for Admins & Moderators)

*   **Admin Dashboard:** A dedicated, secure dashboard for managing the platform.
*   **Rich Post Editor:** A full-featured WYSIWYG editor for creating and editing blog posts, including support for rich text formatting and media embedding.
*   **Media Uploads:** Seamlessly upload images and videos to Firebase Cloud Storage.
*   **Post Management:** A comprehensive interface for administrators and moderators to perform CRUD (Create, Read, Update, Delete) operations on all blog posts.

### Public Blog & User Features

*   **Blog Feed:** A main blog page that lists all published articles in a clean, easy-to-browse format.
*   **Individual Post Pages:** A well-designed page for reading single articles, complete with author information, publish date, and tags.
*   **Nested Comments:** A Reddit-style nested commenting system that allows for threaded conversations on each post.
*   **User Profiles:** Private user profiles where individuals can update their information and view their bookmarked articles.

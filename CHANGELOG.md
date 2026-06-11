# Changelog

All notable changes to the WriteSpace project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-06-15

### Added

- **Public Landing Page** — Hero section with gradient background, feature cards (Write & Publish, Community Driven, Role-Based Access), latest posts preview, and footer with branding.
- **Login Page** — Username and password form with inline error messages. Authenticates against hard-coded admin account and localStorage-registered users. Redirects admin to `/admin` and regular users to `/dashboard`.
- **Registration Page** — Display name, username, password, and confirm password form. Validates required fields, password match, username uniqueness, and minimum length. Creates user in localStorage and auto-logs in.
- **Role-Based Routing** — `ProtectedRoute` component guards authenticated and admin-only routes. Unauthenticated users redirected to `/login`. Non-admin users redirected to `/dashboard` when accessing admin routes.
- **Blog CRUD with Ownership** — Create, read, edit, and delete blog posts. Posts stored in localStorage with UUID, title, content, author, authorRole, userId, and timestamps. Edit and delete restricted to post owner or admin.
- **Blog List (Home)** — Responsive grid of `BlogCard` components sorted by newest first. Displays title, content excerpt, author avatar, creation date, and ownership-aware edit/delete buttons. Empty state with call-to-action.
- **Read Blog View** — Full post display with title, content, author avatar, creation date, and back navigation. Edit/delete buttons for owner or admin. Not-found state for missing posts.
- **Write/Edit Blog Form** — Shared form for creating and editing posts. Title and content fields with validation. Edit mode loads existing post and enforces ownership. Redirects to dashboard on success.
- **Admin Dashboard** — Gradient header with welcome message. Stat cards for total posts, total users, admins, and regular users. Quick action buttons for writing posts and managing users. Recent posts grid with edit/delete controls.
- **User Management** — Admin-only page with create user form (display name, username, password, role). Enforces username uniqueness. User list displayed as responsive table (desktop) and card list (mobile) via `UserRow` component. Delete with confirmation, disabled for default admin and self.
- **Default Admin Account** — Hard-coded admin credentials (`admin` / `admin`) available without registration. Not stored in localStorage.
- **localStorage Persistence** — All data persisted in browser localStorage under `writespace_session`, `writespace_users`, and `writespace_posts` keys. Safe read/write utilities with JSON parse error handling and storage-full fallbacks.
- **Authentication Utilities** — `auth.js` module with `login`, `register`, `getSession`, `setSession`, `clearSession`, `isAuthenticated`, and `isAdmin` functions. Input validation, trimming, and uniqueness checks.
- **Storage Utilities** — `storage.js` module with CRUD functions for posts (`getPosts`, `getPostById`, `addPost`, `updatePost`, `deletePost`), users (`getUsers`, `getUserByUsername`, `addUser`, `deleteUser`), and session (`getSession`, `setSession`, `clearSession`).
- **Responsive Tailwind UI** — All components styled with Tailwind CSS utility classes. Mobile-first responsive design with hamburger menus, grid layouts, and adaptive card/table views.
- **Reusable Components** — `Avatar` (role-based emoji avatar), `BlogCard` (post preview card), `Navbar` (authenticated navigation), `PublicNavbar` (landing page navigation), `StatCard` (admin dashboard stat), `UserRow` (user management row/card), `ProtectedRoute` (route guard).
- **Client-Side Routing** — React Router v6 with `BrowserRouter`, `Routes`, and `Route`. Route map covering public, authenticated, and admin-only paths with catch-all redirect to `/`.
- **Vercel Deployment** — `vercel.json` with SPA rewrite rule ensuring all routes resolve to `index.html` for client-side routing support.
- **Vite Build Tooling** — Vite 5 with `@vitejs/plugin-react` for fast development server with HMR and optimized production builds.
- **Testing Setup** — Vitest with jsdom environment, `@testing-library/react`, `@testing-library/jest-dom`, and `@testing-library/user-event`. Unit tests for auth and storage utilities. Integration tests for routing, pages, and user interactions.
- **PropTypes Validation** — Runtime prop type checking on all reusable components using the `prop-types` library.
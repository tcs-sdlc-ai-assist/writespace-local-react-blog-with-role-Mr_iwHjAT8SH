# WriteSpace

A simple, beautiful blogging platform built as a single-page application with React. No backend required — all data is persisted in the browser's localStorage.

## Tech Stack

- **React 18** — UI library
- **React Router v6** — Client-side routing
- **Vite 5** — Build tool and dev server
- **Tailwind CSS 3** — Utility-first CSS framework
- **Vitest** — Unit and integration testing
- **PropTypes** — Runtime prop validation

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- npm (included with Node.js)

### Installation

```bash
npm install
```

### Development

Start the local development server with hot module replacement:

```bash
npm run dev
```

The app will be available at `http://localhost:5173` by default.

### Build

Create an optimized production build:

```bash
npm run build
```

Output is written to the `dist/` directory.

### Preview

Preview the production build locally:

```bash
npm run preview
```

### Testing

Run all tests once:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

## Folder Structure

```
writespace/
├── index.html                  # HTML entrypoint with root div
├── package.json                # Dependencies and scripts
├── vite.config.js              # Vite build configuration
├── vitest.config.js            # Vitest test configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── postcss.config.js           # PostCSS plugin configuration
├── vercel.json                 # Vercel SPA rewrite rules
├── src/
│   ├── main.jsx                # App entrypoint — mounts React app with BrowserRouter
│   ├── App.jsx                 # Root component with route definitions
│   ├── App.test.jsx            # Route integration tests
│   ├── index.css               # Tailwind CSS directives
│   ├── setupTests.js           # Test setup (jest-dom matchers)
│   ├── components/
│   │   ├── Avatar.jsx          # Role-based avatar component
│   │   ├── BlogCard.jsx        # Blog post preview card
│   │   ├── Navbar.jsx          # Authenticated navigation bar
│   │   ├── ProtectedRoute.jsx  # Route guard for auth and admin access
│   │   ├── PublicNavbar.jsx     # Public landing page navigation bar
│   │   ├── StatCard.jsx        # Admin dashboard stat card
│   │   └── UserRow.jsx         # User management row/card component
│   ├── pages/
│   │   ├── AdminDashboard.jsx  # Admin overview with stats and recent posts
│   │   ├── Home.jsx            # Blog list page for authenticated users
│   │   ├── Home.test.jsx       # Home page tests
│   │   ├── LandingPage.jsx     # Public landing page with hero and features
│   │   ├── LandingPage.test.jsx# Landing page tests
│   │   ├── LoginPage.jsx       # Login form page
│   │   ├── LoginPage.test.jsx  # Login page tests
│   │   ├── ReadBlog.jsx        # Single blog post read view
│   │   ├── RegisterPage.jsx    # Registration form page
│   │   ├── UserManagement.jsx  # Admin user management page
│   │   └── WriteBlog.jsx       # Blog create/edit form page
│   └── utils/
│       ├── auth.js             # Authentication and session utilities
│       ├── auth.test.js        # Auth utility tests
│       ├── storage.js          # localStorage CRUD utilities
│       └── storage.test.js     # Storage utility tests
```

## Route Map

| Path             | Component        | Access          | Description                        |
| ---------------- | ---------------- | --------------- | ---------------------------------- |
| `/`              | LandingPage      | Public          | Landing page with hero and features |
| `/login`         | LoginPage        | Public          | Login form                         |
| `/register`      | RegisterPage     | Public          | Registration form                  |
| `/dashboard`     | Home             | Authenticated   | Blog post list                     |
| `/create`        | WriteBlog        | Authenticated   | Create new blog post               |
| `/edit/:id`      | WriteBlog        | Authenticated   | Edit existing blog post            |
| `/read/:id`      | ReadBlog         | Authenticated   | Read single blog post              |
| `/admin`         | AdminDashboard   | Admin only      | Admin overview dashboard           |
| `/admin/users`   | UserManagement   | Admin only      | User management panel              |
| `*`              | —                | Public          | Redirects to `/`                   |

## localStorage Schema

All application data is persisted in the browser's localStorage under the following keys:

### `writespace_session`

Stores the current user session.

```json
{
  "userId": "string (optional, absent for hard-coded admin)",
  "username": "string",
  "role": "admin | user",
  "loggedInAt": "ISO 8601 date string"
}
```

### `writespace_users`

Stores registered user accounts as a JSON array.

```json
[
  {
    "id": "string (UUID)",
    "username": "string",
    "password": "string (plaintext, demo only)",
    "displayName": "string",
    "role": "admin | user",
    "createdAt": "ISO 8601 date string"
  }
]
```

> **Note:** A hard-coded admin account exists with username `admin` and password `admin`. This account is not stored in localStorage.

### `writespace_posts`

Stores blog posts as a JSON array.

```json
[
  {
    "id": "string (UUID)",
    "title": "string",
    "content": "string",
    "author": "string",
    "authorRole": "admin | user",
    "userId": "string",
    "createdAt": "ISO 8601 date string",
    "updatedAt": "ISO 8601 date string"
  }
]
```

## Default Admin Account

The application includes a hard-coded admin account for immediate access:

- **Username:** `admin`
- **Password:** `admin`

## Deployment

### Vercel

This project is configured for deployment on [Vercel](https://vercel.com/) as a static SPA.

1. Push the repository to GitHub, GitLab, or Bitbucket.
2. Import the project in the Vercel dashboard.
3. Vercel will auto-detect the Vite framework and apply the correct build settings:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. The included `vercel.json` configures SPA rewrites so that all routes resolve to `index.html`:
   ```json
   {
     "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
   }
   ```
5. Deploy. All client-side routes will work with direct URL access.

### Other Static Hosts

For other static hosting providers (Netlify, GitHub Pages, etc.), ensure that all routes are rewritten to `index.html` to support client-side routing.

## License

This project is private and proprietary. All rights reserved. Unauthorized copying, distribution, or modification of this project is strictly prohibited.
# Medium Lab — Phase 2 Frontend Capstone

A full-featured Medium-style publishing platform built with modern web technologies. This project demonstrates a complete content management system with authentication, rich text editing, social features, and real-time interactions.

## 📋 Description

Medium Lab is a comprehensive blogging and publishing platform inspired by Medium. It allows users to create, edit, and publish markdown-based articles with features like comments, reactions (claps), following authors, personalized feeds, tag filtering, and search functionality. The application is built using Next.js 16 with the App Router, providing server-side rendering, static generation, and optimized performance.

## ✨ Features

### Authentication & User Management
- Email/password authentication via NextAuth.js
- User registration and login
- Protected routes for authenticated content
- User profiles with customizable bio and avatar
- Account management page

### Content Creation & Management
- Rich markdown editor with live preview
- Cover image support with preview
- Draft and publish workflow
- Edit and delete posts
- Post slug-based URLs for SEO-friendly routing

### Social Features
- Comments system (add and delete comments)
- Clap reactions with optimistic UI updates
- Follow/unfollow authors
- Personalized feed based on followed authors

### Content Discovery
- Home page with featured and trending posts
- Personalized feed for logged-in users
- Tag-based filtering and tag pages
- Search functionality with debounced queries
- Pagination for all content lists

### Technical Features
- Server-side rendering (SSR) and static site generation (SSG)
- Image optimization using Next.js Image component
- Rate limiting for authentication endpoints
- TypeScript for type safety
- Unit tests with Jest and React Testing Library
- Code formatting with Prettier
- ESLint for code quality
- CI/CD pipeline with GitHub Actions

## 🛠️ Technologies Used

### Core Framework
- **Next.js 16.0.3** - React framework with App Router
- **React 19.2.0** - UI library
- **TypeScript 5** - Type-safe JavaScript

### Authentication & Database
- **NextAuth.js 4.24.13** - Authentication library
- **Supabase** - Backend-as-a-Service (PostgreSQL database)
- **@supabase/supabase-js 2.45.0** - Supabase client
- **@supabase/ssr 0.7.0** - Server-side rendering support
- **bcryptjs 3.0.3** - Password hashing

### Styling & UI
- **Tailwind CSS 4** - Utility-first CSS framework
- **@tailwindcss/postcss 4** - PostCSS integration

### Data Fetching & State
- **SWR 2.3.6** - Data fetching and caching library

### Content
- **react-markdown 10.1.0** - Markdown rendering

### Development Tools
- **Jest 29.7.0** - Testing framework
- **@testing-library/react 16.0.1** - React testing utilities
- **@testing-library/jest-dom 6.4.1** - Jest DOM matchers
- **ESLint 9** - Linting
- **Prettier 3.6.2** - Code formatter
- **ts-jest 29.1.2** - TypeScript Jest transformer

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

1. **Node.js 18+** - [Download](https://nodejs.org/)
2. **npm 9+** - Comes with Node.js
3. **Supabase Account** - [Sign up](https://supabase.com/) (free tier works)

## 🚀 Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Yvette334/medium.git
cd medium
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Create a new project at [Supabase](https://supabase.com/)
2. Go to **SQL Editor** in your Supabase dashboard
3. Run the following SQL to create the required tables:

```sql
create extension if not exists "uuid-ossp";

create table if not exists users (
  id uuid primary key default uuid_generate_v4(),
  name text,
  email text unique not null,
  password text not null,
  bio text default '',
  avatar text default '',
  following text[] default '{}',
  created_at timestamptz default now()
);

create table if not exists posts (
  id uuid primary key default uuid_generate_v4(),
  author_email text references users(email) on delete cascade,
  author_name text,
  title text not null,
  excerpt text,
  content text not null,
  cover_image text,
  tags text[] default '{}',
  slug text unique not null,
  published boolean default false,
  draft boolean default true,
  claps integer default 0,
  created_at timestamptz default now()
);

create table if not exists comments (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid references posts(id) on delete cascade,
  author_email text references users(email) on delete cascade,
  author_name text,
  body text not null,
  created_at timestamptz default now()
);
```

4. **Disable RLS (Row Level Security)** for local development:
   - Go to **Authentication** → **Policies** in Supabase
   - Or run this SQL: `ALTER TABLE users DISABLE ROW LEVEL SECURITY;` (and similar for other tables)

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_GA_ID=your-google-analytics-id
```

**Where to find these values:**
- `NEXTAUTH_SECRET`: Generate a random string (e.g., `openssl rand -base64 32`)
- `SUPABASE_URL`: Found in **Settings** → **API** → **Project URL**
- `SUPABASE_SERVICE_ROLE_KEY`: Found in **Settings** → **API** → **service_role key** (keep this secret!)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Found in **Settings** → **API** → **anon/public key**
- `NEXT_PUBLIC_GA_ID`: Optional, your Google Analytics tracking ID

## ▶️ How to Run

### Development Mode

```bash
npm run dev
```

The application will start at `http://localhost:3000`

**Note:** Restart the dev server whenever you change environment variables.

### Production Build

```bash
npm run build
npm start
```

### Other Available Scripts

```bash
npm run lint          # Run ESLint to check code quality
npm run test          # Run Jest tests
npm run format        # Format code with Prettier
npm run format:check  # Check code formatting without making changes
```

## 📁 Project Structure

```
medium/
├── app/                          # Next.js App Router pages
│   ├── api/                      # API routes
│   │   ├── auth/
│   │   │   └── [...nextauth]/    # NextAuth.js handler
│   │   ├── claps/                # Clap reactions endpoint
│   │   ├── comments/             # Comments CRUD endpoints
│   │   │   └── [id]/             # Delete comment endpoint
│   │   ├── follow/               # Follow/unfollow endpoint
│   │   ├── posts/                # Posts CRUD endpoints
│   │   │   └── [id]/             # Get/update/delete post
│   │   └── users/                # User endpoints
│   │       ├── me/               # Get current user
│   │       └── register/         # User registration
│   ├── auth/
│   │   ├── login/                # Login page
│   │   └── register/             # Registration page
│   ├── editor/                   # Markdown editor page
│   ├── feed/                     # Personalized feed page
│   ├── account/                  # Account management page
│   ├── profile/                  # User profile page
│   ├── search/                   # Search page
│   ├── tags/[tag]/               # Tag filtering page
│   ├── posts/[slug]/             # Post detail page
│   │   └── edit/                 # Post edit page
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Home page
│   └── globals.css                # Global styles
├── components/                    # React components
│   ├── ClapButton.tsx             # Clap reaction button
│   ├── CommentsSection.tsx        # Comments display and form
│   ├── FollowButton.tsx           # Follow/unfollow button
│   ├── Footer.tsx                  # Site footer
│   ├── Header.tsx                  # Site header/navigation
│   ├── MarkdownImage.tsx          # Image component for markdown
│   ├── Pagination.tsx             # Pagination component
│   ├── PostCard.tsx               # Post preview card
│   ├── ProtectedRoute.tsx        # Route protection wrapper
│   ├── SessionProvider.tsx       # NextAuth session provider
│   └── Shell.tsx                  # Layout shell wrapper
├── lib/                           # Utility libraries
│   ├── auth.ts                    # NextAuth configuration
│   ├── rateLimit.ts               # Rate limiting helper
│   └── supabase.ts                # Supabase client setup
├── __tests__/                     # Unit tests
│   ├── ClapButton.test.tsx
│   ├── CommentsSection.test.tsx
│   ├── FollowButton.test.tsx
│   ├── PostCard.test.tsx
│   └── ProtectedRoute.test.tsx
├── .github/
│   └── workflows/
│       └── ci.yml                 # GitHub Actions CI/CD
├── next.config.ts                 # Next.js configuration
├── tsconfig.json                  # TypeScript configuration
├── jest.config.ts                 # Jest configuration
├── jest.setup.ts                  # Jest setup file
├── eslint.config.mjs              # ESLint configuration
├── .prettierrc.json               # Prettier configuration
└── package.json                   # Dependencies and scripts
```

## 🧪 Testing

The project includes unit tests for key components:

```bash
npm run test
```

Tests are located in the `__tests__/` directory and use:
- **Jest** for test running
- **React Testing Library** for component testing
- **@testing-library/jest-dom** for DOM matchers

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the repository in [Vercel](https://vercel.com/)
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment Variables for Production

Make sure to set all environment variables in your hosting platform:
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL` (your production URL)
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_GA_ID` (optional)

## 🔄 CI/CD

The project includes a GitHub Actions workflow (`.github/workflows/ci.yml`) that automatically:
- Runs ESLint
- Checks code formatting
- Runs TypeScript type checking
- Runs tests
- Builds the production bundle

This runs on every push and pull request to `main` or `master` branches.

## 📝 Additional Notes

### Rate Limiting
- Login: 5 attempts per email per 60 seconds
- Registration: 5 attempts per IP per 60 seconds
- Rate limiting is in-memory (resets on server restart)

### Image Handling
- Cover images and markdown images support external URLs
- Images are optimized using Next.js Image component
- Empty image sources are handled gracefully

### Security
- Passwords are hashed using bcrypt
- Service role key should never be exposed to the client
- RLS (Row Level Security) should be configured for production

### Performance
- Server-side rendering for SEO
- Static generation where possible
- Image optimization
- SWR for efficient data fetching and caching



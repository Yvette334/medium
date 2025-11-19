## Medium Lab — Phase 2 Frontend Capstone

A beginner-friendly Medium-style publishing platform that walks through the 10 labs in the Frontend Capstone brief. Built with **Next.js 16 (App Router)**, **NextAuth**, **Tailwind CSS v4**, **SWR**, **TypeScript**, and **React Markdown**.

### Highlights
- ✅ Lab 1 – Project setup, layout shell, navigation, and responsive container.
- ✅ Lab 2 – NextAuth credentials auth, signup/login, protected pages, profile + account editing.
- ✅ Lab 3 – Markdown editor with preview, image uploads, draft vs publish workflow.
- ✅ Lab 4 – Posts CRUD API, edit/delete UI, cover images, slug routes, and Next.js Image optimization.
- ✅ Lab 5 – Home feed, personalized feed, tag filtering, search with debounce, and pagination.
- ✅ Lab 6 – Comments, clap button, follow/unfollow authors with optimistic UX.
- ✅ Lab 7 – SWR-based fetching/caching plus lightweight context via SessionProvider.
- ✅ Lab 8 – TypeScript models, Jest + Testing Library tests, ESLint, Prettier, and Tailwind.
- ✅ Lab 9 – Metadata + Open Graph tags per post, server rendering, SSG/ISR, and Next.js Image optimization.
- ✅ Lab 10 – CI/CD pipeline, analytics setup, and ready for Vercel deployment.

### Folder Structure
```
app/
  api/…           // REST-style endpoints for auth, posts, comments, claps, follow, users
  auth/…          // login + registration flows
  editor/         // rich markdown editor
  profile/, account/, feed/, search/, tags/[tag], posts/[slug]
components/       // layout chrome, PostCard, comments, follow/clap buttons, guards
lib/              // NextAuth config, in-memory DB seed, user helpers
__tests__/        // unit tests (Jest + RTL)
```

### Scripts
```bash
npm install          # install deps
npm run dev          # start Next.js in dev mode
npm run lint         # eslint
npm run test         # jest + Testing Library
npm run format       # format code with Prettier
npm run format:check # check code formatting
npm run build        # production build (for Vercel)
npm start            # run production server locally
```

### Environment Variables
```
NEXTAUTH_SECRET=dev-secret
NEXTAUTH_URL=http://localhost:3000
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_GA_ID=your_google_analytics_id (optional)
```

### Notes
- Data is stored in an in-memory JSON store (`lib/db.ts`) shared by API routes so the project stays backend-free; swap it for real APIs when ready.
- Image uploads are mocked by inserting data URLs or external URLs from the editor.
- The README doubles as a progress checklist so you can report lab completion easily.

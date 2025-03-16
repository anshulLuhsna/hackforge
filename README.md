# Next.js Authentication with NextAuth.js

This project implements authentication using NextAuth.js with GitHub and Google providers.

## Project Structure

```
├── app/
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts
│   │   ├── auth/
│   │   │   └── signin/
│   │   │       └── page.tsx
│   │   ├── components/
│   │   │   ├── SessionProvider.tsx
│   │   │   └── UserInfo.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── middleware.ts
│   ├── .env.local
│   └── README.md
```

## Features

- Next.js 14 with App Router
- TypeScript support
- NextAuth.js authentication
- GitHub and Google OAuth providers
- Protected routes with middleware
- Responsive UI with Tailwind CSS
- User profile display
- Dark mode support

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
   - Copy `.env.local` to your project root
   - Generate a secret key:
     ```bash
     openssl rand -hex 32
     ```
   - Add the generated key to `NEXTAUTH_SECRET` in `.env.local`

3. Configure OAuth Providers:

### GitHub Setup:
1. Go to GitHub Settings > Developer settings > OAuth Apps > New OAuth App
2. Set Homepage URL to `http://localhost:3000`
3. Set Authorization callback URL to `http://localhost:3000/api/auth/callback/github`
4. Copy the Client ID and Client Secret to your `.env.local`:
   ```
   GITHUB_ID=your_client_id
   GITHUB_SECRET=your_client_secret
   ```

### Google Setup:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to Credentials > Create Credentials > OAuth Client ID
5. Set Application Type to "Web application"
6. Add `http://localhost:3000` to Authorized JavaScript origins
7. Add `http://localhost:3000/api/auth/callback/google` to Authorized redirect URIs
8. Copy the Client ID and Client Secret to your `.env.local`:
   ```
   GOOGLE_ID=your_client_id
   GOOGLE_SECRET=your_client_secret
   ```

## Running the Project

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Features Overview

- **Authentication**: Sign in with GitHub or Google
- **Protected Routes**: Middleware ensures authenticated access
- **User Profile**: Display user information and avatar
- **Responsive Design**: Mobile-friendly interface
- **Dark Mode**: Automatic dark mode based on system preferences 
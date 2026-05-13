This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Authentication and Gmail receipt scanning

Sanity supports two auth entry points:

- **Google + Firebase Auth**: the login page requests a Google OAuth token with Gmail read-only access, exchanges it with Firebase Authentication through the Identity Toolkit REST API, and stores a short-lived Gmail access token in session storage so receipts can be scanned after a page refresh without persisting the token across browser sessions.
- **WorkOS AuthKit**: `/auth/workos/sign-in`, `/auth/workos/callback`, and `/auth/workos/sign-out` are wired for hosted WorkOS authentication.

Create `.env.local` from `.env.example` and fill in:

```bash
WORKOS_CLIENT_ID="client_..."
WORKOS_API_KEY="sk_test_..."
WORKOS_COOKIE_PASSWORD="at-least-32-characters"
NEXT_PUBLIC_WORKOS_REDIRECT_URI="http://localhost:3000/auth/workos/callback"
NEXT_PUBLIC_GOOGLE_CLIENT_ID="your-google-oauth-client-id.apps.googleusercontent.com"
NEXT_PUBLIC_FIREBASE_API_KEY="your-firebase-web-api-key"
```

In Google Cloud, enable the Gmail API for the OAuth client and allow the Gmail read-only scope. In Firebase Console, enable Google as an Authentication sign-in provider. In WorkOS, configure the callback URL above and set the sign-in endpoint to `/auth/workos/sign-in`.

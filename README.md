# Next.js Session-based Auth Starter Template

## Motivation

Implementing authentication in Next.js, especially Email+Password authentication, can be challenging. NextAuth intentionally limits email password functionality to discourage the use of passwords due to security risks and added complexity. However, in certain projects, clients may require user password authentication. Lucia offers a flexible alternative to NextAuth.js, providing more customization options without compromising on security. This template serves as a starting point for building a Next.js app with secure session based authentication.

## Key Features

- **Authentication:** 💼 Support for Credential and OAuth authentication.
- **Authorization:** 🔒 Easily manage public and protected routes within the `app directory`.
- **Email Verification:** 📧 Verify user identities through email.
- **Password Reset:** 🔑 Streamline password resets by sending email password reset links.
- **Auth + tRPC:** 🔄 Similar to NextAuth with tRPC, granting access to sessions and user information through tRPC procedures.
- **E2E tests:** 🧪 Catch every issue before your users do with comprehensive E2E testing.
- **Stripe Payment:** 💳 Setup user subscriptions seamlessly with stripe.
- **Email template with react-email:** ✉️ Craft your email templates using React.
- **PostgreSQL Database:** 🛢️ Utilize a PostgreSQL database set up using Drizzle for enhanced performance and type safety.
- **Database Migration:** 🚀 Included migration script to extend the database schema according to your project needs.

## Tech Stack

- [Next.js](https://nextjs.org)
- [tRPC](https://trpc.io)
- [Drizzle ORM](https://orm.drizzle.team/)
- [PostgreSQL](https://www.postgresql.org/)
- [Stripe](https://stripe.com/)
- [Tailwind CSS](https://tailwindcss.com)
- [Shadcn UI](https://ui.shadcn.com/)
- [React Hook Form](https://www.react-hook-form.com/)
- [React Email](https://react.email/)
- [Playwright](https://playwright.dev/)

## Get Started

1. Clone this repository to your local machine.
2. Copy `.env.example` to `.env` and fill in the required environment variables.
3. Run `pnpm install` to install dependencies.
4. `(for node v18 or lower):` Uncomment polyfills for `webCrypto` in `src/lib/auth/index.ts`
5. Update app title, database prefix, and other parameters in the `src/lib/constants.ts` file.
6. Run `pnpm db:push` to push your schema to the database.
7. Execute `pnpm dev` to start the development server and enjoy!

## Testing

1. Install [Playwright](https://playwright.dev/) (use this command if you want to install chromium only `pnpm exec playwright install chromium --with-deps`)
2. Build production files using `pnpm build`
3. Run `pnpm test:e2e` (add --debug flag to open tests in browser in debug mode)

## Using Github actions

Add the following environment variables to your **github actions repository secrets** -
`DATABASE_URL`, `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`

## Roadmap

- [ ] Update Password
- [x] Stripe Integration
<!-- - [x] API Rate-Limiting see branch - [upstash-ratelimiting](https://github.com/iamtouha/next-lucia-auth/tree/upstash-ratelimiting) -->
- [ ] Admin Dashboard (under consideration)
- [ ] Role-Based Access Policy (under consideration)

## Contributing

To contribute, fork the repository and create a feature branch. Test your changes, and if possible, open an issue for discussion before submitting a pull request. Follow project guidelines, and welcome feedback to ensure a smooth integration of your contributions. Your pull requests are warmly welcome.

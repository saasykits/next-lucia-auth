# Next.js + Lucia Authentication

Auth implementation for nextjs is a pain. Specially Email+Password
authentication. NextAuth intentionally limeted email password functionality to-

> discourage use of passwords due to the inherent security risks associated with
> them and the additional complexity associated with supporting usernames and
> passwords.

But in some projects clients require user password authentication. Using 3rd
party auth providers are costly. Here, lucia comes to the rescure. Lucia is a
more flexible alternative to NextAuth.js. This template is a starting point for
building a nextjs app with Lucia authentication.

[Lucia](https://lucide.dev) is a server-side authentication library for TypeScript that aims to be unintrusive, straightforward, and flexible. At its core, it’s a library for managing users and sessions, providing the building blocks for setting up auth just how you want.

## Lucia v/s NextAuth.js (Auth.js)

Lucia is less opinionated than Next Auth. NextAuth is too rigid if you want to customize it. Although lucia has more setup but with that comes so much more flexibility.

## Key Features

- **Authentication and Authorization:** Signup and Login and protected app and api routes with Lucia auth
- **Email Verification:** User verification using email.
- **Password Reset:** Reset user passwords by emailing password reset link.
- **Lucia + Trpc:** similar to NextAuth with tRpc,access session and user from trpc proceedures.

## Tech Stack

- [Next.js](https://nextjs.org)
- [Lucia](https://lucide.dev)
- [tRPC](https://trpc.io)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Planetscale](https://planetscale.com/)
- [Tailwind CSS](https://tailwindcss.com)
- [Shadcn UI](https://ui.shadcn.com/)
- [React Hook Form](https://www.react-hook-form.com/)
- [React Email](https://react.email/)

## Get Started

1. Clone this repository in your pc.
2. Copy `.env.example` to `.env` and fill in the necessary environment variables.
3. Run `pnpm install` to install dependencies.
4. Update app title, database prefix and other parameters from `src/lib/constants.ts` file.
5. Run `pnpm db:push` to push your schema to database.
6. `pnpm dev` and enjoy!

## Contributing

If you would like to contribute, please fork the repository and use a feature branch. Pull requests are warmly welcome.

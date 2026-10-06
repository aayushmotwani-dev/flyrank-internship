# FlyRank Auth API

BE-03 adds Supabase Auth to a small Express API. It includes sign-up, password login, bearer-token verification, logout, two protected routes, public information, and Swagger UI with a Bearer authorization scheme.

## Setup

~~~bash
copy .env.example .env
npm install
npm start
~~~

Put the Supabase project URL and publishable/anon key in `.env`. Never commit `.env`; only `.env.example` belongs in the repository. Email confirmation can be disabled in a practice Supabase project if you want sign-up to return an immediate session.

The server-side Supabase client disables session persistence and auto-refresh. Each protected request passes its bearer token to `supabase.auth.getUser(token)`, which verifies the user with Supabase instead of trusting a decoded JWT locally.

## Routes

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `/auth/signup` | No | Create an account |
| POST | `/auth/login` | No | Return access and refresh tokens |
| POST | `/auth/logout` | Bearer token | Revoke the Supabase session |
| GET | `/public/info` | No | Public response |
| GET | `/protected/profile` | Bearer token | Return verified user details |
| GET | `/protected/dashboard` | Bearer token | Example protected resource |
| GET | `/docs` | No | Swagger UI |

## Status behavior

- `400` for missing or empty email/password.
- `401` for a failed login, missing bearer token, malformed bearer header, or invalid/expired token.
- `201` for sign-up, `200` for login and protected reads, and `204` for logout.

## Manual check

~~~bash
curl -i http://localhost:3000/public/info
curl -i http://localhost:3000/protected/profile
curl -i -X POST http://localhost:3000/auth/signup -H "Content-Type: application/json" -d "{\"email\":\"you@example.com\",\"password\":\"password123\"}"
curl -i -X POST http://localhost:3000/auth/login -H "Content-Type: application/json" -d "{\"email\":\"you@example.com\",\"password\":\"password123\"}"
curl -i http://localhost:3000/protected/profile -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
curl -i -X POST http://localhost:3000/auth/logout -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
~~~

Open `http://localhost:3000/docs`, click Authorize, enter the access token, and test the protected endpoints.

## Check

`npm test` runs the complete route and middleware flow with a small in-process auth double. It verifies input validation, 401 behavior, bearer parsing, protected responses, logout, and Swagger availability without requiring a real account or exposing credentials. A live Supabase smoke test still requires the learner's own project values in `.env`.

## Common mistakes I checked

- Committing `.env` or putting credentials in source: prevented with `.gitignore` and placeholders only.
- Trusting decoded JWT fields: protected routes call Supabase `getUser(token)`.
- Accepting `Bearer` with no token or accepting `Basic`: middleware rejects both.
- Returning `200` for every result: routes use the assignment's `400`, `401`, `201`, `200`, and `204` cases.
- Reusing a shared sessionful server client: the client is configured with persistence and auto-refresh disabled.
- Forgetting the Swagger security scheme: protected paths declare `bearerAuth`.
- Claiming logout instantly kills an access token: Supabase access tokens remain valid until expiry; logout revokes the session/refresh path.

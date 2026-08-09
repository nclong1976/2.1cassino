# Auth redirect feature branch

I created a feature branch `feature/auth-redirect` with a minimal example showing how registration and login immediately redirect to the homepage with the user's information.

What I added

- examples/auth/server
  - index.js: Minimal Express server with register/login/me/logout routes, sets an HttpOnly cookie on successful auth. Uses an in-memory Map as a user store (demo only).
  - package.json: minimal dependencies.
- examples/auth/src/auth
  - UserProvider.jsx: React Context provider to hold user state.
  - LoginForm.jsx: Example login form that calls /api/auth/login, stores user in context, navigates to '/'.
  - RegisterForm.jsx: Example register form that calls /api/auth/register, stores user in context, navigates to '/'.
  - HomePage.jsx: Example homepage that displays user info from context or restores session by calling /api/me.
- examples/auth/README-auth.md: run / integration instructions.

How to test locally

1. Start server

   cd examples/auth/server
   npm install
   npm start

   Server will listen on http://localhost:4000

2. Use a React app (or the app in this repo) and copy the components under `examples/auth/src/auth` into your frontend source tree.
   Ensure your dev server proxies API requests to http://localhost:4000 or enable CORS/origin configuration.

3. Use the RegisterForm to create a user — after a successful response the frontend sets the user into context and navigates to `/`, where HomePage shows the user info.

Notes & security

- This is a demonstration. Replace in-memory store with a real DB and do not use the demo secret in production.
- Hashing is included via bcrypt, but production must use secure cookie flags (secure: true) and HTTPS.
- Because you requested no email verification, the register route creates the user immediately and returns user info.

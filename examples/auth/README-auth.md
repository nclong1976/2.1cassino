# Example auth implementation (server + React components)

This folder contains a minimal example of an auth flow where register/login returns user data and sets an HttpOnly cookie, and the frontend stores the user in Context and redirects to the homepage to display user info.

NOTES
- This is a sample implementation meant for demonstration and integration. Do NOT use in production without adapting security measures (persistent DB, proper session handling, HTTPS, environment secrets, refresh tokens, CSRF protection, rate limiting, etc.).

Server: runs on port 4000 by default. Frontend: example React components provided under src/auth.

# Propostas & Atividades — v0.6.2 (Auth-guarded)

## Quick start
1. Copy `.env.example` → `.env` and fill DB + JWT_SECRET.
2. Create DB tables with `db/create_tables.sql` (phpMyAdmin).
3. Insert a user row into `users` with a bcrypt hash in `password_hash`.
4. `npm i` then `npm run dev` (local). Push to Vercel for deploy.

## Auth
- All routes enforced by `middleware.js` and `(protected)/layout.jsx`.
- `/login` is public; it redirects to `/dashboard` if already logged.

## Notes
- APIs are marked `runtime='nodejs'` & `dynamic='force-dynamic'` to avoid DB calls at build-time on Vercel.
- Basic CRUD on companies, proposals (incl. approve→activity+order), activities, contracts (planner), orders.

# Vercel Setup

## 1) Environment Variables (Project Settings → Environment Variables)
- DB_HOST=<your hostgator mysql host>
- DB_PORT=3306
- DB_USER=<user>
- DB_PASS=<password>
- DB_NAME=<database>
- JWT_SECRET=<a strong random secret>
- (optional) SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM, MAIL_TO_BILLING, MAIL_TO_TECH

## 2) Remote MySQL Access
Ensure your HostGator MySQL accepts remote connections from Vercel.
If they require IP allowlists, set the MySQL user host to `%` (any host) or use a managed MySQL provider without IP allowlists.

## 3) No Build-Time DB Calls
This build sets `dynamic='force-dynamic'` on pages and `runtime='nodejs'` on API routes so the build phase does not attempt DB connections.

## 4) Deploy
After setting env vars, redeploy. Use Functions logs to debug runtime DB connectivity if any failure occurs.

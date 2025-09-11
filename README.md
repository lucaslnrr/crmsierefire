# Propostas & Atividades — v0.6.2 (bundle completo)

## Como rodar
1. Copie `.env.example` para `.env` e preencha:
   - `DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME` (HostGator)
   - `JWT_SECRET` (string longa e aleatória)
2. No phpMyAdmin, execute `db/create_tables.sql`.
3. Insira pelo menos 1 usuário em `users` com `password_hash` em **bcrypt** (posso gerar o SQL se me passar email/senha).
4. `npm i` e depois `npm run dev` (local). Para Vercel, suba o código e configure as mesmas variáveis de ambiente.

## Auth e navegação
- `middleware.js` protege tudo (exceto `/login`, `/api/auth/login`, `/api/auth/logout`).
- `src/app/page.jsx` redireciona `/` → `/login` (sem cookie) ou `/dashboard` (com cookie).
- Layout protegido em `src/app/(protected)/layout.jsx` re-checa o JWT (server-side) e exibe a navbar.

## Rotas principais
- Páginas:
  - `/dashboard`
  - `/calendar`
  - `/companies`
  - `/proposals`
  - `/contracts`
  - `/contracts/[id]/planner`
  - `/orders`
  - `/orders/[id]`
  - `/activities/[id]`
- APIs: users, companies, services, proposals (aprovar → cria activity + pedido), contracts (+planner), orders, activities.

## Observações
- Todas as APIs têm `runtime = 'nodejs'` e `dynamic='force-dynamic'` para não tentar conectar no build da Vercel.
- CSS simples em `globals.css` (navbar fixa, cards, tabelas, formulários).

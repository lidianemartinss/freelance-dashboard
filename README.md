# Freelance Dashboard

A personal dashboard for managing freelance design work and tracking savings progress toward a goal (e.g. a master's program in Italy).

Stack: Next.js 14 (App Router), Prisma, Neon Postgres, Tailwind CSS. Single-user, no login.

## Features

- **Overview** — savings goal progress bar, this month's income, active projects, and upcoming tasks at a glance.
- **Projects** — track clients, budgets, deadlines, and status (lead / active / paused / completed / cancelled).
- **Income** — log payments against projects (or standalone), mark as pending / invoiced / paid, see totals.
- **Tasks** — a simple to-do list with priority and due dates, optionally linked to a project.
- **Goal** — set your target amount, currency, target date, and notes.

## Quick start

```bash
npm install
cp .env.example .env   # then fill in your Neon DATABASE_URL
npm run db:push
npm run db:seed        # optional — adds sample data
npm run dev
```

See `DEPLOYMENT.md` for the full step-by-step guide to setting up Neon and deploying to Vercel.

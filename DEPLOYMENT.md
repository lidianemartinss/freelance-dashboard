# Deployment Guide

Your dashboard is a Next.js 14 app with a Neon Postgres database. No login system — it's single-user, just for you. Follow these steps in order.

## 1. Create the Neon database

1. Go to https://neon.tech and sign up / log in.
2. Create a new project (any name, e.g. "freelance-dashboard"). Pick a region close to you.
3. On the project dashboard, find the **Connection string**. Make sure you copy the **pooled** connection string (it contains `-pooler` in the hostname). It looks like:
   ```
   postgresql://user:password@ep-xxxx-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
4. Save this somewhere safe — you'll need it twice (locally and in Vercel).

## 2. Push the code to GitHub

1. Create a new empty repository on GitHub (e.g. "freelance-dashboard"). Don't initialize it with a README.
2. From the `freelance-dashboard` folder on your computer:
   ```bash
   cd freelance-dashboard
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/freelance-dashboard.git
   git push -u origin main
   ```

## 3. Set up locally first (recommended, to seed data)

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create `.env` from the example and paste in your Neon connection string:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` so it has:
   ```
   DATABASE_URL=postgresql://user:password@ep-xxxx-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
3. Push the schema to Neon:
   ```bash
   npm run db:push
   ```
4. (Optional) Seed example data — a sample goal, projects, payments, and tasks so the dashboard isn't empty on first load:
   ```bash
   npm run db:seed
   ```
   Skip this if you'd rather start from a blank slate and enter your own data through the UI.
5. Run it locally to confirm everything works:
   ```bash
   npm run dev
   ```
   Open http://localhost:3000.

## 4. Deploy to Vercel

1. Go to https://vercel.com and sign up / log in (you can use your GitHub account).
2. Click **Add New > Project**, then import the `freelance-dashboard` GitHub repo.
3. Vercel will auto-detect Next.js. Before deploying, add an environment variable:
   - Name: `DATABASE_URL`
   - Value: the same pooled Neon connection string from step 1
   - Apply to: Production, Preview, and Development
4. Click **Deploy**. Vercel runs `prisma generate && next build` automatically (this is the `build` script in `package.json`), so the Prisma client is generated fresh against your schema during the build — no extra steps needed.
5. Once deployed, Vercel gives you a URL like `freelance-dashboard.vercel.app`. That's your dashboard.

## 5. Day-to-day use

- Visit your Vercel URL any time to log income, update projects, manage tasks, and track progress toward your goal.
- If you ever change `prisma/schema.prisma`, run `npm run db:push` locally (pointed at the same `DATABASE_URL`) to sync the change to Neon, then commit and push the code — Vercel redeploys automatically on every push to `main`.
- To inspect or edit data directly, run `npm run db:studio` locally — opens Prisma Studio, a GUI for your database.

## Troubleshooting

- **Build fails on Vercel with a Prisma error**: double-check `DATABASE_URL` is set correctly in Vercel's project settings (Settings > Environment Variables) and that you used the *pooled* connection string.
- **"Too many connections" errors**: make sure you're using the pooled Neon connection string (with `-pooler` in the hostname), not the direct one.
- **Local dev can't reach the database**: confirm `.env` exists (not just `.env.example`) and has the correct connection string.

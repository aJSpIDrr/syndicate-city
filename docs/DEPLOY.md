# Putting Syndicate City online

## Website on Render (added later)
The Blueprint also has a static site called **syndicate-city** (the game website). To create it:
1. Render dashboard → **Blueprints** → your syndicate-city Blueprint → **Manual Sync** (or **Sync**).
2. When it asks for **VITE_API_URL**, paste the server address (the same value as the GitHub `API_URL` variable,
   e.g. `https://syndicate-city-api.onrender.com`, no `/` at the end). Click **Apply**.
3. When **syndicate-city** shows Deployed, open its address (e.g. `https://syndicate-city.onrender.com`).
The GitHub Pages copy keeps working too; both talk to the same server, so accounts work on either.

The website stays on GitHub Pages. The game server runs on **Render** (free) and stores everyone's
bosses in a **Neon** database (free). You already use both for Dark Alliance, so log in with the same accounts.

Until step 4 is done, the live site keeps working as the offline (single-browser) game.

## 1. Create the database (Neon)
1. Go to https://console.neon.tech and log in.
2. Click **New Project**. Name it `syndicate-city`, pick the region closest to you, click **Create**.
3. On the project dashboard click **Connect**. Copy the **connection string** (starts with `postgresql://`).
   Keep it private: it's the key to the database.

## 2. Create the game server (Render)
1. Go to https://dashboard.render.com and log in.
2. Click **New +** → **Blueprint**.
3. Pick the GitHub repository **aJSpIDrr/syndicate-city** (if it isn't listed, click "Configure account" and allow Render to see it).
4. Render reads `render.yaml` and shows a service called **syndicate-city-api**. It asks for **DATABASE_URL**:
   paste the Neon connection string from step 1.
5. Click **Apply**. Wait until the service shows **Live** (a few minutes).
6. Copy the service's address at the top, e.g. `https://syndicate-city-api.onrender.com`.
   Check it: open that address with `/api/health` on the end. You should see `{"ok":true,...}`.

## 3. Tell the website where the server is (GitHub)
1. Open https://github.com/aJSpIDrr/syndicate-city → **Settings** → **Secrets and variables** → **Actions**.
2. Click the **Variables** tab → **New repository variable**.
3. Name: `API_URL`. Value: the Render address from step 2.6 (no `/` on the end). Click **Add variable**.

## 4. Rebuild the website
1. Go to the **Actions** tab → **Deploy to GitHub Pages** → **Run workflow** → **Run workflow**.
2. When it's green, open https://ajspidrr.github.io/syndicate-city/. You should see the **Log In** screen.

## Good to know
- The free Render server goes to sleep after 15 minutes without players. The first visit after that takes up to a minute
  ("Opening the city…"). A paid Render plan ($7/month) keeps it awake.
- Bosses made in the offline version stay in that browser; online play starts a fresh boss.
- Test buttons (+5 Levels, +50 Gold) are hidden online. They only work on a server started with `DEV_TOOLS=1`.

## Password-reset emails (Resend)
Players log in with email. "Forgot password" emails a reset link, which needs an email service. Until this is set up,
everything works except that reset emails aren't sent.
1. Go to https://resend.com and sign up (free: 3,000 emails a month).
2. **Domains** → **Add Domain** → enter a domain you own (for example the one for Three Legends). Resend shows a few DNS
   records: add them where you manage that domain, then click **Verify**. (Without your own domain, Resend only delivers
   to your own sign-up email, which is fine for testing but not for players.)
3. **API Keys** → **Create API Key** → copy it (starts with `re_`).
4. Render → **syndicate-city-api** → **Environment** → add:
   - `RESEND_API_KEY` = the key from step 3
   - `MAIL_FROM` = `Syndicate City <noreply@YOURDOMAIN>` (use the domain from step 2)
   Click **Save, rebuild and deploy**.
5. Test it: on the log-in screen click **Forgot your password?** and enter your own email.

## Moving the game server to Frankfurt (next to the database)
The Neon database is in Frankfurt; the first game server (`syndicate-city-api`) is in Oregon, so every database
trip crossed the Atlantic. `render.yaml` now also has `syndicate-city-eu` in Frankfurt.
1. Render → **Blueprints** → syndicate-city → **Manual Sync**. For `syndicate-city-eu` fill in DATABASE_URL,
   RESEND_API_KEY and MAIL_FROM with the same values as `syndicate-city-api` (copy them from its **Environment** page).
2. When it is **Live**, open its address with `/api/health` on the end and check you see `{"ok":true,...}`.
3. Point the websites at it: Render static site **syndicate-city** → Environment → `VITE_API_URL`; GitHub repo
   → Settings → Secrets and variables → Actions → Variables → `API_URL`; then rerun **Deploy to GitHub Pages**.
4. Then remove `syndicate-city-api` from `render.yaml` and delete it in Render (Settings → Delete Web Service).

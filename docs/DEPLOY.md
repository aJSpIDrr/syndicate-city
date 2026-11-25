# Putting Syndicate City online

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

# Deploying CityPins (do this at home)

You don't need MySQL on your own laptop for this. The database lives on Railway.
Total time: about 20 minutes. Everything happens in the browser except one optional step.

## What you need
- A GitHub account (you have one: the code is in `kyleyuen3/travel`)
- A Railway account (railway.app, sign in with GitHub). There's a free trial, then about $5/month.
- A Vercel account (vercel.com, sign in with GitHub). This one is free.

---

## Step 1: Database and backend on Railway

1. Go to railway.app → **New Project** → **Deploy MySQL**.
   Wait until it shows as running.
2. In the same project, click **+ New** → **GitHub Repo** → pick `kyleyuen3/travel`.
3. Click the new service → **Settings**:
   - **Root Directory:** `backend`
   - **Start Command:** `npm start` (usually detected automatically)
   - Under **Networking**, click **Generate Domain**. Copy the URL
     (for example `https://travel-production-abcd.up.railway.app`). This is your **backend URL**.
4. Open the service's **Variables** tab and add these:

   | Name | Value |
   |---|---|
   | `DB_HOST` | `${{MySQL.MYSQLHOST}}` |
   | `DB_PORT` | `${{MySQL.MYSQLPORT}}` |
   | `DB_USER` | `${{MySQL.MYSQLUSER}}` |
   | `DB_PASSWORD` | `${{MySQL.MYSQLPASSWORD}}` |
   | `DB_NAME` | `${{MySQL.MYSQLDATABASE}}` |
   | `JWT_SECRET` | any long random string, e.g. mash the keyboard for 40+ characters |
   | `CORS_ORIGIN` | leave for now; you'll fill it in during Step 3 |

   The `${{MySQL.…}}` values tell Railway to fill in the database's details automatically.
   Railway also offers autocomplete for them when you type `${{`.
5. You don't need to create any tables. The backend creates them the first time it starts, and its
   logs show `Tables ready`.
   - Optional sample data: if you have Node on a computer, copy the MySQL service's *public*
     connection values into `backend/.env` and run `npm run db:seed`.
6. Check it: open `<backend URL>/health` in your browser. You should see
   `{"ok":true,"db":"connected"}`.

## Step 2: Frontend on Vercel

1. Go to vercel.com → **Add New… → Project** → import `kyleyuen3/travel`.
2. Set the **Root Directory** to `frontend`. Vercel detects the framework as **Vite**.
3. Under **Environment Variables**, add
   `VITE_API_URL` = your backend URL from Step 1 (no trailing slash).
4. Click **Deploy**. Copy the site URL it gives you (for example `https://citypins.vercel.app`).

## Step 3: Connect the two

1. Back in Railway → backend service → **Variables**, set
   `CORS_ORIGIN` = your Vercel URL (no trailing slash).
   To allow several URLs, separate them with commas.
2. Railway redeploys automatically. Open your Vercel URL, sign up, and post a spot.

---

## After that
- Every `git push` to `master` redeploys both sites automatically.
- If the site says **"Could not reach the server"**, check that `VITE_API_URL` is right. Then redeploy on
  Vercel, because Vite bakes that value in when the site is built.
- If the browser console shows a **CORS error**, `CORS_ORIGIN` on Railway doesn't exactly match your
  Vercel URL. Check `https`, and that there's no trailing `/`.
- If **`/health` shows `db: disconnected`**, recheck the `DB_*` variables in Step 1.4.

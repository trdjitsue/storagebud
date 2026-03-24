# StorageBud 🗃️

NTU international students sharing storage rooms during summer break.

---

## Stack

- **React + Vite** — frontend
- **Supabase** — database, auth, realtime chat
- **Vercel** — free hosting

---

## Setup (step by step)

### 1. Install Node.js
Download from https://nodejs.org (LTS version)

### 2. Clone and install
```bash
git clone https://github.com/YOUR_USERNAME/storagebud.git
cd storagebud
npm install
```

### 3. Set up Supabase

1. Go to https://supabase.com and create a free account
2. Click **New project** — name it `storagebud`
3. Wait for it to finish setting up (~1 min)
4. Go to **SQL Editor** (left sidebar)
5. Copy the entire SQL block from `src/lib/supabase.js` (everything between the `/*` and `*/`)
6. Paste it into the SQL editor and click **Run**
7. Go to **Settings → API**
8. Copy your **Project URL** and **anon public** key

### 4. Create your .env file
```bash
cp .env.example .env
```
Open `.env` and paste in your Supabase values:
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 5. Run locally
```bash
npm run dev
```
Open http://localhost:5173 — you should see the login screen.

---

## Deploy to Vercel (free)

1. Push your code to GitHub
2. Go to https://vercel.com and sign in with GitHub
3. Click **Add New Project** → import your repo
4. Under **Environment Variables**, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Click **Deploy** — you'll get a live URL in ~2 minutes

**Important:** In Supabase → Authentication → URL Configuration, add your Vercel URL to **Redirect URLs** so email confirmation works.

---

## Project structure

```
src/
  lib/
    supabase.js       ← Supabase client + full SQL schema in comments
    constants.js      ← halls, item types, size options
  hooks/
    useAuth.jsx       ← auth context (sign in, sign up, sign out)
  components/
    Layout.jsx        ← nav bar + tab bar
    GroupCard.jsx     ← reusable group card with volume bar
  pages/
    LoginPage.jsx     ← sign in / sign up with NTU email check
    BrowsePage.jsx    ← browse all groups, filter by hall
    GroupDetailPage.jsx ← group info, join modal, cost calculator
    CreateGroupPage.jsx ← create a group (you become admin)
    MyGroupPage.jsx   ← admin panel: approve/decline requests
    ChatPage.jsx      ← realtime group chat
```

---

## Database tables

| Table | Purpose |
|---|---|
| `profiles` | Extends Supabase auth users |
| `groups` | Storage groups |
| `group_members` | Who is in each group + their items/dates |
| `join_requests` | Pending/approved/declined requests |
| `messages` | Chat messages (realtime) |

---

## Features

- ✅ NTU email only login (@e.ntu.edu.sg)
- ✅ Browse groups, filter by hall
- ✅ Volume bar showing how full each room is
- ✅ Item size declaration (small / 1 box / suitcase / 2+ boxes)
- ✅ Move-in and move-out dates per member
- ✅ Admin approval toggle — approve or decline join requests
- ✅ Cost calculator (split rent by number of members)
- ✅ Realtime group chat (messages appear live)
- ✅ Group admin can remove members 🏠

NTU international student summer storage sharing platform.

## What it does
- NTU email-only sign up (@e.ntu.edu.sg)
- Browse storage groups by hall
- See volume capacity, item types, member dates at a glance
- Create a group — you become admin and control who joins
- Join request flow — admin approves or declines
- Real-time group chat

---

## Setup (do this once)

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/storagebud.git
cd storagebud
npm install
```

### 2. Create a Supabase project

1. Go to https://supabase.com and sign up (free)
2. Click **New project** — name it `storagebud`
3. Wait for it to finish setting up (~1 min)

### 3. Set up the database

1. In your Supabase project, go to **SQL Editor**
2. Copy everything inside the big comment block in `src/lib/supabase.js`
3. Paste it into the SQL Editor and click **Run**

### 4. Configure environment variables

1. Copy the example env file:
   ```bash
   cp .env.example .env
   ```
2. In Supabase, go to **Settings → API**
3. Copy **Project URL** → paste as `VITE_SUPABASE_URL`
4. Copy **anon public** key → paste as `VITE_SUPABASE_ANON_KEY`

Your `.env` should look like:
```
VITE_SUPABASE_URL=https://abcdefgh.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 5. Enable email confirmations (optional for testing)

To skip email confirmation during development:
1. Supabase → **Authentication → Providers → Email**
2. Turn off **Confirm email**
3. Turn back on before going live

### 6. Run locally

```bash
npm run dev
```

Open http://localhost:5173

---

## Deploy to Vercel (free)

1. Push your code to GitHub
2. Go to https://vercel.com → **New Project** → import your repo
3. In the **Environment Variables** section, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Click **Deploy**

That's it — you'll get a live URL like `storagebud.vercel.app`

---

## Project structure

```
src/
  lib/
    supabase.js      ← Supabase client + full SQL schema in comments
    constants.js     ← Halls, item types, size options
  hooks/
    useAuth.jsx      ← Auth context (sign in, sign up, sign out)
  components/
    Layout.jsx       ← Nav bar + tab bar
    GroupCard.jsx    ← Reusable group card with volume bar
  pages/
    LoginPage.jsx    ← Sign in / sign up
    BrowsePage.jsx   ← Browse all groups with hall filter
    GroupDetailPage.jsx ← Group info + join request modal
    CreateGroupPage.jsx ← Create a new group
    MyGroupPage.jsx  ← Admin panel: approve/decline requests
    ChatPage.jsx     ← Real-time group chat
```

---

## Tech stack

| Thing | Tool | Cost |
|---|---|---|
| Frontend | React + Vite | Free |
| Hosting | Vercel | Free |
| Database + Auth | Supabase | Free up to 50,000 users |
| Real-time chat | Supabase Realtime | Included free |

---

## Things to add later

- Email notifications when someone requests to join your group
- Push notifications for new chat messages
- Profile page to edit display name
- Group expiry — auto-archive groups after summer ends
- Ratings after storage period ends

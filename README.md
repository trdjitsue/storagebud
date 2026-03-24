# StorageBud 🗃️

NTU international students sharing storage rooms during summer break.

---

## Stack

- **React + Vite** — frontend
- **Supabase** — database, auth, realtime chat
- **Vercel** — free hosting

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

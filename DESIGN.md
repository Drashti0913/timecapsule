# TimeCapsule: Letters to the Future & Memory Wall

**Design Document**

- **Team:** Trupal Jageshkumar Patel and Heta Vimaleshkumar Patel
- **Class:** CS 5610 Web Development, Northeastern University
- **Instructor:** John Alexis Guerra Gomez

---

## 1. Project Description

TimeCapsule helps people preserve moments in time. It answers two questions: _What would I want to tell my future self?_ And _what moments are other people remembering from the same places and years as me?_ Life moves fast, and the small thoughts, goals, and memories from a semester, a move, or a milestone are easy to forget.

TimeCapsule has two independent features.

**Letters to Future Me:** users write a letter, choose an unlock date, and the server keeps the message hidden until that date arrives. Because the server never sends the message before the unlock date, the lock can't be bypassed by inspecting the browser. Users can add a mood, an occasion, and an envelope color, get writing prompts when they're stuck, and watch a live countdown and progress bar for each sealed letter. When a letter opens, it is revealed with a confetti celebration.

**Memory Wall:** users post short anonymous memories tagged by year, season, and place. Others can browse, filter, and react to them, and sort the wall by the most reacted memories.

Users are identified by an anonymous ID stored in a cookie, so they can manage their own letters and memories without creating an account. Memory Wall forms remind users not to include full names, phone numbers, addresses, or other personal information.

**Tech stack:** HTML5, CSS3, vanilla JavaScript (ES modules) with client-side rendering, Node.js with Express, and MongoDB with the native Node.js driver.

---

## 2. User Personas

### Priya, a Graduating Student

Priya is starting her final year at Northeastern. She wants to capture her goals and fears right now and read them again on graduation day, to see how far she has come.

### Ravi, a New Arrival

Ravi just moved to Boston for his master's degree. Everything is new, and he wants to write a letter to open one year from now to see how much he has changed.

### Sam, a Nostalgic Browser

Sam has lived in several cities and enjoys reading what other people remember about those places. He wants to filter memories by city and year.

### Maya, a Storyteller

Maya has small, meaningful memories from her time at Northeastern. She wants to share them anonymously so others can relate, without revealing who she is.

### Leo, a Reactor

Leo rarely posts, but he likes reacting to memories that make him laugh or feel something. He wants to see which memories resonate most with everyone.

---

## 3. User Stories

### Letters to Future Me (Trupal)

1. As **Priya**, I want to write a letter with a title, message, and unlock date, so I can read it on graduation day.
2. As **Ravi**, I want to see all my letters with a live countdown for sealed ones and an "Open" button for unlocked ones, so I know when each letter will be ready.
3. As **Priya**, I want the message to stay hidden until the unlock date, so I can't peek early. The server returns only the title and unlock date for sealed letters and never sends the message before the date.
4. As **Ravi**, I want to edit a sealed letter's title, push its unlock date later (never earlier), or delete it, so I can change my plans without breaking the lock.
5. As **Priya**, I want to tag my letter with how I'm feeling, the occasion, and an envelope color, so I remember the moment I wrote it and can tell my letters apart at a glance.
6. As **Ravi**, I want writing prompts when I don't know what to say, and quick date buttons like "In 1 year," so writing a letter is fast and easy.
7. As **Ravi**, I want to search my letters by title, filter them by sealed or opened, and sort them by unlock date or newest, so I can find a letter quickly.

### Memory Wall (Heta)

1. As **Maya**, I want to post a short anonymous memory tagged with a year, season, and place (for example, "Boston, Fall 2026"), so I can share a moment without revealing who I am.
2. As **Sam**, I want to filter memories by place, year, and season, so I can read about places and times that matter to me.
3. As **Leo**, I want to react to memories with ❤️, 😂, or 😢 and sort the wall by most reacted, so I can find the memories that resonate most.
4. As **Maya**, I want to edit or delete my own memories, so I can fix a typo or remove something I no longer want to share.

---

## 4. Design Mockups

These wireframes show the layout of each screen. Labels with arrows (`←`) explain what each part does.

### Mockup 1: Home page

```
┌──────────────────────────────────────────────────────────────────────┐
│  ✿ TimeCapsule                    [ Home ]   Letters   Memory Wall   │ ← header
└──────────────────────────────────────────────────────────────────────┘

   ( ✉ ) ( ♥ ) ( ✿ ) ( ☆ )                          ← floating doodles

   Hold on to this moment.                           ← big title
   Write a letter that stays sealed until a date you choose, or share
   a small memory of a place and a year. No account needed.

   How it works

   ┌────────────────────────────────┐  ┌────────────────────────────────┐
   │  Letters to Future Me          │  │  Memory Wall                   │
   │                                │  │                                │
   │  1. Write a title and message  │  │  1. Post a memory with a       │
   │  2. Pick the date it opens     │  │     place, year, and season    │
   │  3. Press Seal letter          │  │  2. Filter the wall            │
   │  4. Come back and press Open   │  │  3. React and sort by most     │
   │                                │  │     loved                      │
   │  [   Write a letter   ]        │  │  [   Visit the wall   ]        │
   └────────────────────────────────┘  └────────────────────────────────┘

   Your letters and memories are tied to this browser through a cookie.
```

### Mockup 2: Letters to Future Me

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  ✿ TimeCapsule                        Home   [ Letters ]   Memory Wall       │
└──────────────────────────────────────────────────────────────────────────────┘

   ( ✉ ) ( ♥ ) ( ✿ ) ( ☆ )
   Letters to Future Me
   Write to the person you'll be on a day that matters...

   ( 2 Sealed ) ( 1 Opened ) ( 3 Total ) ( Next opens May 10, 2027 ) ← stats

 ┌─────────────────────────────────┐   Your letters    ( All | Sealed | Opened )
 │  Write a letter                 │                     ↑ filter tabs
 │                                 │   ( Search by title… 🔍       ) [ Soonest ▼ ]
 │  Title                          │
 │  [ Open on graduation day     ] │   ┌───────────────────────────────────────┐
 │                                 │   │ (🤩)  Open on graduation day          │
 │  Message        [Need ideas? ✨]│   │       (🎓 Graduation) (Feeling excited)│
 │  ┌───────────────────────────┐  │   │       Opens May 10, 2027              │
 │  │ What are three goals...   │  │   │       ( 201d 04h 12m 09s ) ← countdown│
 │  │  [Add to my letter][Next] │  │   │       [██████░░░░░░░░]                │
 │  └───────────────────────────┘  │   │       40% of the wait is done         │
 │  [ Dear future me, right now  ] │   │       [ Edit ]  [ Delete ]            │
 │  [ ___________________________] │   └───────────────────────────────────────┘
 │  [ ___________________________] │
 │                      120 / 5000 │   ┌───────────────────────────────────────┐
 │                                 │   │ (😊)  One year in Boston              │
 │  Unlock date and time           │   │       (📦 Moving) (Feeling happy)     │
 │  [ 05/10/2027  09:00 AM       ] │   │       Opened on Oct 1, 2026           │
 │  [1 week][1 month][6 mo][1 year]│   │       ( Ready to read ✿ )             │
 │                                 │   │       [ Open ]  [ Delete ]            │
 │  How are you feeling?           │   └───────────────────────────────────────┘
 │  [😊][🌱][😬][🤩][😌]           │        ↑ card color = chosen envelope color
 │                                 │
 │  Occasion                       │
 │  [ 🎓 Graduation            ▼ ] │
 │                                 │
 │  Envelope color                 │
 │  (●) (●) (●) (●) (●)            │
 │                                 │
 │  [       Seal letter ♥        ] │
 └─────────────────────────────────┘

                       ( Letter sealed ♥ )   ← pop-up message after sealing
```

### Mockup 3: Opened letter

```
┌──────────────────────────────────────────────────────────────────────┐
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
│░░░░░  ▪   ●     ▪       ●    ▪     ●     ▪   ← confetti falling ░░░░░░│
│░░░░░░░░░┌──────────────────────────────────────────────┐░░░░░░░░░░░░░│
│░░░░░░░░░│  One year in Boston                          │░░░░░░░░░░░░░│
│░░░░░░░░░│                                              │░░░░░░░░░░░░░│
│░░░░░░░░░│  Written Oct 1, 2025, opened Oct 1, 2026.    │░░░░░░░░░░░░░│
│░░░░░░░░░│  You were feeling 😊 happy.                  │░░░░░░░░░░░░░│
│░░░░░░░░░│  Occasion: 📦 Moving.                        │░░░░░░░░░░░░░│
│░░░░░░░░░│                                              │░░░░░░░░░░░░░│
│░░░░░░░░░│  ┌────────────────────────────────────────┐  │░░░░░░░░░░░░░│
│░░░░░░░░░│  │ Dear future me,                        │  │░░░░░░░░░░░░░│
│░░░░░░░░░│  │ Right now I just landed in Boston and  │  │░░░░░░░░░░░░░│
│░░░░░░░░░│  │ everything feels new...                │  │░░░░░░░░░░░░░│
│░░░░░░░░░│  └────────────────────────────────────────┘  │░░░░░░░░░░░░░│
│░░░░░░░░░│                                              │░░░░░░░░░░░░░│
│░░░░░░░░░│  [ Close ]                                   │░░░░░░░░░░░░░│
│░░░░░░░░░└──────────────────────────────────────────────┘░░░░░░░░░░░░░│
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
└──────────────────────────────────────────────────────────────────────┘
   ░ = dimmed page behind the pop-up
```

### Mockup 4: Edit letter

```
┌──────────────────────────────────────────────────────────────────────┐
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
│░░░░░░░░░░░░┌────────────────────────────────────────┐░░░░░░░░░░░░░░░░│
│░░░░░░░░░░░░│  Edit letter                           │░░░░░░░░░░░░░░░░│
│░░░░░░░░░░░░│                                        │░░░░░░░░░░░░░░░░│
│░░░░░░░░░░░░│  Title                                 │░░░░░░░░░░░░░░░░│
│░░░░░░░░░░░░│  [ Open on graduation day            ] │░░░░░░░░░░░░░░░░│
│░░░░░░░░░░░░│                                        │░░░░░░░░░░░░░░░░│
│░░░░░░░░░░░░│  Unlock date and time                  │░░░░░░░░░░░░░░░░│
│░░░░░░░░░░░░│  [ 05/10/2027  09:00 AM              ] │░░░░░░░░░░░░░░░░│
│░░░░░░░░░░░░│  You can only move this date later.    │░░░░░░░░░░░░░░░░│
│░░░░░░░░░░░░│                                        │░░░░░░░░░░░░░░░░│
│░░░░░░░░░░░░│  ⚠ The unlock date can only move       │ ← shown if an  │
│░░░░░░░░░░░░│    later, never earlier.               │   earlier date │
│░░░░░░░░░░░░│                                        │   is picked    │
│░░░░░░░░░░░░│            [ Cancel ] [ Save changes ] │░░░░░░░░░░░░░░░░│
│░░░░░░░░░░░░└────────────────────────────────────────┘░░░░░░░░░░░░░░░░│
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
└──────────────────────────────────────────────────────────────────────┘
```

### Mockup 5: Memory Wall (Heta)

```
┌──────────────────────────────────────────────────────────────────────┐
│  ✿ TimeCapsule                    Home   Letters   [ Memory Wall ]   │ ← header
└──────────────────────────────────────────────────────────────────────┘

   Memory Wall                                       ← big title

   ( Boston: 412 ) ( 2026: 388 ) ( Fall 2026: 120 )  ← wall summary
                                                       (MongoDB aggregation)
   ┌──────────────────────────────────────────────────────────────────┐
   │  How to use                                                      │
   │  • Share a short memory with a place, year, and season.          │
   │    It is anonymous.                                              │
   │  • Use the filters to find memories by place, year, or season.   │
   │  • React with ❤️ 😂 😢. Click again to remove, or click another  │
   │    to switch.                                                    │
   │  • You can edit or delete only the memories you posted.          │
   └──────────────────────────────────────────────────────────────────┘

   ┌──────────────────────────────────────────────────────────────────┐
   │  ⚠ Please don't include full names, phone numbers, addresses,    │
   │    or other personal information about yourself or others.       │
   └──────────────────────────────────────────────────────────────────┘
                                                     ↑ privacy reminder
   ┌──────────────────────────────────────────────────────────────────┐
   │  Your memory                                   [ Need ideas? ✨ ] │
   │  ┌────────────────────────────────────────────────────────────┐  │
   │  │ Share a memory...                                          │  │
   │  │                                                            │  │
   │  └────────────────────────────────────────────────────────────┘  │
   │                                                        0 / 500   │
   │  [ Place (e.g., Boston)                                        ] │
   │  [ Year                                                        ] │
   │  [ Season                                                    ▼ ] │
   │                                                                  │
   │  How are you feeling?                                            │
   │  [😊 Happy] [🌱 Hopeful] [😬 Nervous] [🤩 Excited] [😌 Calm]     │
   │                                                                  │
   │  Card color                                                      │
   │  (●) (●) (●) (●) (●)    ← pink, sky, butter, mint, peach         │
   │                                                                  │
   │  [                       Post memory                           ] │
   └──────────────────────────────────────────────────────────────────┘

   [ Filter by place                                               ]
   [ Year                                                          ]
   [ All seasons                                                 ▼ ]  ← filters
   [ Newest first                                                ▼ ]  ← sort:
                                                                       newest or
   ┌──────────────────────────────────────────────────────────────────┐ most reacted
   │ (Boston · Fall 2026)  😊                                         │
   │ The first snow on Huntington Avenue, everyone stopped to take    │
   │ pictures.                                                        │
   │ [❤️ 24] [😂 3] [😢 1]                  ← one reaction per person │
   └──────────────────────────────────────────────────────────────────┘
   ┌──────────────────────────────────────────────────────────────────┐
   │ (Boston · Fall 2026)  🤩  ( Yours )                              │
   │ Studying all night in Snell before my first midterm, then        │
   │ getting free coffee at 6 a.m.                                    │
   │ [❤️ 12] [😂 9] [😢 2]                         [ Edit ] [ Delete ] │
   └──────────────────────────────────────────────────────────────────┘
        ↑ only memories I posted show "Yours", Edit, and Delete
```

The Memory Wall page has a "How to use" box, a privacy reminder, and the "Share a memory" form with the memory text (up to 500 characters), a "Need ideas?" button, place, year, season, mood, and card color. Below it are filters for place, year, and season, a sort option (newest first or most reacted), and memory cards with a place and season tag, the mood, and reaction buttons. Each person can leave one reaction per memory: clicking it again removes it, and clicking another switches it. Memories posted by the current user show a "Yours" badge with Edit and Delete buttons.

### Mockup 6: Edit memory (Heta)

```
┌──────────────────────────────────────────────────────────────────────┐
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
│░░░░░░░░░░░░┌────────────────────────────────────────┐░░░░░░░░░░░░░░░░│
│░░░░░░░░░░░░│  Edit memory                           │░░░░░░░░░░░░░░░░│
│░░░░░░░░░░░░│                                        │░░░░░░░░░░░░░░░░│
│░░░░░░░░░░░░│  Your memory                           │░░░░░░░░░░░░░░░░│
│░░░░░░░░░░░░│  ┌──────────────────────────────────┐  │░░░░░░░░░░░░░░░░│
│░░░░░░░░░░░░│  │ Studying all night in Snell      │  │░░░░░░░░░░░░░░░░│
│░░░░░░░░░░░░│  │ before my first midterm...       │  │░░░░░░░░░░░░░░░░│
│░░░░░░░░░░░░│  └──────────────────────────────────┘  │░░░░░░░░░░░░░░░░│
│░░░░░░░░░░░░│  [ Boston                            ] │░░░░░░░░░░░░░░░░│
│░░░░░░░░░░░░│  [ 2026                              ] │░░░░░░░░░░░░░░░░│
│░░░░░░░░░░░░│  [ Fall                            ▼ ] │░░░░░░░░░░░░░░░░│
│░░░░░░░░░░░░│                                        │░░░░░░░░░░░░░░░░│
│░░░░░░░░░░░░│  Reactions stay the same when you edit.│░░░░░░░░░░░░░░░░│
│░░░░░░░░░░░░│                                        │░░░░░░░░░░░░░░░░│
│░░░░░░░░░░░░│            [ Cancel ] [ Save changes ] │░░░░░░░░░░░░░░░░│
│░░░░░░░░░░░░└────────────────────────────────────────┘░░░░░░░░░░░░░░░░│
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
└──────────────────────────────────────────────────────────────────────┘
   ░ = dimmed page behind the pop-up
```

A pop-up for changing a memory's text, place, year, or season. Only the person who posted the memory sees the Edit button.

---

## 5. Data Design

### Collection: `capsules` (Trupal)

| Field       | Type     | Description                                                      |
| ----------- | -------- | ---------------------------------------------------------------- |
| `_id`       | ObjectId | Unique ID                                                        |
| `ownerId`   | String   | Anonymous ID from the cookie                                     |
| `title`     | String   | Letter title (max 100 characters)                                |
| `message`   | String   | Letter text (max 5,000 characters), never sent before `unlockAt` |
| `mood`      | String   | happy, hopeful, nervous, excited, or calm                        |
| `occasion`  | String   | graduation, birthday, new-year, new-job, moving, or just-because |
| `color`     | String   | pink, sky, butter, peach, or lilac                               |
| `unlockAt`  | Date     | When the letter can be opened                                    |
| `createdAt` | Date     | When the letter was written                                      |

**Routes:**

| Method | Route                 | Purpose                                                |
| ------ | --------------------- | ------------------------------------------------------ |
| POST   | `/api/capsules`       | Create a letter                                        |
| GET    | `/api/capsules`       | List my letters (without messages)                     |
| GET    | `/api/capsules/stats` | Sealed vs. opened counts and next unlock (aggregation) |
| GET    | `/api/capsules/:id`   | Open a letter (only after its unlock date)             |
| PUT    | `/api/capsules/:id`   | Edit the title or move the unlock date later           |
| DELETE | `/api/capsules/:id`   | Delete a letter                                        |

### Collection: `memories` (Heta)

| Field       | Type     | Description                                          |
| ----------- | -------- | ---------------------------------------------------- |
| `_id`       | ObjectId | Unique ID                                            |
| `ownerId`   | String   | Anonymous ID from the cookie (never shown to others) |
| `text`      | String   | The memory (max 500 characters)                      |
| `place`     | String   | City or place, for example "Boston"                  |
| `year`      | Number   | Year of the memory                                   |
| `season`    | String   | spring, summer, fall, or winter                      |
| `mood`      | String   | happy, hopeful, nervous, excited, or calm            |
| `color`     | String   | Card color: pink, sky, butter, mint, or peach        |
| `reactions` | Object   | Counts for heart, joy, and cry                       |
| `createdAt` | Date     | When the memory was posted                           |

**Routes:**

| Method | Route                     | Purpose                                                    |
| ------ | ------------------------- | ---------------------------------------------------------- |
| POST   | `/api/memories`           | Post a memory                                              |
| GET    | `/api/memories`           | List memories, with optional place, year, season, and sort |
| GET    | `/api/memories/summary`   | Memories per place and year (aggregation)                  |
| PUT    | `/api/memories/:id`       | Edit my own memory                                         |
| DELETE | `/api/memories/:id`       | Delete my own memory                                       |
| POST   | `/api/memories/:id/react` | Add, switch, or remove my reaction                         |

_Heta: check that these field names and routes match `routes/memories.js`, and update anything that differs._

---

## 6. Work Division

- **Trupal Jageshkumar Patel:** `capsules` collection, capsule CRUD, server-side unlock enforcement, unlock-date validation, countdown display, and capsule stats with MongoDB aggregation.
- **Heta Vimaleshkumar Patel:** `memories` collection, memory CRUD, filtering by place, year, and season, reactions, sort by most reacted, and wall summary with MongoDB aggregation.
- **Shared:** anonymous ID middleware, shared page layout and navigation, and ESLint and Prettier configuration.

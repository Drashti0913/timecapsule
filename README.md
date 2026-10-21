# TimeCapsule: Letters to the Future & Memory Wall

## Authors

- Trupal Jageshkumar Patel: Letters to Future Me
- Heta Vimaleshkumar Patel: Memory Wall

## Class

- Class: CS 5610 Web Development (Online) Northeastern University Oakland Fall 2026 https://johnguerra.co/classes/webDevelopment_online_fall_2026/Links to an external site.
- Project 2: Simple backend with Node + Express + MongoDB + HTML5

## Links

- Live site: [DEPLOYED URL]https://timecapsule-1-e70b.onrender.com 
- Demo video: [YOUTUBE VIDEO LINK][ADD PUBLIC VIDEO LINK HERE]
- Presentation: [docs/TimeCapsule.pptx](docs/TimeCapsule.pptx) https://northeastern-my.sharepoint.com/:p:/r/personal/patel_trupa_northeastern_edu/Documents/TimeCapsule.pptx?d=wca0e5440bf82494882b0157a70578672&csf=1&web=1&e=Gw9OLy

## Project objective

TimeCapsule helps people hold on to moments in time. It answers two questions:

- What would I want to tell my future self?
- What are other people remembering from the same places and years as me?

The app has two independent features that share no data:

- **Letters to Future Me:** write a letter and choose an unlock date. The server keeps the message hidden until that date, so the lock cannot be bypassed from the browser.
- **Memory Wall:** post short anonymous memories tagged by place, year, and season. Others can browse, filter, react, and sort.

There are no accounts. Each browser gets a random anonymous ID stored in a cookie, which is how the site knows which letters and memories are yours.

## Screenshots

### Home

![Home page](docs/home.png)

### Letters to Future Me

![Letters to Future Me](docs/letters.png)

### Memory Wall

![Memory Wall](docs/memory-wall.png)

## Features

### Letters to Future Me

- Write a letter with a title, message, and unlock date
- Quick unlock presets and "Need ideas?" writing prompts
- The server never sends the message before the unlock date
- Rename a letter, push its unlock date later (never earlier), or delete it
- Opened letters cannot be edited
- Search, filter (all, sealed, opened), and sort your letters
- Stats: locked vs. opened letters

### Memory Wall

- Post an anonymous memory with place, year, season, mood, and card color
- "Need ideas?" prompts and a live character counter
- Filter by place (partial match), year, and season
- React with ❤️ 😂 😢. Each person gets one reaction per memory: click again to remove it, or click another to switch
- Sort by newest or most reacted
- Edit or delete only your own memories
- Wall summary: number of memories per place and year
- Privacy reminder on the form: no full names, phone numbers, or addresses

## Tech stack

- **Frontend:** HTML5, CSS3, vanilla JavaScript (ES modules), Fetch API, client-side rendering
- **Backend:** Node.js and Express
- **Database:** MongoDB with the native Node.js driver. Two collections: `capsules` and `memories`
- **Tools:** ESLint and Prettier

## Instructions to build

### Requirements

- Node.js 20.6 or newer
- A MongoDB database (local, or a free MongoDB Atlas cluster)

### Setup

1. Clone the repo and install packages:

```bash
git clone https://github.com/Tpatel2103/timecapsule.git
cd timecapsule
npm install
```

2. Copy `.env.example` to `.env` and add your own values. Never commit `.env`.

```
MONGO_URL=mongodb://localhost:27017
PORT=3000
```

3. (Optional) Add sample data:

```bash
npm run seed
npm run seed:memories
```

4. Start the server:

```bash
npm run dev
```

5. Open `http://localhost:3000`

### Scripts

- `npm run dev`: start with auto-restart
- `npm start`: start once
- `npm run seed`: add sample letters
- `npm run seed:memories`: add 1,200 sample memories
- `npm run lint`: check code with ESLint
- `npm run format`: format code with Prettier

## Project structure

```
db/           database connection and seed scripts
middleware/   anonymous ID cookie
routes/       API routes (capsules.js, memories.js)
public/       HTML pages, with css/ and js/ modules
docs/         README screenshots
server.js     Express app
```

## API

### Letters to Future Me

- `POST /api/capsules`: seal a new letter
- `GET /api/capsules`: list my letters (title and dates only)
- `GET /api/capsules/stats`: locked vs. opened counts
- `GET /api/capsules/:id`: read one letter (`403` until the unlock date)
- `PUT /api/capsules/:id`: rename or push the unlock date later
- `DELETE /api/capsules/:id`: delete a letter

### Memory Wall

- `POST /api/memories`: post a memory
- `GET /api/memories?place=&year=&season=&sort=reactions`: list and filter
- `GET /api/memories/summary`: memories per place and year
- `PATCH /api/memories/:id`: edit your memory
- `DELETE /api/memories/:id`: delete your memory
- `POST /api/memories/:id/react`: react with `heart`, `joy`, or `cry`

## License

MIT. See the [LICENSE](LICENSE) file.

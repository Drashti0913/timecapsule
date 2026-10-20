// Inserts sample capsules so the database has more than 1,000 records.
// Seeded letters belong to made-up owners, so they never show up in a real user's list.
// Run with: npm run seed
import { connectDB, closeDB } from "./connection.js";

const COUNT = 1100;
const OWNERS = 120;

const titles = [
  "Open on graduation day",
  "One year in Boston",
  "To me after the first job offer",
  "Read this before finals",
  "Did we run the marathon?",
  "Notes from the first snowfall",
  "Before the big move",
  "Promises for next summer",
  "What I'm scared of right now",
  "Remember this semester",
  "After the internship",
  "Birthday letter",
];

const openings = [
  "Right now I am sitting in Snell Library and",
  "Today I finally decided that",
  "I hope by the time you read this",
  "This week was harder than I expected, and",
  "I want to remember that",
  "If things went the way I planned,",
];

const endings = [
  "I hope you kept going.",
  "Don't forget how far you've come.",
  "Call home more often.",
  "Be kinder to yourself than I am today.",
  "Whatever happened, you learned something.",
  "Go get coffee somewhere new to celebrate.",
];

const moods = ["happy", "hopeful", "nervous", "excited", "calm"];
const occasions = [
  "graduation",
  "birthday",
  "new-year",
  "new-job",
  "moving",
  "just-because",
];
const colors = ["pink", "sky", "butter", "peach", "lilac"];

const pick = (list) => list[Math.floor(Math.random() * list.length)];
const DAY = 24 * 60 * 60 * 1000;

function makeCapsule(i) {
  const now = Date.now();
  const createdAt = new Date(now - Math.floor(Math.random() * 730) * DAY);
  // About 40% opened, 60% still locked
  const offsetDays =
    Math.random() < 0.4
      ? -Math.floor(Math.random() * 365) - 1
      : Math.floor(Math.random() * 1095) + 1;

  return {
    ownerId: `seed-user-${i % OWNERS}`,
    title: pick(titles),
    message: `${pick(openings)} I am writing this to you. ${pick(endings)}`,
    mood: pick(moods),
    occasion: pick(occasions),
    color: pick(colors),
    unlockAt: new Date(now + offsetDays * DAY),
    createdAt,
  };
}

const db = await connectDB();
const capsules = db.collection("capsules");

const removed = await capsules.deleteMany({
  ownerId: { $regex: "^seed-user-" },
});
console.log(`Removed ${removed.deletedCount} old seed capsules`);

const docs = Array.from({ length: COUNT }, (_, i) => makeCapsule(i));
const inserted = await capsules.insertMany(docs);
console.log(`Inserted ${inserted.insertedCount} capsules`);

await closeDB();

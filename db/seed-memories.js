import { connectDB, getDB } from "./connection.js";

const TOTAL = 1200;
const PLACES = [
  "Boston",
  "Cambridge",
  "New York",
  "San Francisco",
  "Seattle",
  "Toronto",
  "London",
  "Mumbai",
  "Ahmedabad",
  "Surat",
];
const SEASONS = ["Spring", "Summer", "Fall", "Winter"];
const TYPES = ["heart", "joy", "cry"];
const OPENINGS = [
  "I still remember",
  "One of my favorite moments was",
  "I will never forget",
  "It felt like home when",
  "I was nervous, but",
];
const MOMENTS = [
  "walking home in the first snow.",
  "getting lost and finding the best coffee shop.",
  "late-night talks with new friends.",
  "the smell of rain on a hot day.",
  "my first day in a brand new city.",
  "a street festival I stumbled into.",
  "cooking dinner for people I had just met.",
  "watching the sunset from the train.",
];

const pick = (list) => list[Math.floor(Math.random() * list.length)];

function makeMemory() {
  const place = pick(PLACES);
  const date = new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 365);
  const reactions = [];
  const reactorCount = Math.floor(Math.random() * 6);
  for (let i = 0; i < reactorCount; i++) {
    reactions.push({ ownerId: `seed-reactor-${i}`, type: pick(TYPES) });
  }
  return {
    text: `${pick(OPENINGS)} ${pick(MOMENTS)}`,
    place,
    placeLower: place.toLowerCase(),
    year: 2015 + Math.floor(Math.random() * 12),
    season: pick(SEASONS),
    ownerId: "seed-owner",
    reactions,
    createdAt: date,
    updatedAt: date,
  };
}

await connectDB();
const memories = getDB().collection("memories");

// Remove old sample data first, so running this twice does not double it
await memories.deleteMany({ ownerId: "seed-owner" });
await memories.insertMany(Array.from({ length: TOTAL }, makeMemory));

console.log(`Added ${TOTAL} sample memories.`);
process.exit(0);

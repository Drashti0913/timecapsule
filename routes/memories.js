import { Router } from "express";
import { ObjectId } from "mongodb";
import { getDB } from "../db/connection.js";

const router = Router();
const SEASONS = ["Spring", "Summer", "Fall", "Winter"];
const REACTIONS = ["heart", "joy", "cry"];
const COLORS = ["pink", "sky", "butter", "mint", "peach"];
const MOODS = ["happy", "hopeful", "nervous", "excited", "calm"];
const col = () => getDB().collection("memories");

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parseId(id) {
  return /^[0-9a-f]{24}$/i.test(id) ? new ObjectId(id) : null;
}

function validateMemory(body = {}) {
  const errors = [];
  const text = String(body.text ?? "").trim();
  const place = String(body.place ?? "").trim();
  const year = Number(body.year);
  const season = body.season;
  const color = body.color ?? "pink";
  const mood = body.mood ?? "happy";

  if (!text || text.length > 500) {
    errors.push("Memory text is required (max 500 characters).");
  }
  if (!place || place.length > 60) {
    errors.push("Place is required (max 60 characters).");
  }
  if (
    !Number.isInteger(year) ||
    year < 1950 ||
    year > new Date().getFullYear()
  ) {
    errors.push(`Year must be between 1950 and ${new Date().getFullYear()}.`);
  }
  if (!SEASONS.includes(season)) {
    errors.push("Season must be Spring, Summer, Fall, or Winter.");
  }
  if (!COLORS.includes(color)) {
    errors.push("Invalid card color.");
  }
  if (!MOODS.includes(mood)) {
    errors.push("Invalid mood.");
  }
  return { errors, value: { text, place, year, season, color, mood } };
}

function toClient(m, anonId) {
  const counts = { heart: 0, joy: 0, cry: 0 };
  let myReaction = null;
  for (const r of m.reactions) {
    counts[r.type] += 1;
    if (r.ownerId === anonId) myReaction = r.type;
  }
  return {
    id: m._id.toString(),
    text: m.text,
    place: m.place,
    year: m.year,
    season: m.season,
    color: m.color ?? "pink",
    mood: m.mood ?? "happy",
    counts,
    total: m.reactions.length,
    myReaction,
    isMine: m.ownerId === anonId,
    createdAt: m.createdAt,
  };
}

// ---- CREATE ----
router.post("/", async (req, res) => {
  const { errors, value } = validateMemory(req.body);
  if (errors.length) return res.status(400).json({ errors });

  const now = new Date();
  const doc = {
    ...value,
    placeLower: value.place.toLowerCase(),
    ownerId: req.anonId,
    reactions: [],
    createdAt: now,
    updatedAt: now,
  };
  const result = await col().insertOne(doc);
  res
    .status(201)
    .json(toClient({ ...doc, _id: result.insertedId }, req.anonId));
});

// ---- LIST + FILTER + SORT ----
router.get("/", async (req, res) => {
  const { place, year, season, sort } = req.query;
  const filter = {};

  if (place) {
    filter.placeLower = {
      $regex: escapeRegex(String(place).trim().toLowerCase()),
    };
  }
  if (year) {
    const y = Number(year);
    if (!Number.isInteger(y)) {
      return res.status(400).json({ errors: ["Year must be a number."] });
    }
    filter.year = y;
  }
  if (season) {
    if (!SEASONS.includes(season)) {
      return res.status(400).json({ errors: ["Invalid season."] });
    }
    filter.season = season;
  }

  const sortBy =
    sort === "reactions" ? { total: -1, createdAt: -1 } : { createdAt: -1 };

  const docs = await col()
    .aggregate([
      { $match: filter },
      { $addFields: { total: { $size: "$reactions" } } },
      { $sort: sortBy },
      { $limit: 100 },
    ])
    .toArray();

  res.json(docs.map((d) => toClient(d, req.anonId)));
});

// ---- SUMMARY: memories per place and year ----
router.get("/summary", async (req, res) => {
  const rows = await col()
    .aggregate([
      {
        $group: {
          _id: { place: "$placeLower", year: "$year" },
          count: { $sum: 1 },
          displayPlace: { $first: "$place" },
        },
      },
      { $sort: { count: -1, "_id.year": -1 } },
    ])
    .toArray();

  res.json(
    rows.map((r) => ({
      place: r.displayPlace,
      year: r._id.year,
      count: r.count,
    })),
  );
});

// ---- EDIT ----
router.patch("/:id", async (req, res) => {
  const _id = parseId(req.params.id);
  if (!_id) return res.status(400).json({ errors: ["Invalid id."] });

  const { errors, value } = validateMemory(req.body);
  if (errors.length) return res.status(400).json({ errors });

  const updated = await col().findOneAndUpdate(
    { _id, ownerId: req.anonId },
    {
      $set: {
        ...value,
        placeLower: value.place.toLowerCase(),
        updatedAt: new Date(),
      },
    },
    { returnDocument: "after" },
  );
  if (!updated) {
    return res.status(404).json({ errors: ["Memory not found or not yours."] });
  }
  res.json(toClient(updated, req.anonId));
});

// ---- DELETE ----
router.delete("/:id", async (req, res) => {
  const _id = parseId(req.params.id);
  if (!_id) return res.status(400).json({ errors: ["Invalid id."] });

  const result = await col().deleteOne({ _id, ownerId: req.anonId });
  if (result.deletedCount === 0) {
    return res.status(404).json({ errors: ["Memory not found or not yours."] });
  }
  res.status(204).end();
});

// ---- REACT (toggle / switch) ----
router.post("/:id/react", async (req, res) => {
  const _id = parseId(req.params.id);
  if (!_id) return res.status(400).json({ errors: ["Invalid id."] });

  const { type } = req.body ?? {};
  if (!REACTIONS.includes(type)) {
    return res.status(400).json({ errors: ["Invalid reaction type."] });
  }

  const memory = await col().findOne({ _id });
  if (!memory) return res.status(404).json({ errors: ["Memory not found."] });

  const existing = memory.reactions.find((r) => r.ownerId === req.anonId);

  await col().updateOne(
    { _id },
    { $pull: { reactions: { ownerId: req.anonId } } },
  );

  if (!existing || existing.type !== type) {
    await col().updateOne(
      { _id },
      { $push: { reactions: { ownerId: req.anonId, type } } },
    );
  }

  const updated = await col().findOne({ _id });
  res.json(toClient(updated, req.anonId));
});

export default router;

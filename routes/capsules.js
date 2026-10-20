import { Router } from "express";
import { ObjectId } from "mongodb";
import { getDB } from "../db/connection.js";

const router = Router();
const capsules = () => getDB().collection("capsules");

const TITLE_MAX = 100;
const MESSAGE_MAX = 5000;

function toObjectId(id) {
  return ObjectId.isValid(id) ? new ObjectId(id) : null;
}

function checkTitle(title) {
  if (typeof title !== "string" || !title.trim())
    return "Add a title for your letter.";
  if (title.trim().length > TITLE_MAX)
    return `Keep the title under ${TITLE_MAX} characters.`;
  return null;
}

function checkMessage(message) {
  if (typeof message !== "string" || !message.trim())
    return "Write a message before sealing.";
  if (message.length > MESSAGE_MAX)
    return `Keep the message under ${MESSAGE_MAX} characters.`;
  return null;
}

function parseDate(value) {
  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date;
}

// Shape sent to the browser for the list. The message is never included.
function toSummary(capsule, now) {
  return {
    _id: capsule._id,
    title: capsule.title,
    unlockAt: capsule.unlockAt,
    createdAt: capsule.createdAt,
    isUnlocked: capsule.unlockAt <= now,
  };
}

// READ: counts of locked vs opened letters (must come before "/:id")
router.get("/stats", async (req, res) => {
  const now = new Date();
  const [result] = await capsules()
    .aggregate([
      { $match: { ownerId: req.anonId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          opened: { $sum: { $cond: [{ $lte: ["$unlockAt", now] }, 1, 0] } },
          nextUnlock: {
            $min: { $cond: [{ $gt: ["$unlockAt", now] }, "$unlockAt", null] },
          },
        },
      },
    ])
    .toArray();

  const total = result?.total ?? 0;
  const opened = result?.opened ?? 0;
  res.json({
    total,
    opened,
    locked: total - opened,
    nextUnlock: result?.nextUnlock ?? null,
  });
});

// READ: all of my capsules, without message content
router.get("/", async (req, res) => {
  const now = new Date();
  const docs = await capsules()
    .find({ ownerId: req.anonId })
    .sort({ unlockAt: 1 })
    .toArray();
  res.json(docs.map((c) => toSummary(c, now)));
});

// READ: one capsule. The message is only sent once the unlock date has passed.
router.get("/:id", async (req, res) => {
  const _id = toObjectId(req.params.id);
  if (!_id) return res.status(404).json({ error: "Letter not found." });

  const capsule = await capsules().findOne({ _id, ownerId: req.anonId });
  if (!capsule) return res.status(404).json({ error: "Letter not found." });

  if (capsule.unlockAt > new Date()) {
    return res.status(403).json({
      error: "This letter is still sealed.",
      unlockAt: capsule.unlockAt,
    });
  }

  res.json({
    _id: capsule._id,
    title: capsule.title,
    message: capsule.message,
    unlockAt: capsule.unlockAt,
    createdAt: capsule.createdAt,
  });
});

// CREATE
router.post("/", async (req, res) => {
  const { title, message, unlockAt } = req.body ?? {};

  const error = checkTitle(title) || checkMessage(message);
  if (error) return res.status(400).json({ error });

  const date = parseDate(unlockAt);
  if (!date || date <= new Date()) {
    return res
      .status(400)
      .json({ error: "Pick an unlock date in the future." });
  }

  const doc = {
    ownerId: req.anonId,
    title: title.trim(),
    message,
    unlockAt: date,
    createdAt: new Date(),
  };
  const result = await capsules().insertOne(doc);
  res
    .status(201)
    .json(toSummary({ ...doc, _id: result.insertedId }, new Date()));
});

// UPDATE: title, or move the unlock date later. Never earlier.
router.put("/:id", async (req, res) => {
  const _id = toObjectId(req.params.id);
  if (!_id) return res.status(404).json({ error: "Letter not found." });

  const capsule = await capsules().findOne({ _id, ownerId: req.anonId });
  if (!capsule) return res.status(404).json({ error: "Letter not found." });

  if (capsule.unlockAt <= new Date()) {
    return res.status(400).json({ error: "Opened letters can't be edited." });
  }

  const { title, unlockAt } = req.body ?? {};
  const update = {};

  if (title !== undefined) {
    const error = checkTitle(title);
    if (error) return res.status(400).json({ error });
    update.title = title.trim();
  }

  if (unlockAt !== undefined) {
    const date = parseDate(unlockAt);
    if (!date)
      return res.status(400).json({ error: "That unlock date isn't valid." });
    if (date < capsule.unlockAt) {
      return res
        .status(400)
        .json({ error: "The unlock date can only move later, never earlier." });
    }
    update.unlockAt = date;
  }

  if (Object.keys(update).length === 0) {
    return res.status(400).json({ error: "Nothing to update." });
  }

  await capsules().updateOne({ _id, ownerId: req.anonId }, { $set: update });
  res.json(toSummary({ ...capsule, ...update }, new Date()));
});

// DELETE
router.delete("/:id", async (req, res) => {
  const _id = toObjectId(req.params.id);
  if (!_id) return res.status(404).json({ error: "Letter not found." });

  const result = await capsules().deleteOne({ _id, ownerId: req.anonId });
  if (result.deletedCount === 0) {
    return res.status(404).json({ error: "Letter not found." });
  }
  res.status(204).end();
});

export default router;

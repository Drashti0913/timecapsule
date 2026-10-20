import express from "express";
import { connectDB } from "./db/connection.js";
import { anonId } from "./middleware/anonId.js";
import capsulesRouter from "./routes/capsules.js";
// Heta: import memoriesRouter from "./routes/memories.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "50kb" }));
app.use(anonId);
app.use(express.static("public"));

app.use("/api/capsules", capsulesRouter);
// Heta: app.use("/api/memories", memoriesRouter);

app.use("/api", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong on the server" });
});

await connectDB();
app.listen(PORT, () => {
  console.log(`Running at http://localhost:${PORT}`);
});

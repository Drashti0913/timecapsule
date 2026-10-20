const EMOJI = { heart: "❤️", joy: "😂", cry: "😢" };
const MOOD_EMOJI = {
  happy: "😊",
  hopeful: "🌱",
  nervous: "😬",
  excited: "🤩",
  calm: "😌",
};
const IDEAS = [
  "A smell that takes me straight back to...",
  "The best meal I had in this place was...",
  "A stranger who made my day by...",
  "I never expected to love...",
  "The sound I will always connect with this place is...",
  "A small moment I wish I could replay is...",
];

const form = document.querySelector("#memory-form");
const formError = document.querySelector("#form-error");
const submitBtn = document.querySelector("#submit-btn");
const cancelBtn = document.querySelector("#cancel-edit");
const wall = document.querySelector("#wall");
const summaryList = document.querySelector("#summary");
const textBox = document.querySelector("#text");
const textCount = document.querySelector("#text-count");
const ideaCard = document.querySelector("#idea-card");
const ideaText = document.querySelector("#idea-text");
const filterEls = {
  place: document.querySelector("#filter-place"),
  year: document.querySelector("#filter-year"),
  season: document.querySelector("#filter-season"),
  sort: document.querySelector("#filter-sort"),
};

let editingId = null;

async function api(url, options = {}) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (res.status === 204) return null;
  const data = await res.json();
  if (!res.ok) throw new Error(data.errors.join(" "));
  return data;
}

// ---------- Counter + idea prompts ----------
function updateCount() {
  textCount.textContent = `${textBox.value.length} / 500`;
}

function showIdea() {
  ideaText.textContent = IDEAS[Math.floor(Math.random() * IDEAS.length)];
  ideaCard.hidden = false;
}

// ---------- Rendering ----------
function renderCard(m) {
  const card = document.createElement("article");
  card.className = `card card-${m.color}`;

  const text = document.createElement("p");
  text.textContent = m.text;
  const meta = document.createElement("small");
  meta.textContent = `${MOOD_EMOJI[m.mood]} ${m.place}, ${m.season} ${m.year}`;

  const reactions = document.createElement("div");
  for (const [type, emoji] of Object.entries(EMOJI)) {
    const btn = document.createElement("button");
    btn.textContent = `${emoji} ${m.counts[type]}`;
    btn.classList.toggle("active", m.myReaction === type);
    btn.addEventListener("click", () => react(m.id, type));
    reactions.append(btn);
  }

  card.append(text, meta, reactions);

  if (m.isMine) {
    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", () => startEdit(m));
    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.addEventListener("click", () => remove(m.id));
    card.append(editBtn, delBtn);
  }
  return card;
}

async function loadWall() {
  const params = new URLSearchParams();
  for (const [key, el] of Object.entries(filterEls)) {
    if (el.value.trim()) params.set(key, el.value.trim());
  }
  const memories = await api(`/api/memories?${params}`);
  wall.replaceChildren(...memories.map(renderCard));
  if (memories.length === 0) wall.textContent = "No memories found yet.";
}

async function loadSummary() {
  const rows = await api("/api/memories/summary");
  summaryList.replaceChildren(
    ...rows.map((r) => {
      const li = document.createElement("li");
      li.textContent = `${r.place} (${r.year}): ${r.count}`;
      return li;
    }),
  );
}

async function refresh() {
  await Promise.all([loadWall(), loadSummary()]);
}

// ---------- Actions ----------
async function react(id, type) {
  await api(`/api/memories/${id}/react`, {
    method: "POST",
    body: JSON.stringify({ type }),
  });
  await loadWall();
}

async function remove(id) {
  if (!confirm("Delete this memory?")) return;
  await api(`/api/memories/${id}`, { method: "DELETE" });
  await refresh();
}

function startEdit(m) {
  editingId = m.id;
  textBox.value = m.text;
  document.querySelector("#place").value = m.place;
  document.querySelector("#year").value = m.year;
  document.querySelector("#season").value = m.season;
  form.elements.mood.value = m.mood;
  form.elements.color.value = m.color;
  updateCount();
  submitBtn.textContent = "Save changes";
  cancelBtn.hidden = false;
  form.scrollIntoView({ behavior: "smooth" });
}

function stopEdit() {
  editingId = null;
  form.reset();
  updateCount();
  submitBtn.textContent = "Post memory";
  cancelBtn.hidden = true;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  formError.textContent = "";
  const body = JSON.stringify({
    text: textBox.value,
    place: document.querySelector("#place").value,
    year: document.querySelector("#year").value,
    season: document.querySelector("#season").value,
    mood: form.elements.mood.value,
    color: form.elements.color.value,
  });
  try {
    if (editingId) {
      await api(`/api/memories/${editingId}`, { method: "PATCH", body });
    } else {
      await api("/api/memories", { method: "POST", body });
    }
    stopEdit();
    await refresh();
  } catch (err) {
    formError.textContent = err.message;
  }
});

cancelBtn.addEventListener("click", stopEdit);
for (const el of Object.values(filterEls)) {
  el.addEventListener("input", loadWall);
}

textBox.addEventListener("input", updateCount);
document.querySelector("#idea-btn").addEventListener("click", showIdea);
document.querySelector("#idea-next").addEventListener("click", showIdea);
document.querySelector("#idea-use").addEventListener("click", () => {
  textBox.value = `${ideaText.textContent} `.slice(0, 500);
  ideaCard.hidden = true;
  updateCount();
  textBox.focus();
});

refresh();

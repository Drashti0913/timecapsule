// Page entry point: wires the form, filters, search, list, and dialogs together.
import * as api from "./capsulesApi.js";
import {
  renderList,
  renderStats,
  renderLetter,
  tickCountdowns,
  toLocalInputValue,
  showToast,
} from "./capsulesView.js";
import { randomPrompt } from "./prompts.js";
import { launchConfetti } from "./confetti.js";

const DAY = 24 * 60 * 60 * 1000;
const MESSAGE_MAX = 5000;

const EMPTY_TEXT = {
  all: "No letters yet. Write your first one and seal it with a ♥",
  sealed: "No sealed letters right now.",
  opened: "Nothing opened yet. Good things take time ✿",
};

const createForm = document.querySelector("#create-form");
const createError = document.querySelector("#create-error");
const messageBox = createForm.elements.message;
const messageCount = document.querySelector("#message-count");
const listEl = document.querySelector("#capsule-list");
const statusEl = document.querySelector("#list-status");
const statsEl = document.querySelector("#stats");
const readDialog = document.querySelector("#read-dialog");
const editDialog = document.querySelector("#edit-dialog");
const editForm = document.querySelector("#edit-form");
const editError = document.querySelector("#edit-error");
const toastEl = document.querySelector("#toast");
const filterButtons = document.querySelectorAll(".filters button");
const presetButtons = document.querySelectorAll(".presets button");
const searchInput = document.querySelector("#search");
const sortSelect = document.querySelector("#sort");
const promptCard = document.querySelector("#prompt-card");
const promptText = document.querySelector("#prompt-text");

let allCapsules = [];
let filter = "all";
let search = "";
let sort = "soonest";
let currentPrompt = null;
let editing = null;
let refreshing = false;

const handlers = {
  async onOpen(capsule) {
    try {
      const letter = await api.openCapsule(capsule._id);
      renderLetter(readDialog, letter);
      readDialog.showModal();
      launchConfetti(readDialog);
    } catch (err) {
      showToast(toastEl, err.message);
      refresh();
    }
  },

  onEdit(capsule) {
    editing = capsule;
    editError.textContent = "";
    editForm.elements.title.value = capsule.title;
    const current = toLocalInputValue(capsule.unlockAt);
    editForm.elements.unlockAt.value = current;
    editForm.elements.unlockAt.min = current;
    editDialog.showModal();
  },

  async onDelete(capsule) {
    if (!confirm(`Delete "${capsule.title}"? This can't be undone.`)) return;
    try {
      await api.deleteCapsule(capsule._id);
      showToast(toastEl, "Letter deleted");
      refresh();
    } catch (err) {
      showToast(toastEl, err.message);
    }
  },
};

function render() {
  const query = search.trim().toLowerCase();

  const visible = allCapsules
    .filter((c) => {
      if (filter === "sealed") return !c.isUnlocked;
      if (filter === "opened") return c.isUnlocked;
      return true;
    })
    .filter((c) => c.title.toLowerCase().includes(query))
    .sort((a, b) =>
      sort === "newest"
        ? new Date(b.createdAt) - new Date(a.createdAt)
        : new Date(a.unlockAt) - new Date(b.unlockAt),
    );

  const emptyText = query
    ? `No letters match "${search.trim()}".`
    : EMPTY_TEXT[filter];
  renderList(listEl, statusEl, visible, handlers, emptyText);
}

async function refresh() {
  if (refreshing) return;
  refreshing = true;
  try {
    const [capsules, stats] = await Promise.all([
      api.listCapsules(),
      api.getStats(),
    ]);
    allCapsules = capsules;
    render();
    renderStats(statsEl, stats);
  } catch (err) {
    statusEl.textContent = err.message;
  } finally {
    refreshing = false;
  }
}

function updateCount() {
  const length = messageBox.value.length;
  messageCount.textContent = `${length} / ${MESSAGE_MAX}`;
  messageCount.classList.toggle("near-limit", length > MESSAGE_MAX * 0.9);
}

function setMinDate() {
  createForm.elements.unlockAt.min = toLocalInputValue(
    new Date(Date.now() + 60 * 1000),
  );
}

function showNextPrompt() {
  currentPrompt = randomPrompt(currentPrompt);
  promptText.textContent = currentPrompt;
  promptCard.hidden = false;
}

// Writing prompts
document
  .querySelector("#prompt-button")
  .addEventListener("click", showNextPrompt);
document
  .querySelector("#prompt-next")
  .addEventListener("click", showNextPrompt);
document.querySelector("#prompt-use").addEventListener("click", () => {
  const start = messageBox.value.trim()
    ? `${messageBox.value.trimEnd()}\n\n`
    : "";
  messageBox.value = `${start}${currentPrompt}\n`;
  promptCard.hidden = true;
  updateCount();
  messageBox.focus();
});

// Filter tabs
for (const filterButton of filterButtons) {
  filterButton.addEventListener("click", () => {
    filter = filterButton.dataset.filter;
    for (const other of filterButtons) {
      other.setAttribute("aria-pressed", String(other === filterButton));
    }
    render();
  });
}

// Search and sort
searchInput.addEventListener("input", () => {
  search = searchInput.value;
  render();
});

sortSelect.addEventListener("change", () => {
  sort = sortSelect.value;
  render();
});

// Quick date buttons
for (const preset of presetButtons) {
  preset.addEventListener("click", () => {
    const date = new Date(Date.now() + Number(preset.dataset.days) * DAY);
    createForm.elements.unlockAt.value = toLocalInputValue(date);
  });
}

messageBox.addEventListener("input", updateCount);

createForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  createError.textContent = "";

  const title = createForm.elements.title.value.trim();
  const message = messageBox.value;
  const unlockValue = createForm.elements.unlockAt.value;

  if (!title) return (createError.textContent = "Add a title for your letter.");
  if (!message.trim())
    return (createError.textContent = "Write a message before sealing.");
  if (!unlockValue) return (createError.textContent = "Pick an unlock date.");

  const unlockAt = new Date(unlockValue);
  if (unlockAt <= new Date()) {
    return (createError.textContent = "Pick an unlock date in the future.");
  }

  const submit = createForm.querySelector("button[type=submit]");
  submit.disabled = true;
  try {
    await api.createCapsule({
      title,
      message,
      unlockAt: unlockAt.toISOString(),
      mood: createForm.elements.mood.value,
      occasion: createForm.elements.occasion.value,
      color: createForm.elements.color.value,
    });
    createForm.reset();
    promptCard.hidden = true;
    updateCount();
    setMinDate();
    showToast(toastEl, "Letter sealed ♥");
    refresh();
  } catch (err) {
    createError.textContent = err.message;
  } finally {
    submit.disabled = false;
  }
});

editForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  editError.textContent = "";

  const title = editForm.elements.title.value.trim();
  const unlockAt = new Date(editForm.elements.unlockAt.value);

  if (!title) return (editError.textContent = "Add a title for your letter.");
  if (isNaN(unlockAt.getTime()))
    return (editError.textContent = "Pick an unlock date.");

  // Keep the original date if the user didn't change it (avoids rounding off seconds)
  const original = toLocalInputValue(editing.unlockAt);
  const changes = { title };
  if (editForm.elements.unlockAt.value !== original)
    changes.unlockAt = unlockAt.toISOString();

  try {
    await api.updateCapsule(editing._id, changes);
    editDialog.close();
    showToast(toastEl, "Changes saved ✿");
    refresh();
  } catch (err) {
    editError.textContent = err.message;
  }
});

document
  .querySelector("#edit-cancel")
  .addEventListener("click", () => editDialog.close());

// One timer for every countdown and progress bar. When one finishes, ask the
// server again instead of revealing anything in the browser.
setInterval(() => {
  if (tickCountdowns(listEl)) refresh();
}, 1000);

setMinDate();
updateCount();
refresh();

// Rendering helpers for the Letters feature. User text is always set with
// textContent, never innerHTML, so nobody can inject HTML or scripts.

const dateFormat = new Intl.DateTimeFormat(undefined, {
  dateStyle: "long",
  timeStyle: "short",
});

export function formatDate(value) {
  return dateFormat.format(new Date(value));
}

// Value for <input type="datetime-local"> in the user's local time
export function toLocalInputValue(date) {
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

export function formatCountdown(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return `${days}d ${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
}

function progressPercent(createdAt, unlockAt, now) {
  const start = new Date(createdAt).getTime();
  const end = new Date(unlockAt).getTime();
  if (end <= start) return 100;
  const percent = ((now - start) / (end - start)) * 100;
  return Math.min(100, Math.max(0, percent));
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function button(label, onClick, className) {
  const b = el("button", className, label);
  b.type = "button";
  b.addEventListener("click", onClick);
  return b;
}

function updateProgress(wrap, now) {
  const percent = progressPercent(
    wrap.dataset.createdAt,
    wrap.dataset.unlockAt,
    now,
  );
  const rounded = Math.floor(percent);
  wrap.querySelector(".progress-fill").style.width = `${percent}%`;
  wrap
    .querySelector(".progress")
    .setAttribute("aria-valuenow", String(rounded));
  wrap.querySelector(".progress-label").textContent =
    `${rounded}% of the wait is done`;
}

function renderProgress(capsule) {
  const wrap = el("div", "progress-wrap");
  wrap.dataset.createdAt = capsule.createdAt;
  wrap.dataset.unlockAt = capsule.unlockAt;

  const bar = el("div", "progress");
  bar.setAttribute("role", "progressbar");
  bar.setAttribute("aria-label", "Time waited so far");
  bar.setAttribute("aria-valuemin", "0");
  bar.setAttribute("aria-valuemax", "100");
  bar.append(el("span", "progress-fill"));

  wrap.append(bar, el("p", "progress-label"));
  updateProgress(wrap, Date.now());
  return wrap;
}

function renderCapsule(capsule, handlers) {
  const item = el("li", capsule.isUnlocked ? "capsule is-open" : "capsule");

  const seal = el("div", "seal");
  seal.setAttribute("aria-hidden", "true");

  const info = el("div");
  info.append(el("h3", "", capsule.title));

  if (capsule.isUnlocked) {
    info.append(
      el("p", "capsule-date", `Opened on ${formatDate(capsule.unlockAt)}`),
    );
    info.append(el("p", "opened-label", "Ready to read ✿"));
  } else {
    info.append(
      el("p", "capsule-date", `Opens ${formatDate(capsule.unlockAt)}`),
    );
    const countdown = el("p", "countdown");
    countdown.dataset.unlockAt = capsule.unlockAt;
    countdown.textContent = formatCountdown(
      new Date(capsule.unlockAt) - Date.now(),
    );
    info.append(countdown, renderProgress(capsule));
  }

  const actions = el("div", "capsule-actions");
  if (capsule.isUnlocked) {
    actions.append(button("Open", () => handlers.onOpen(capsule)));
  } else {
    actions.append(
      button("Edit", () => handlers.onEdit(capsule), "button-secondary"),
    );
  }
  actions.append(
    button("Delete", () => handlers.onDelete(capsule), "button-secondary"),
  );

  item.append(seal, info, actions);
  return item;
}

export function renderList(listEl, statusEl, capsules, handlers, emptyText) {
  listEl.replaceChildren(...capsules.map((c) => renderCapsule(c, handlers)));
  statusEl.textContent = capsules.length ? "" : emptyText;
}

export function renderStats(statsEl, stats) {
  if (!stats.total) {
    statsEl.replaceChildren();
    return;
  }

  const bubbles = [
    ["Sealed", stats.locked, "stat-sealed"],
    ["Opened", stats.opened, "stat-opened"],
    ["Total", stats.total, "stat-total"],
  ].map(([label, value, className]) => {
    const li = el("li", `stat ${className}`);
    li.append(el("strong", "", String(value)), el("span", "", label));
    return li;
  });

  if (stats.nextUnlock) {
    const next = el("li", "stat stat-next");
    next.append(
      el("strong", "", "Next opens"),
      el("span", "", formatDate(stats.nextUnlock)),
    );
    bubbles.push(next);
  }

  statsEl.replaceChildren(...bubbles);
}

// Updates every countdown and progress bar. Returns true if any reached zero.
export function tickCountdowns(listEl) {
  const now = Date.now();
  let finished = false;

  for (const node of listEl.querySelectorAll(".countdown")) {
    const remaining = new Date(node.dataset.unlockAt) - now;
    node.textContent = formatCountdown(remaining);
    if (remaining <= 0) finished = true;
  }

  for (const wrap of listEl.querySelectorAll(".progress-wrap")) {
    updateProgress(wrap, now);
  }

  return finished;
}

export function renderLetter(dialog, letter) {
  dialog.querySelector("#read-title").textContent = letter.title;
  dialog.querySelector("#read-meta").textContent =
    `Written ${formatDate(letter.createdAt)}, opened ${formatDate(letter.unlockAt)}`;
  dialog.querySelector("#read-message").textContent = letter.message;
}

let toastTimer;

export function showToast(toastEl, message) {
  toastEl.textContent = message;
  toastEl.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2500);
}

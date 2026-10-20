// Pastel confetti, built with plain DOM elements and CSS animation.
const COLORS = [
  "#ffc2d8",
  "#f28cb1",
  "#c4ecdc",
  "#fff1b8",
  "#cfe3ff",
  "#ffdcc7",
  "#c9b8f5",
];

export function launchConfetti(container = document.body, count = 80) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const layer = document.createElement("div");
  layer.className = "confetti";
  layer.setAttribute("aria-hidden", "true");

  for (let i = 0; i < count; i++) {
    const piece = document.createElement("span");
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = COLORS[i % COLORS.length];
    piece.style.animationDelay = `${Math.random() * 0.6}s`;
    piece.style.animationDuration = `${2.2 + Math.random() * 1.5}s`;
    piece.style.setProperty("--drift", `${(Math.random() - 0.5) * 220}px`);
    piece.style.setProperty("--spin", `${Math.random() * 720 - 360}deg`);
    if (i % 3 === 0) piece.style.borderRadius = "50%";
    layer.append(piece);
  }

  container.append(layer);
  setTimeout(() => layer.remove(), 4500);
}

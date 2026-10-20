import { randomUUID } from "crypto";

const COOKIE_NAME = "anonId";
const THREE_YEARS = 60 * 60 * 24 * 365 * 3;

function parseCookies(header = "") {
  const cookies = {};
  for (const part of header.split(";")) {
    const index = part.indexOf("=");
    if (index === -1) continue;
    const key = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();
    cookies[key] = decodeURIComponent(value);
  }
  return cookies;
}

export function anonId(req, res, next) {
  let id = parseCookies(req.headers.cookie)[COOKIE_NAME];

  if (!id) {
    id = randomUUID();
    res.setHeader(
      "Set-Cookie",
      `${COOKIE_NAME}=${id}; HttpOnly; Path=/; Max-Age=${THREE_YEARS}; SameSite=Lax`,
    );
  }

  req.anonId = id;
  next();
}

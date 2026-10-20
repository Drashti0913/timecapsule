// All network calls for the Letters feature live here.
const BASE = "/api/capsules";

async function request(path = "", options = {}) {
  const response = await fetch(BASE + path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (response.status === 204) return null;

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Something went wrong. Try again.");
  }
  return data;
}

export const listCapsules = () => request();

export const getStats = () => request("/stats");

export const openCapsule = (id) => request(`/${id}`);

export const createCapsule = (capsule) =>
  request("", { method: "POST", body: JSON.stringify(capsule) });

export const updateCapsule = (id, changes) =>
  request(`/${id}`, { method: "PUT", body: JSON.stringify(changes) });

export const deleteCapsule = (id) => request(`/${id}`, { method: "DELETE" });

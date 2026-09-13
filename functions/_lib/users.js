// Shared helpers for the user database (stored in Cloudflare KV) and the
// admin auth check. Files/folders starting with "_" are not treated as
// routes by Cloudflare Pages Functions, so this file is just a normal
// module the other functions import from - it is not reachable as a URL.

// Seeded automatically the first time the KV namespace is empty, so the
// owner account always exists even on a brand new deployment.
const SEED_OWNER = {
  id: "seed-owner",
  name: "Owner",
  numericId: "8000424068",
  username: "omid",
  password: "193746258",
  type: "normal"
};

export async function getUsers(env) {
  const raw = await env.NECRON_USERS.get("users");
  if (raw) return JSON.parse(raw);
  await env.NECRON_USERS.put("users", JSON.stringify([SEED_OWNER]));
  return [SEED_OWNER];
}

export async function saveUsers(env, users) {
  await env.NECRON_USERS.put("users", JSON.stringify(users));
}

// Checks the admin password sent by the client against the real one,
// which lives only in the server's environment variables/secrets - it is
// never present anywhere in the HTML/JS shipped to the browser.
export function checkAdmin(request, env) {
  const pass = request.headers.get("x-admin-password");
  if (!pass || pass !== env.ADMIN_PASSWORD) {
    return { ok: false, error: "Wrong admin password" };
  }
  return { ok: true };
}

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" }
  });
}

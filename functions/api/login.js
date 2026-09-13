// POST /api/login  { username, password, numericId }
// Verifies credentials against the shared user database in KV - this is
// what makes login work from ANY device/Telegram client, not just the one
// where the account was created.
import { getUsers, json } from "../_lib/users.js";

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return json({ error: "Invalid request body" }, 400);
  }

  const { username, password, numericId } = body || {};
  if (!username || !password || !numericId) {
    return json({ error: "Missing username, password or numeric ID" }, 400);
  }

  const users = await getUsers(env);
  const match = users.find(
    (u) =>
      u.username === username &&
      u.password === password &&
      u.numericId === String(numericId)
  );

  if (!match) {
    return json({ error: "Invalid username or password" }, 401);
  }

  return json({
    user: {
      numericId: match.numericId,
      username: match.username,
      name: match.name,
      type: match.type === "vip" ? "vip" : "normal"
    }
  });
}

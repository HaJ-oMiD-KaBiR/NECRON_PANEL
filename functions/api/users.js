// GET  /api/users   -> list all users (admin only)
// POST /api/users   -> add a new user (admin only)
// Both require header:  X-Admin-Password: <the real admin password>
import { getUsers, saveUsers, checkAdmin, json } from "../_lib/users.js";

export async function onRequestGet({ request, env }) {
  const auth = checkAdmin(request, env);
  if (!auth.ok) return json({ error: auth.error }, 401);

  const users = await getUsers(env);
  return json({ users });
}

export async function onRequestPost({ request, env }) {
  const auth = checkAdmin(request, env);
  if (!auth.ok) return json({ error: auth.error }, 401);

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return json({ error: "Invalid request body" }, 400);
  }

  const { name, numericId, username, password, type } = body || {};
  if (!name || !numericId || !username || !password) {
    return json({ error: "All fields are required." }, 400);
  }
  if (!/^\d+$/.test(String(numericId))) {
    return json({ error: "Numeric ID must contain digits only." }, 400);
  }

  const users = await getUsers(env);
  if (users.some((u) => u.numericId === String(numericId))) {
    return json({ error: "This numeric ID already has an account." }, 400);
  }
  if (users.some((u) => u.username === username)) {
    return json({ error: "This username is already taken." }, 400);
  }

  const newUser = {
    id: "u_" + Date.now() + "_" + Math.random().toString(36).slice(2),
    name,
    numericId: String(numericId),
    username,
    password,
    type: type === "vip" ? "vip" : "normal"
  };
  users.push(newUser);
  await saveUsers(env, users);

  return json({ user: newUser });
}

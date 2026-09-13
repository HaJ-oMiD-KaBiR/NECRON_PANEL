// DELETE /api/users/:id  -> remove a user (admin only)
// Requires header:  X-Admin-Password: <the real admin password>
import { getUsers, saveUsers, checkAdmin, json } from "../../_lib/users.js";

export async function onRequestDelete({ request, env, params }) {
  const auth = checkAdmin(request, env);
  if (!auth.ok) return json({ error: auth.error }, 401);

  const users = await getUsers(env);
  const filtered = users.filter((u) => u.id !== params.id);
  await saveUsers(env, filtered);

  return json({ ok: true });
}

import { corsHeaders, json, requireAdmin } from "./_auth.mjs";

export default async (event) => {
  const headers = corsHeaders(event);
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers, body: "" };
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" }, headers);
  try {
    await requireAdmin(event, "admin");
    const hook = process.env.NETLIFY_BUILD_HOOK_URL;
    if (!hook) throw Object.assign(new Error("NETLIFY_BUILD_HOOK_URL is missing in Netlify environment variables"), { statusCode: 500 });
    const result = await fetch(hook, { method: "POST" });
    if (!result.ok) throw Object.assign(new Error("Netlify rejected the build-hook request"), { statusCode: 502 });
    return json(200, { ok: true, message: "Build hook triggered" }, headers);
  } catch (error) {
    return json(error.statusCode || 500, { error: error.message || "Unexpected error" }, headers);
  }
};

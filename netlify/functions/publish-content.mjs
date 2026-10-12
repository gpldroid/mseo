import { corsHeaders, json, requireAdmin } from "./_auth.mjs";

export default async (event) => {
  const headers = corsHeaders(event);
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers, body: "" };
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" }, headers);
  try {
    await requireAdmin(event, "editor");
    const token = process.env.GITHUB_TOKEN;
    const owner = process.env.GITHUB_OWNER || "gpldroid";
    const repo = process.env.GITHUB_REPO || "mseo";
    const branch = process.env.GITHUB_BRANCH || "main";
    if (!token) throw Object.assign(new Error("GITHUB_TOKEN is missing in Netlify environment variables"), { statusCode: 500 });
    const input = JSON.parse(event.body || "{}");
    const slug = String(input.slug || "");
    const status = String(input.status || "draft");
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw Object.assign(new Error("Invalid article slug"), { statusCode: 400 });
    const path = ".github/cms-content-sync.json";
    const api = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    const headersGitHub = { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", "Content-Type": "application/json" };
    const current = await fetch(`${api}?ref=${encodeURIComponent(branch)}`, { headers: headersGitHub });
    let sha;
    if (current.ok) sha = (await current.json()).sha;
    else if (current.status !== 404) throw Object.assign(new Error("Could not inspect GitHub sync marker"), { statusCode: current.status });
    const marker = { updated_at: new Date().toISOString(), slug, status, source: "supabase-cms" };
    const commit = await fetch(api, { method: "PUT", headers: headersGitHub, body: JSON.stringify({ message: `cms: sync ${slug} (${status})`, content: Buffer.from(JSON.stringify(marker, null, 2) + "\n").toString("base64"), branch, ...(sha ? { sha } : {}) }) });
    const result = await commit.json();
    if (!commit.ok) throw Object.assign(new Error(result.message || "Could not trigger content deployment"), { statusCode: commit.status });
    return json(200, { ok: true, commit: result.commit?.sha, message: "Content saved; GitHub Pages and connected Netlify deployments were triggered." }, headers);
  } catch (error) {
    return json(error.statusCode || 500, { error: error.message || "Unexpected error" }, headers);
  }
};

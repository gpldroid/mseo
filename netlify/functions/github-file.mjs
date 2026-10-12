import { corsHeaders, json, requireAdmin } from "./_auth.mjs";

export default async (event) => {
  const headers = corsHeaders(event);
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers, body: "" };
  try {
    await requireAdmin(event, event.httpMethod === "PUT" ? "admin" : "editor");
    const token = process.env.GITHUB_TOKEN;
    const owner = process.env.GITHUB_OWNER || "gpldroid";
    const repo = process.env.GITHUB_REPO || "mseo";
    const branch = process.env.GITHUB_BRANCH || "main";
    if (!token) throw Object.assign(new Error("GITHUB_TOKEN is missing in Netlify environment variables"), { statusCode: 500 });

    if (event.httpMethod === "GET") {
      const path = event.queryStringParameters?.path || "";
      if (!path || path.startsWith("/") || path.split("/").includes("..")) throw Object.assign(new Error("Invalid repository path"), { statusCode: 400 });
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path.split("/").map(encodeURIComponent).join("/")}?ref=${encodeURIComponent(branch)}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" },
      });
      const data = await response.json();
      if (!response.ok) throw Object.assign(new Error(data.message || "GitHub file read failed"), { statusCode: response.status });
      if (data.type !== "file" || !data.content) throw Object.assign(new Error("The selected path is not a text file"), { statusCode: 400 });
      return json(200, { path, sha: data.sha, content: Buffer.from(data.content.replace(/\n/g, ""), "base64").toString("utf8") }, headers);
    }

    if (event.httpMethod === "PUT") {
      const body = JSON.parse(event.body || "{}");
      const path = String(body.path || "");
      const content = String(body.content ?? "");
      const sha = String(body.sha || "");
      const message = String(body.message || "Update file from MSEO admin").slice(0, 200);
      if (!path || path.startsWith("/") || path.split("/").includes("..") || !sha) throw Object.assign(new Error("A valid path and current file SHA are required"), { statusCode: 400 });
      if (content.length > 900_000) throw Object.assign(new Error("File exceeds the 900 KB editor limit"), { statusCode: 413 });
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path.split("/").map(encodeURIComponent).join("/")}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", "Content-Type": "application/json" },
        body: JSON.stringify({ message, content: Buffer.from(content, "utf8").toString("base64"), sha, branch }),
      });
      const data = await response.json();
      if (!response.ok) throw Object.assign(new Error(data.message || "GitHub commit failed"), { statusCode: response.status });
      return json(200, { sha: data.content?.sha, commit: data.commit?.sha, html_url: data.content?.html_url }, headers);
    }
    return json(405, { error: "Method not allowed" }, headers);
  } catch (error) {
    return json(error.statusCode || 500, { error: error.message || "Unexpected error" }, headers);
  }
};

import { cp, mkdir, readdir, rm } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const output = join(root, "dist");
const adminBuild = join(root, ".netlify-admin-build");
const excludedDirectories = new Set([
  ".git", ".github", "node_modules", "admin-dashboard", "scripts",
  "supabase", "dist", ".netlify-admin-build",
]);
const excludedFiles = new Set([
  ".gitignore", "README.md", "ARCHITECTURE.md", "package.json",
  "package-lock.json", "netlify.toml", "tailwind.config.cjs",
]);

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const entry of await readdir(root, { withFileTypes: true })) {
  if (entry.isDirectory() && excludedDirectories.has(entry.name)) continue;
  if (entry.isFile() && excludedFiles.has(entry.name)) continue;
  await cp(join(root, entry.name), join(output, entry.name), { recursive: true });
}

await mkdir(join(output, "admin-dashboard"), { recursive: true });
await cp(adminBuild, join(output, "admin-dashboard"), { recursive: true });
console.log("Netlify site assembled: public website at / and React admin at /admin-dashboard/");

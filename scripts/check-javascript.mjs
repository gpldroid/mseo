import { readdir } from "node:fs/promises";
import { join, relative } from "node:path";
import { spawnSync } from "node:child_process";

const roots = ["assets/js", "scripts"];
const files = [];
async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await walk(path);
    else if (entry.isFile() && /\.(?:js|mjs|cjs)$/.test(entry.name)) files.push(path);
  }
}
for (const root of roots) await walk(root);

const failures = [];
for (const file of files.sort()) {
  const result = spawnSync(process.execPath, ["--check", file], { encoding: "utf8" });
  if (result.status !== 0) {
    failures.push(relative(process.cwd(), file) + "\n" + (result.stderr || result.stdout || "Syntax check failed"));
  }
}
if (failures.length) {
  console.error(failures.join("\n\n"));
  process.exit(1);
}
console.log("JavaScript syntax checks passed:", files.length, "files.");

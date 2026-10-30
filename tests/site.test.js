// Guards the deploy: every file the browser will request must exist AND be copied
// by the "Collect site files" step in .github/workflows/ci.yml. (Adding a new
// script or vendor file without updating the list used to ship a broken site.)
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const isLocal = (ref) => !/^(https?:)?\/\//.test(ref) && !ref.startsWith("data:");

// index.html -> its scripts/styles -> whatever those scripts import, recursively.
function requestedFiles() {
  const seen = new Set(["index.html"]);
  const queue = [];
  const html = read("index.html");
  for (const m of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
    if (isLocal(m[1])) queue.push(path.posix.normalize(m[1]));
  }
  while (queue.length) {
    const file = queue.pop();
    if (seen.has(file)) continue;
    seen.add(file);
    if (!file.endsWith(".js")) continue;
    for (const m of read(file).matchAll(/(?:from|import)\s*\(?\s*["'](\.{1,2}\/[^"']+)["']/g)) {
      queue.push(path.posix.normalize(path.posix.join(path.posix.dirname(file), m[1])));
    }
  }
  return [...seen];
}

// The entries copied into _site/ by the workflow, e.g. ["index.html", ..., "vendor"].
function deployedEntries() {
  const line = read(".github/workflows/ci.yml").split("\n").find((l) => l.includes("cp ") && l.includes("_site"));
  assert.ok(line, "could not find the 'cp ... _site/' line in ci.yml");
  return line.split("cp ")[1].split("_site")[0].split(/\s+/).filter((t) => t && !t.startsWith("-"));
}

test("every file the page requests exists", () => {
  for (const file of requestedFiles()) {
    assert.ok(fs.existsSync(path.join(root, file)), `${file} is requested but missing`);
  }
});

test("every file the page requests is copied by the deploy step", () => {
  const entries = deployedEntries();
  for (const file of requestedFiles()) {
    const covered = entries.some((e) => file === e || file.startsWith(e + "/"));
    assert.ok(covered, `${file} is used by the page but not copied in ci.yml (copied: ${entries.join(", ")})`);
  }
});

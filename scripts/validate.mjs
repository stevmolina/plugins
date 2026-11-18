// Checks that every plugin is listed in all three marketplaces and that its
// manifests and skills agree. No dependencies: run with `node scripts/validate.mjs`.
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const read = (p) => JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
const errors = [];
const fail = (msg) => errors.push(msg);

const dirs = fs.readdirSync(path.join(root, "plugins")).filter((d) =>
  fs.statSync(path.join(root, "plugins", d)).isDirectory()
);

const markets = {
  claude: [".claude-plugin/marketplace.json", (e) => e.source],
  cursor: [".cursor-plugin/marketplace.json", (e) => `./${e.source.replace(/^\.\//, "")}`],
  codex: [".agents/plugins/marketplace.json", (e) => e.source?.path],
};
const names = new Set();
for (const [app, [file, src]] of Object.entries(markets)) {
  const m = read(file);
  names.add(m.name);
  const listed = new Map(m.plugins.map((e) => [e.name, src(e)]));
  for (const d of dirs) {
    if (listed.get(d) !== `./plugins/${d}`) fail(`${app}: ${d} missing or wrong source in ${file}`);
  }
  for (const n of listed.keys()) if (!dirs.includes(n)) fail(`${app}: ${n} listed but plugins/${n} does not exist`);
}
if (names.size !== 1) fail(`marketplace names differ: ${[...names].join(", ")}`);

for (const d of dirs) {
  const base = `plugins/${d}`;
  const manifests = ["plugin.json", ".claude-plugin/plugin.json", ".cursor-plugin/plugin.json"];
  const parsed = manifests.map((f) => {
    try { return read(`${base}/${f}`); } catch (e) { fail(`${base}/${f}: ${e.message}`); return {}; }
  });
  for (const [i, m] of parsed.entries()) {
    if (m.name !== d) fail(`${base}/${manifests[i]}: name "${m.name}" should be "${d}"`);
    for (const k of ["version", "description"]) {
      if (m[k] !== parsed[0][k]) fail(`${base}/${manifests[i]}: ${k} differs from plugin.json`);
    }
  }
  const skillsDir = path.join(root, base, "skills");
  for (const s of fs.existsSync(skillsDir) ? fs.readdirSync(skillsDir) : []) {
    const file = path.join(skillsDir, s, "SKILL.md");
    if (!fs.existsSync(file)) { fail(`${base}/skills/${s}: no SKILL.md`); continue; }
    const fm = fs.readFileSync(file, "utf8").match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!fm) { fail(`${base}/skills/${s}/SKILL.md: no frontmatter`); continue; }
    if (!new RegExp(`^name: ${s}$`, "m").test(fm[1])) fail(`${base}/skills/${s}/SKILL.md: name should be ${s}`);
    if (!/^description: \S/m.test(fm[1])) fail(`${base}/skills/${s}/SKILL.md: missing description`);
  }
}

if (errors.length) {
  console.error(errors.map((e) => `✘ ${e}`).join("\n"));
  process.exit(1);
}
console.log(`✔ ${dirs.length} plugins, 3 marketplaces, manifests and skills agree`);

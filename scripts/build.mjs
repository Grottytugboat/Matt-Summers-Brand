import { cp, mkdir, readdir, rm, stat } from "node:fs/promises";
import { join } from "node:path";

const output = new URL("../dist/", import.meta.url);
const root = new URL("../", import.meta.url);
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const entry of [
  "index.html",
  "styles.css",
  "app.js",
  "fonts.css",
  "fonts",
  "bensons",
  "collection",
  "nightbird",
  "nightbird.css",
  "mega-menu.css",
  "mega-menu.js",
  "age-gate.css",
]) {
  await cp(new URL(entry, root), new URL(entry, output), { recursive: true });
}
await mkdir(new URL("assets/", output), { recursive: true });
for (const name of await readdir(new URL("assets/", root))) {
  if (/\.(webp|jpe?g|svg|ico)$/.test(name)) {
    await cp(
      new URL(`assets/${name}`, root),
      new URL(`assets/${name}`, output),
    );
  }
}
async function totalSize(path) {
  const entries = await readdir(path, { withFileTypes: true });
  const sizes = await Promise.all(
    entries.map(async (entry) => {
      const child = join(path, entry.name);
      return entry.isDirectory() ? totalSize(child) : (await stat(child)).size;
    }),
  );
  return sizes.reduce((sum, size) => sum + size, 0);
}
console.log(
  `Built static showcase: ${((await totalSize(output.pathname)) / 1024).toFixed(0)} KB in dist/`,
);

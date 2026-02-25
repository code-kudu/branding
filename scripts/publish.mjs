#!/usr/bin/env node

import { cpSync, existsSync, readdirSync } from "fs";
import { join, extname, resolve } from "path";
import { parseArgs } from "util";

const ALLOWED_EXTENSIONS = new Set([".svg", ".png", ".ico"]);

const { values } = parseArgs({
  options: {
    target: { type: "string", default: process.cwd() },
  },
  strict: false,
});

const targetRoot = resolve(values.target);
const brandingRoot = resolve(import.meta.dirname, "..");

if (!existsSync(brandingRoot) || !existsSync(join(brandingRoot, "icon"))) {
  console.error(
    `Error: Could not find branding assets at "${brandingRoot}". Is @code-kudu/branding installed?`
  );
  process.exit(1);
}

function copyFiltered(srcDir, destDir) {
  if (!existsSync(srcDir)) return;

  for (const entry of readdirSync(srcDir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      copyFiltered(join(srcDir, entry.name), join(destDir, entry.name));
    } else if (ALLOWED_EXTENSIONS.has(extname(entry.name).toLowerCase())) {
      cpSync(join(srcDir, entry.name), join(destDir, entry.name), {
        recursive: true,
      });
    }
  }
}

const brandingDest = join(targetRoot, "code-kudu");

copyFiltered(join(brandingRoot, "assets"), brandingDest);
copyFiltered(join(brandingRoot, "icon", "dark"), join(brandingDest, "icon", "dark"));
copyFiltered(join(brandingRoot, "icon", "default"), join(brandingDest, "icon", "default"));
copyFiltered(join(brandingRoot, "logo", "dark"), join(brandingDest, "logo", "dark"));
copyFiltered(join(brandingRoot, "logo", "default"), join(brandingDest, "logo", "default"));

console.log(`Branding assets published to "${targetRoot}"`);

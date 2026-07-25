// Build-time existence checks for files in public/.
//
// WHY THIS EXISTS — read before "simplifying" it back:
//
// Components used to resolve public/ with
// `fileURLToPath(new URL('../../public/', import.meta.url))`. That works in
// `astro dev`, and it worked in `astro build` only by coincidence: at render
// time the component has been bundled into dist/.prerender/chunks/, so the
// relative hop happened to land on the project root from that specific depth.
// An Astro 7.0 -> 7.1 upgrade changed the output depth and the hop started
// resolving somewhere else.
//
// The failure was silent and total. Every caller treats "file not found" as
// "the owner hasn't supplied this asset yet" and renders a labelled
// placeholder instead — which is the right behaviour for a missing photo, and
// exactly the wrong behaviour for "I can't find the public directory at all."
// All 24 carousel images disappeared from the built pages and the build still
// reported success.
//
// So: resolve from the project root (cwd is the project root for both
// `astro dev` and `astro build`), and treat a missing public/ as a hard error
// rather than as 24 missing files.
import fs from 'node:fs';
import path from 'node:path';

const PUBLIC_DIR = path.join(process.cwd(), 'public');

if (!fs.existsSync(PUBLIC_DIR)) {
  throw new Error(
    `publicAssets: public/ not found at ${PUBLIC_DIR}. ` +
      `Asset checks would silently report every file as missing and every ` +
      `photo would render as a placeholder. Run builds from the project root.`,
  );
}

/** True if `/img/foo.jpg` exists in public/. Accepts a site-absolute path. */
export function publicAssetExists(src) {
  if (!src) return false;
  const rel = src.replace(/^\/+/, '').split(/[?#]/)[0];
  const full = path.resolve(PUBLIC_DIR, rel);
  // Never let a crafted src escape public/.
  if (full !== PUBLIC_DIR && !full.startsWith(PUBLIC_DIR + path.sep)) return false;
  return fs.existsSync(full);
}

/** Returns the subset of `srcs` that are NOT on disk. */
export function missingPublicAssets(srcs = []) {
  return srcs.filter((s) => !publicAssetExists(s));
}

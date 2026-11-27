// Deal Lantern — black-friday-deal-finder-01 (Node 22, standard library only).
// The entry program hands the site in: it copies app/ and screenshots/ from
// beside this file into the output directory and writes dossier.json there,
// the summary the judge reads, using the kit's vendored library. The library
// must stay exactly as the kit shipped it: the scorer rebuilds the dossier
// with its own copy and compares the two byte for byte.
//
// The program writes the same bytes every run: it copies files as they are
// and the dossier is a pure function of them, so running it twice changes
// nothing. Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

const here = fileURLToPath(new URL(".", import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

mkdirSync(out, { recursive: true });
cpSync(join(here, "app"), join(out, "app"), { recursive: true });
mkdirSync(join(out, "screenshots"), { recursive: true });
if (existsSync(join(here, "screenshots"))) {
  cpSync(join(here, "screenshots"), join(out, "screenshots"), { recursive: true });
}

// The caps match the gate: at most 4 screenshots of 256 KiB each, app/ at
// most 993 files and directories and 16 MiB, and the dossier text at most
// 160 KiB. A site past any of them is refused here, as the scorer would.
writeFileSync(
  join(out, "dossier.json"),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 16777216,
  }),
);

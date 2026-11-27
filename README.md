[![black-friday-deal-finder-01](https://make.fun/badge/black-friday-deal-finder-01.svg)](https://make.fun/bounty/black-friday-deal-finder-01)
[![rank](https://make.fun/badge/black-friday-deal-finder-01/Hasanrdp/black-friday-deal-finder-01/rank.svg)](https://make.fun/bounty/black-friday-deal-finder-01)
[![reward](https://make.fun/badge/black-friday-deal-finder-01/Hasanrdp/black-friday-deal-finder-01/reward.svg)](https://make.fun/bounty/black-friday-deal-finder-01)

# Deal Lantern — Black Friday Deal Finder

A static site of 45 real Black Friday and Cyber Monday deals, each checked on the morning of Black Friday, 27 November 2026, with an honest call on whether it is really a deal. An entry for [black-friday-deal-finder-01](https://make.fun/bounty/black-friday-deal-finder-01) on make.fun.

## What it does

- **45 deals** across 12 categories and 7 stores — TVs, audio, laptops, phones, kitchen, home, fashion, streaming, gaming, smart home, e-readers and accessories.
- Every deal shows its product, store, sale price, usual price, discount, a link to the product at its store, and **when its price was checked** and where it was read.
- A **verdict on every deal** — New low, Strong deal, Good deal, Fair deal or Routine sale — with the evidence for it. A small cut dressed up as a sale is called a routine sale.
- **Search and filters that work**: text search, category, store, minimum discount, new-lows-only, and sorting by verdict, discount, dollars saved or price.
- A **page per deal** with the full price math, the verdict and its evidence, the same product at another store where one was confirmed, and more from the same store and category.
- A **phone layout** as well as a desktop one, and no network request: every file the site loads is its own, under `app/`.

## How a deal is checked

Every price was read from a deals source that names its store (Tom's Guide, USA Today, the New York Post, What Hi-Fi, Popular Science and the stores' own Black Friday ads), on the morning of 27 November 2026. The source is printed on every deal's page, and the method is explained on the site at `#/about`. Nothing here is invented: no product, price or link appears that no source showed.

## Run it

```sh
node serve.ts        # serves app/ on http://localhost:8080
```

Open http://localhost:8080 in a browser. The entry program hands the site in:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

It copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the kit's `vendor/makefun-frontend.ts`.

## Layout

- `main.ts` — the entry program (Node 22, standard library only)
- `app/index.html` — the shell
- `app/style.css` — the whole design, no outside fonts or images
- `app/main.js` — hash routes and control wiring
- `app/views.js` — the pages, as HTML
- `app/filters.js` — filtering, sorting and verdict math
- `app/deals.js` — the 45 checked deals
- `screenshots/` — four renders of the site running
- `vendor/makefun-frontend.ts` — the kit's dossier library, unchanged

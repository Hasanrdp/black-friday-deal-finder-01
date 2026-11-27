// Deal Lantern's filtering, sorting and verdict math. Pure functions only:
// they take deals in and hand deals back, so the list view and the detail
// view always agree on what a deal is worth.

export const SIGNALS = {
  "new-low": { label: "New low", rank: 5, blurb: "Lowest price seen" },
  strong: { label: "Strong deal", rank: 4, blurb: "A real cut" },
  good: { label: "Good deal", rank: 3, blurb: "Worth a look" },
  fair: { label: "Fair deal", rank: 2, blurb: "A modest cut" },
  routine: { label: "Routine sale", rank: 1, blurb: "Barely a sale" },
};

// Whole-percent discount, from the two prices. A streaming price is monthly,
// so its percent still compares like with like.
export function percentOff(deal) {
  if (!deal.was || deal.was <= deal.price) return 0;
  return Math.round((1 - deal.price / deal.was) * 100);
}

export function savedAmount(deal) {
  return Math.max(0, deal.was - deal.price);
}

export function verdictRank(deal) {
  return SIGNALS[deal.signal]?.rank ?? 0;
}

// The board's verdict order: the truest deals first, then the deepest cut,
// then the cheapest price. This is the default sort.
export function byVerdict(a, b) {
  const rank = verdictRank(b) - verdictRank(a);
  if (rank !== 0) return rank;
  const cut = percentOff(b) - percentOff(a);
  if (cut !== 0) return cut;
  return a.price - b.price;
}

export const SORTS = {
  verdict: { label: "Best verdict first", run: byVerdict },
  discount: {
    label: "Biggest discount",
    run: (a, b) => percentOff(b) - percentOff(a) || verdictRank(b) - verdictRank(a),
  },
  priceLow: {
    label: "Lowest price",
    run: (a, b) => a.price - b.price || percentOff(b) - percentOff(a),
  },
  priceHigh: {
    label: "Highest price",
    run: (a, b) => b.price - a.price || percentOff(b) - percentOff(a),
  },
  savings: {
    label: "Most dollars saved",
    run: (a, b) => savedAmount(b) - savedAmount(a) || percentOff(b) - percentOff(a),
  },
};

// One place for every filter the controls offer. `query` matches the title,
// store and category; `minOff` is a whole percent; `lowsOnly` keeps new lows.
export function filterDeals(all, { query = "", category = "", store = "", minOff = 0, lowsOnly = false }) {
  const q = query.trim().toLowerCase();
  return all.filter((deal) => {
    if (q !== "" && !`${deal.title} ${deal.store} ${deal.category}`.toLowerCase().includes(q)) return false;
    if (category !== "" && deal.category !== category) return false;
    if (store !== "" && deal.store !== store) return false;
    if (percentOff(deal) < minOff) return false;
    if (lowsOnly && deal.signal !== "new-low") return false;
    return true;
  });
}

export function sortDeals(list, sortKey) {
  const sort = SORTS[sortKey] ?? SORTS.verdict;
  return [...list].sort(sort.run);
}

export function boardStats(all) {
  const total = all.length;
  const stores = new Set(all.map((d) => d.store)).size;
  const categories = new Set(all.map((d) => d.category)).size;
  const lows = all.filter((d) => d.signal === "new-low").length;
  const averageOff = total === 0 ? 0 : Math.round(all.reduce((sum, d) => sum + percentOff(d), 0) / total);
  const totalSaved = all.reduce((sum, d) => sum + savedAmount(d), 0);
  return { total, stores, categories, lows, averageOff, totalSaved };
}

export function distinctValues(all, field) {
  return [...new Set(all.map((d) => d[field]))].sort();
}

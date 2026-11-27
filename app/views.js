// Deal Lantern's pages, as HTML strings. Every value that came from the
// deal data is escaped before it reaches the page. Views never fetch: the
// deals are already in the module, so the site works with no network.

import { percentOff, savedAmount, SIGNALS, boardStats } from "./filters.js";

const escape = (value) =>
  String(value).replace(/[&<>"']/g, (ch) => `&#${ch.charCodeAt(0)};`);

export function money(amount, per) {
  // Round to cents first: 2699.99 - 1349.99 is 1350.0000000000002 in binary,
  // and the price should print as $1,350, not $1,350.00.
  const rounded = Math.round(amount * 100) / 100;
  const text = `$${rounded.toLocaleString("en-US", { minimumFractionDigits: Number.isInteger(rounded) ? 0 : 2, maximumFractionDigits: 2 })}`;
  return per ? `${text}/mo` : text;
}

function checkedLine(iso) {
  const when = new Date(iso);
  return when.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }) + " UTC";
}

// One small inline icon per category, drawn as SVG so the site loads no
// images at all. The icon is decoration; the category name is beside it.
const ICONS = {
  TVs: '<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M9 21h6"/>',
  Audio: '<path d="M4 10v4h3l4 4V6L7 10H4z"/><path d="M15 9a4 4 0 0 1 0 6"/>',
  Laptops: '<rect x="4" y="5" width="16" height="11" rx="1"/><path d="M2 19h20"/>',
  Phones: '<rect x="8" y="3" width="8" height="18" rx="2"/><path d="M11 18h2"/>',
  Kitchen: '<path d="M5 3h6v8a3 3 0 0 1-6 0V3z"/><path d="M15 3c-2 2-2 5 0 7v9"/>',
  Home: '<path d="M3 11l9-7 9 7"/><path d="M6 10v10h12V10"/>',
  Fashion: '<path d="M8 3l4 3 4-3 3 4-5 3v11H10V10L5 7l3-4z"/>',
  Streaming: '<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M10 10l5 2-5 2v-4z"/>',
  Gaming: '<path d="M7 8h10a5 5 0 0 1 4 8l-2 3-3-2H8l-3 2-2-3a5 5 0 0 1 4-8z"/>',
  "Smart home": '<path d="M12 3l8 6v9a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1V9l8-6z"/>',
  "E-readers": '<path d="M4 5a2 2 0 0 1 2-2h6v16H6a2 2 0 0 0-2 2V5z"/><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2h-6"/>',
  Accessories: '<path d="M9 7V3h6v4"/><rect x="5" y="7" width="14" height="13" rx="2"/>',
};

function categoryIcon(category) {
  const paths = ICONS[category] ?? ICONS.Accessories;
  return `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
}

function verdictBadge(deal) {
  const signal = SIGNALS[deal.signal] ?? SIGNALS.fair;
  const mark = deal.signal === "new-low" ? "★ " : "";
  return `<span class="verdict verdict-${escape(deal.signal)}" title="${escape(signal.blurb)}">${mark}${escape(signal.label)}</span>`;
}

function dealCard(deal) {
  const off = percentOff(deal);
  const per = deal.per === "month" ? "month" : "";
  return `<article class="card">
  <div class="card-top">
    <span class="category">${categoryIcon(deal.category)}${escape(deal.category)}</span>
    ${verdictBadge(deal)}
  </div>
  <h3><a href="#/deal/${encodeURIComponent(deal.id)}">${escape(deal.title)}</a></h3>
  <p class="store">${escape(deal.store)}</p>
  <p class="prices"><strong>${money(deal.price, per)}</strong> <s>${money(deal.was, per)}</s> <span class="off">−${off}%</span></p>
  <p class="save">You save ${money(savedAmount(deal), per)}</p>
  <p class="checked">Checked ${checkedLine(deal.checked)}</p>
  <p class="card-links"><a href="#/deal/${encodeURIComponent(deal.id)}">Why this is a deal →</a> <a href="${escape(deal.url)}" rel="noopener" target="_blank">At ${escape(deal.store)} ↗</a></p>
</article>`;
}

function statsStrip(all) {
  const stats = boardStats(all);
  return `<section class="stats" aria-label="Board summary">
  <div><strong>${stats.total}</strong><span>deals checked</span></div>
  <div><strong>${stats.lows}</strong><span>new lows</span></div>
  <div><strong>${stats.stores}</strong><span>stores</span></div>
  <div><strong>${stats.categories}</strong><span>categories</span></div>
  <div><strong>${stats.averageOff}%</strong><span>average cut</span></div>
  <div><strong>${money(Math.round(stats.totalSaved))}</strong><span>total savings</span></div>
</section>`;
}

export function controlsView({ query, category, store, minOff, sortKey, lowsOnly, categories, stores }) {
  const option = (value, current, label) =>
    `<option value="${escape(value)}"${value === current ? " selected" : ""}>${escape(label)}</option>`;
  return `<section class="controls" aria-label="Search and filter deals">
  <label class="search">Search deals
    <input type="search" id="q" value="${escape(query)}" placeholder="Try “OLED”, “AirPods”, “vacuum”…" autocomplete="off">
  </label>
  <label>Category
    <select id="category">
      ${option("", category, "All categories")}
      ${categories.map((c) => option(c, category, c)).join("")}
    </select>
  </label>
  <label>Store
    <select id="store">
      ${option("", store, "All stores")}
      ${stores.map((s) => option(s, store, s)).join("")}
    </select>
  </label>
  <label>Discount
    <select id="minOff">
      ${option("0", String(minOff), "Any discount")}
      ${option("20", String(minOff), "20% off or more")}
      ${option("30", String(minOff), "30% off or more")}
      ${option("40", String(minOff), "40% off or more")}
      ${option("50", String(minOff), "50% off or more")}
    </select>
  </label>
  <label>Sort by
    <select id="sort">
      ${option("verdict", sortKey, "Best verdict first")}
      ${option("discount", sortKey, "Biggest discount")}
      ${option("savings", sortKey, "Most dollars saved")}
      ${option("priceLow", sortKey, "Lowest price")}
      ${option("priceHigh", sortKey, "Highest price")}
    </select>
  </label>
  <label class="lows"><input type="checkbox" id="lowsOnly"${lowsOnly ? " checked" : ""}> New lows only</label>
</section>`;
}

export function listView(all, shown, state, meta) {
  const heading = state.lowsOnly ? "New lows" : "All Black Friday deals";
  const count = `<p class="count" role="status">Showing <strong>${shown.length}</strong> of <strong>${all.length}</strong> deals · checked ${escape(meta.checkedDay)}</p>`;
  const cards = shown.length === 0
    ? `<p class="empty">No deal matches those filters. <a href="#/">Clear the filters</a> and try again.</p>`
    : `<div class="grid">${shown.map(dealCard).join("")}</div>`;
  return `${statsStrip(all)}
<h1>${escape(heading)}</h1>
<p class="lede">Every price below was read from a deals source that names its store, on the morning of Black Friday — and every deal carries our honest call on whether it is really a deal.</p>
${controlsView(state)}
${count}
${cards}`;
}

export function detailView(deal, all) {
  const off = percentOff(deal);
  const per = deal.per === "month" ? "month" : "";
  const signal = SIGNALS[deal.signal] ?? SIGNALS.fair;
  const sameStore = all.filter((d) => d.id !== deal.id && d.store === deal.store && d.category === deal.category).slice(0, 3);
  const alsoAt = (deal.alsoAt ?? []).map(
    (other) => `<li>${escape(other.store)}: <strong>${money(other.price, per)}</strong></li>`,
  ).join("");
  const moreHere = sameStore.length === 0 ? "" : `<h2>More ${escape(deal.category)} at ${escape(deal.store)}</h2>
<ul class="more">${sameStore.map((d) => `<li><a href="#/deal/${encodeURIComponent(d.id)}">${escape(d.title)}</a> — ${money(d.price, d.per === "month" ? "month" : "")} <s>${money(d.was, d.per === "month" ? "month" : "")}</s></li>`).join("")}</ul>`;
  return `<p class="back"><a href="#/">← All deals</a></p>
<article class="detail">
  <div class="card-top">
    <span class="category">${categoryIcon(deal.category)}${escape(deal.category)}</span>
    ${verdictBadge(deal)}
  </div>
  <h1>${escape(deal.title)}</h1>
  <p class="store">${escape(deal.store)}</p>
  <p class="prices big"><strong>${money(deal.price, per)}</strong> <s>${money(deal.was, per)}</s> <span class="off">−${off}%</span></p>
  <p class="save">You save ${money(savedAmount(deal), per)}${per ? " a month" : ""} off the usual price.</p>
  <h2>Is it really a deal?</h2>
  <p class="verdict-text"><strong>${escape(signal.label)}.</strong> ${escape(deal.evidence)}</p>
  ${alsoAt ? `<h2>Same product elsewhere</h2><ul class="more">${alsoAt}</ul>` : ""}
  <dl class="facts">
    <dt>Store</dt><dd>${escape(deal.store)}</dd>
    <dt>Category</dt><dd>${escape(deal.category)}</dd>
    <dt>Sale price</dt><dd>${money(deal.price, per)}${per ? " per month" : ""}</dd>
    <dt>Usual price</dt><dd>${money(deal.was, per)}${per ? " per month" : ""}</dd>
    <dt>Discount</dt><dd>${off}% off — save ${money(savedAmount(deal), per)}</dd>
    <dt>Price checked</dt><dd>${checkedLine(deal.checked)}</dd>
    <dt>Read in</dt><dd>${escape(deal.source)}</dd>
  </dl>
  <p class="buy"><a class="button" href="${escape(deal.url)}" rel="noopener" target="_blank">See it at ${escape(deal.store)} ↗</a></p>
  <p class="fineprint">The link goes to the store's own search for this product. Prices change fast on Black Friday — check the store's page before you buy.</p>
</article>
${moreHere}`;
}

export function aboutView(all) {
  const stats = boardStats(all);
  return `<p class="back"><a href="#/">← All deals</a></p>
<article class="about">
<h1>How Deal Lantern checks a deal</h1>
<p>Deal Lantern lists <strong>${stats.total} deals</strong> from <strong>${stats.stores} stores</strong>, all read on the morning of Black Friday, 27 November 2026. Nothing here is a guess: every price was read from a deals source that names its store, and the source is printed on every deal's page.</p>
<h2>What “really a deal” means</h2>
<ul>
<li><strong>New low</strong> — the lowest price the source has seen for that product.</li>
<li><strong>Strong deal</strong> — a deep, real cut off the usual price.</li>
<li><strong>Good deal</strong> — worth buying if you wanted it anyway.</li>
<li><strong>Fair deal</strong> — a modest cut; fine, not exciting.</li>
<li><strong>Routine sale</strong> — a small cut dressed up as a sale. We say so.</li>
</ul>
<p>The “was” price is the store's usual price, not a number invented for the sale. Where a store's list price overstates the cut — a TV that really sold for less last month — the deal's note says so.</p>
<h2>What we do not do</h2>
<p>We never invent a product, a price or a link. We never copy another site's brand, text or images. Prices move fast on Black Friday, so a deal that was live when we checked it can sell out or change — always check the store before you buy.</p>
<p><a href="#/">Back to the deals →</a></p>
</article>`;
}

export function missingView() {
  return `<h1>Not found</h1>
<p>There is no deal at this address. <a href="#/">See all deals</a>.</p>`;
}

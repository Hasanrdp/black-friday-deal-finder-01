// Deal Lantern's wiring: hash routes, the search and filter controls, and
// rendering. The deals never leave the page: filtering and sorting run here,
// in the browser, on the data in deals.js.
//
//   #/            the board, best verdict first
//   #/lows        the board with new lows only
//   #/deal/<id>   one deal, with its verdict and evidence
//   #/about       how a deal is checked
//
// window.__shotReady is false while a page renders and true once it is on
// screen, so a screenshot script knows when to capture.

import { deals, META } from "./deals.js";
import { filterDeals, sortDeals, distinctValues } from "./filters.js";
import { listView, detailView, aboutView, missingView } from "./views.js";

const app = document.getElementById("app");

const state = {
  query: "",
  category: "",
  store: "",
  minOff: 0,
  sortKey: "verdict",
  lowsOnly: false,
};

const categories = distinctValues(deals, "category");
const stores = distinctValues(deals, "store");

function renderList() {
  const shown = sortDeals(filterDeals(deals, state), state.sortKey);
  app.innerHTML = listView(deals, shown, { ...state, categories, stores }, META);
  const query = app.querySelector("#q");
  query.addEventListener("input", () => {
    state.query = query.value;
    renderList();
    const again = app.querySelector("#q");
    again.focus();
    again.setSelectionRange(again.value.length, again.value.length);
  });
  app.querySelector("#category").addEventListener("change", (event) => {
    state.category = event.target.value;
    renderList();
  });
  app.querySelector("#store").addEventListener("change", (event) => {
    state.store = event.target.value;
    renderList();
  });
  app.querySelector("#minOff").addEventListener("change", (event) => {
    state.minOff = Number(event.target.value);
    renderList();
  });
  app.querySelector("#sort").addEventListener("change", (event) => {
    state.sortKey = event.target.value;
    renderList();
  });
  app.querySelector("#lowsOnly").addEventListener("change", (event) => {
    state.lowsOnly = event.target.checked;
    renderList();
  });
}

function render() {
  window.__shotReady = false;
  const hash = location.hash || "#/";
  const dealMatch = hash.match(/^#\/deal\/([^/?]+)/);
  if (hash === "#/about") {
    document.title = "How we check a deal | Deal Lantern";
    app.innerHTML = aboutView(deals);
  } else if (dealMatch) {
    const found = deals.find((d) => d.id === decodeURIComponent(dealMatch[1]));
    document.title = `${found ? found.title : "Not found"} | Deal Lantern`;
    app.innerHTML = found ? detailView(found, deals) : missingView();
  } else {
    state.lowsOnly = hash === "#/lows";
    document.title = state.lowsOnly ? "New lows | Deal Lantern" : "Deal Lantern — Black Friday Deal Finder";
    renderList();
  }
  window.scrollTo(0, 0);
  window.__shotReady = true;
}

window.addEventListener("hashchange", render);
render();

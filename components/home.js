import { createDataProvider } from "./data-provider.js";
import { renderNav, searchText, setupNavToggle } from "./ui.js";

const provider = createDataProvider({ basePath: "data" });

initHome();

async function initHome() {
  if (document.body.dataset.page !== "home") return;
  if (!document.querySelector(".site-header .nav")) {
    document.querySelector(".site-header").insertAdjacentHTML("afterbegin", renderNav("home"));
  }
  setupNavToggle();
  const data = await provider.all();
  setText("statKillers", data.killers.length);
  setText("statSurvivors", data.survivors.length);
  setText("statPerks", data.perks.length);
  setText("statMaps", data.maps.length);
  setupSearch(data);
}

function setupSearch(data) {
  const input = document.querySelector("#siteSearch");
  const results = document.querySelector("#siteSearchResults");
  input.addEventListener("input", () => {
    const query = input.value.toLowerCase().trim();
    if (!query) {
      results.innerHTML = "";
      return;
    }
    const rows = Object.entries(data)
      .flatMap(([collection, items]) => items.map((item) => ({ ...item, collection })))
      .filter((item) => searchText(item).includes(query))
      .slice(0, 12);
    results.innerHTML = rows
      .map(
        (item) => `
          <a href="pages/${item.collection}.html">
            <span>${item.collection}</span>
            <strong>${item.nameAr || item.title || item.name}</strong>
          </a>
        `,
      )
      .join("");
  });
}

function setText(id, value) {
  const element = document.querySelector(`#${id}`);
  if (element) element.textContent = value;
}

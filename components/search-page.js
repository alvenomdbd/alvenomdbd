import { collectionLabels, collections, createDataProvider } from "./data-provider.js";
import { renderCollectionCard, renderPageHero, searchText, setupNavToggle } from "./ui.js";

const provider = createDataProvider();

initSearchPage();

async function initSearchPage() {
  if (document.body.dataset.page !== "search") return;
  document.body.insertAdjacentHTML(
    "afterbegin",
    renderPageHero({
      title: "البحث",
      subtitle: "ابحث في كل بيانات الموقع: شخصيات، بيركات، إضافات، أدوات، خرائط، أخبار، وفيديوهات.",
    }),
  );
  setupNavToggle();
  const data = await provider.all();
  const root = document.querySelector("#searchRoot");
  root.innerHTML = `
    <div class="tools page-tools">
      <input id="globalSearch" type="search" placeholder="اكتب كلمة البحث..." autofocus />
      <select id="globalCollection">
        <option value="all">كل الأقسام</option>
        ${collections.map((name) => `<option value="${name}">${collectionLabels[name]}</option>`).join("")}
      </select>
    </div>
    <div class="database-count" id="searchCount"></div>
    <div class="card-grid" id="searchGrid"></div>
  `;

  const render = () => {
    const query = document.querySelector("#globalSearch").value.toLowerCase().trim();
    const selected = document.querySelector("#globalCollection").value;
    const rows = collections
      .filter((name) => selected === "all" || selected === name)
      .flatMap((name) => data[name].map((item) => ({ ...item, __collection: name })))
      .filter((item) => !query || searchText(item).includes(query));

    document.querySelector("#searchCount").textContent = `عدد النتائج: ${rows.length}`;
    document.querySelector("#searchGrid").innerHTML = rows.map((item) => renderCollectionCard(item, item.__collection)).join("");
  };

  document.querySelector("#globalSearch").addEventListener("input", render);
  document.querySelector("#globalCollection").addEventListener("change", render);
  render();
}

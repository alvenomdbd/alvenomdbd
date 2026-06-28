import { createDataProvider } from "./data-provider.js";
import { compareBy, renderCollectionCard, renderPageHero, searchText, setupNavToggle, unique } from "./ui.js";

const provider = createDataProvider();

initCollectionPage();

async function initCollectionPage() {
  const collection = document.body.dataset.collection;
  if (!collection) return;

  document.body.insertAdjacentHTML(
    "afterbegin",
    renderPageHero({
      title: document.body.dataset.title,
      subtitle: document.body.dataset.subtitle,
    }),
  );
  setupNavToggle();

  const data = await provider.list(collection);
  const root = document.querySelector("#collectionRoot");
  const options = unique(data.flatMap((item) => [item.type, item.role, item.category, item.rarity, item.difficulty].filter(Boolean)));

  root.innerHTML = `
    <div class="tools page-tools">
      <input id="collectionSearch" type="search" placeholder="بحث..." />
      <select id="collectionFilter">
        <option value="all">الكل</option>
        ${options.map((option) => `<option value="${option}">${option}</option>`).join("")}
      </select>
      <select id="collectionSort">
        <option value="nameAr">حسب الاسم العربي</option>
        <option value="name">حسب الاسم الإنجليزي</option>
        <option value="type">حسب النوع</option>
        <option value="difficulty">حسب الصعوبة</option>
      </select>
    </div>
    <div class="database-count" id="collectionCount"></div>
    <div class="card-grid" id="collectionGrid"></div>
  `;

  const render = () => {
    const query = document.querySelector("#collectionSearch").value.toLowerCase().trim();
    const filter = document.querySelector("#collectionFilter").value;
    const sort = document.querySelector("#collectionSort").value;
    const rows = data
      .filter((item) => filter === "all" || [item.type, item.role, item.category, item.rarity, item.difficulty].includes(filter))
      .filter((item) => searchText(item).includes(query))
      .sort((a, b) => compareBy(a, b, sort));

    document.querySelector("#collectionCount").textContent = `عدد النتائج: ${rows.length}`;
    document.querySelector("#collectionGrid").innerHTML = rows.map((item) => renderCollectionCard(item, collection)).join("");
  };

  document.querySelector("#collectionSearch").addEventListener("input", render);
  document.querySelector("#collectionFilter").addEventListener("change", render);
  document.querySelector("#collectionSort").addEventListener("change", render);
  render();
}

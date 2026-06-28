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
  const typeOptions = unique(
    data.flatMap((item) =>
      [
        item.category,
        item.type,
        item.owner_or_type,
        item.role,
        item.difficulty,
        item.owner,
        item.character,
        item.chapter,
        item.realm,
        item.killer,
        item.survivor,
        ...(item.linked_characters || []),
      ].filter(Boolean),
    ),
  );
  const rarityOptions = unique(data.map((item) => item.rarity).filter(Boolean));

  root.innerHTML = `
    <div class="tools page-tools">
      <input id="collectionSearch" type="search" placeholder="بحث..." />
      <select id="typeFilter">
        <option value="all">كل الأنواع</option>
        ${typeOptions.map((option) => `<option value="${option}">${option}</option>`).join("")}
      </select>
      <select id="rarityFilter">
        <option value="all">كل الندرات</option>
        ${rarityOptions.map((option) => `<option value="${option}">${option}</option>`).join("")}
      </select>
      <select id="collectionSort">
        <option value="nameAr">حسب الاسم العربي</option>
        <option value="name">حسب الاسم الإنجليزي</option>
        <option value="category">حسب النوع</option>
        <option value="rarity">حسب الندرة</option>
        <option value="difficulty">حسب الصعوبة</option>
      </select>
    </div>
    <div class="database-count" id="collectionCount"></div>
    <div class="card-grid" id="collectionGrid"></div>
  `;

  const render = () => {
    const query = document.querySelector("#collectionSearch").value.toLowerCase().trim();
    const typeFilter = document.querySelector("#typeFilter").value;
    const rarityFilter = document.querySelector("#rarityFilter").value;
    const sort = document.querySelector("#collectionSort").value;
    const rows = data
      .filter(
        (item) =>
          typeFilter === "all" ||
          [
            item.category,
            item.type,
            item.owner_or_type,
            item.role,
            item.difficulty,
            item.owner,
            item.character,
            item.chapter,
            item.realm,
            item.killer,
            item.survivor,
            ...(item.linked_characters || []),
          ].includes(typeFilter),
      )
      .filter((item) => rarityFilter === "all" || item.rarity === rarityFilter)
      .filter((item) => searchText(item).includes(query))
      .sort((a, b) => compareBy(a, b, sort));

    document.querySelector("#collectionCount").textContent = `عدد النتائج: ${rows.length}`;
    document.querySelector("#collectionGrid").innerHTML = rows.map((item) => renderCollectionCard(item, collection)).join("");
  };

  document.querySelector("#collectionSearch").addEventListener("input", render);
  document.querySelector("#typeFilter").addEventListener("change", render);
  document.querySelector("#rarityFilter").addEventListener("change", render);
  document.querySelector("#collectionSort").addEventListener("change", render);
  root.addEventListener("click", (event) => {
    const tierButton = event.target.closest(".tier-button");
    if (!tierButton) return;
    event.preventDefault();
    const card = tierButton.closest(".perk-card");
    const tier = tierButton.dataset.tier || "III";
    card.dataset.tier = tier;
    card.classList.remove("tier-i", "tier-ii", "tier-iii");
    card.classList.add(`tier-${tier.toLowerCase()}`);
    card.querySelectorAll(".tier-button").forEach((button) => button.classList.toggle("active", button === tierButton));
  });
  render();
}

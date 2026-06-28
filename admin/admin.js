import { collectionLabels, collections, createDataProvider } from "../components/data-provider.js";
import { escapeHtml, renderPageHero, setupNavToggle } from "../components/ui.js";

const provider = createDataProvider({ basePath: "../data" });
let store = {};
let current = collections[0];
let selectedIndex = -1;

initAdmin();

async function initAdmin() {
  document.body.insertAdjacentHTML("afterbegin", renderPageHero({ title: "لوحة الإدارة", subtitle: "إدارة ملفات JSON للموقع بدون قاعدة بيانات خارجية." }));
  setupNavToggle();
  store = await provider.all();
  renderAdmin();
}

function renderAdmin() {
  const root = document.querySelector("#adminRoot");
  root.innerHTML = `
    <div class="admin-grid">
      <aside class="admin-tabs">
        ${collections.map((name) => `<button class="${name === current ? "active" : ""}" data-tab="${name}" type="button">${collectionLabels[name]}</button>`).join("")}
      </aside>
      <section class="admin-panel">
        <div class="admin-actions">
          <button class="btn primary" id="newItem" type="button">إضافة جديد</button>
          <button class="btn" id="exportJson" type="button">تصدير JSON</button>
          <button class="btn danger" id="clearLocal" type="button">حذف تعديلات المتصفح</button>
        </div>
        <div id="adminList"></div>
        <form id="adminForm" class="admin-form"></form>
      </section>
    </div>
  `;
  bindAdminEvents();
  drawList();
  drawForm();
}

function bindAdminEvents() {
  document.querySelectorAll("[data-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      current = button.dataset.tab;
      selectedIndex = -1;
      renderAdmin();
    });
  });

  document.querySelector("#newItem").addEventListener("click", () => {
    selectedIndex = -1;
    drawForm();
  });
  document.querySelector("#exportJson").addEventListener("click", () => exportJson(current));
  document.querySelector("#clearLocal").addEventListener("click", () => {
    if (!confirm("حذف تعديلات هذا القسم من المتصفح؟")) return;
    provider.clearLocal(current);
    location.reload();
  });
}

function drawList() {
  const root = document.querySelector("#adminList");
  root.innerHTML = `
    <h2>${collectionLabels[current]}</h2>
    <div class="admin-list">
      ${store[current]
        .map(
          (item, index) => `
            <div class="${index === selectedIndex ? "selected" : ""}">
              <strong>${escapeHtml(item.nameAr || item.title || item.name || item.id)}</strong>
              <span>${escapeHtml(item.name || item.type || item.date || "")}</span>
              <button type="button" data-edit="${index}">تعديل</button>
              <button type="button" data-delete="${index}">حذف</button>
            </div>
          `,
        )
        .join("")}
    </div>
  `;

  root.querySelectorAll("[data-edit]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedIndex = Number(button.dataset.edit);
      drawList();
      drawForm();
    });
  });
  root.querySelectorAll("[data-delete]").forEach((button) => {
    button.addEventListener("click", async () => {
      if (!confirm("حذف هذا العنصر؟")) return;
      store[current].splice(Number(button.dataset.delete), 1);
      await provider.saveLocal(current, store[current]);
      selectedIndex = -1;
      drawList();
      drawForm();
    });
  });
}

function drawForm() {
  const form = document.querySelector("#adminForm");
  const item = selectedIndex >= 0 ? store[current][selectedIndex] : {};
  const fields = ["id", "name", "nameAr", "title", "type", "role", "owner", "category", "difficulty", "rarity", "power", "realm", "channel", "date", "summary", "image", "url", "tags", "perks"];
  form.innerHTML = `
    <h2>${selectedIndex >= 0 ? "تعديل" : "إضافة"} ${collectionLabels[current]}</h2>
    ${fields
      .map((field) => {
        const raw = Array.isArray(item[field]) ? item[field].join(", ") : item[field] || "";
        return `
          <label>
            <span>${field}</span>
            ${field === "summary" ? `<textarea name="${field}" rows="4">${escapeHtml(raw)}</textarea>` : `<input name="${field}" value="${escapeHtml(raw)}" />`}
          </label>
        `;
      })
      .join("")}
    <button class="btn primary" type="submit">حفظ</button>
  `;

  form.onsubmit = async (event) => {
    event.preventDefault();
    const data = normalize(Object.fromEntries(new FormData(form).entries()));
    if (selectedIndex >= 0) store[current][selectedIndex] = data;
    else store[current].push(data);
    await provider.saveLocal(current, store[current]);
    selectedIndex = -1;
    drawList();
    drawForm();
  };
}

function normalize(item) {
  item.tags = split(item.tags);
  item.perks = split(item.perks);
  Object.keys(item).forEach((key) => {
    if (item[key] === "" || (Array.isArray(item[key]) && item[key].length === 0)) delete item[key];
  });
  if (!item.id) item.id = `item-${Date.now()}`;
  return item;
}

function split(value) {
  return String(value || "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function exportJson(collection) {
  const blob = new Blob([JSON.stringify(store[collection], null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${collection}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

import { createDataProvider } from "./data-provider.js";
import { escapeHtml, renderPageHero, setupNavToggle } from "./ui.js";

const provider = createDataProvider();
const state = {
  role: "Survivor",
  character: "",
  perks: ["", "", "", ""],
  item: "",
  addons: ["", ""],
  offering: "",
};

let data = {};

initBuildCreator();

async function initBuildCreator() {
  document.body.insertAdjacentHTML(
    "afterbegin",
    renderPageHero({
      title: "Build Creator",
      subtitle: "اصنع بيلد سريع من الشخصيات والبيركات والأدوات والإضافات والأوفرينغ الموجودة في الموقع.",
    }),
  );
  setupNavToggle();

  data = {
    survivors: await provider.list("survivors"),
    killers: await provider.list("killers"),
    perks: await provider.list("perks"),
    items: await provider.list("items"),
    addons: await provider.list("addons"),
    offerings: await provider.list("offerings"),
  };

  applyParams();
  ensureDefaults();
  render();
}

function render() {
  const root = document.querySelector("#buildCreatorRoot");
  root.innerHTML = `
    <section class="build-creator">
      <div class="build-panel">
        <div class="build-actions">
          <button class="btn primary" id="randomBuild" type="button">Random Build</button>
          <button class="btn" id="copyBuildLink" type="button">نسخ رابط الـ Build</button>
        </div>
        <div class="build-form">
          ${field("النوع", select("role", [["Survivor", "Survivor"], ["Killer", "Killer"]], state.role))}
          ${field("الشخصية", select("character", characterOptions(), state.character))}
          ${state.perks.map((value, index) => field(`Perk ${index + 1}`, select(`perk${index}`, perkOptions(), value))).join("")}
          ${state.role === "Survivor" ? field("Item", select("item", itemOptions(), state.item)) : ""}
          ${field("Add-on 1", select("addon0", addonOptions(), state.addons[0]))}
          ${field("Add-on 2", select("addon1", addonOptions(), state.addons[1]))}
          ${field("Offering", select("offering", offeringOptions(), state.offering))}
        </div>
        <p class="copy-status" id="copyStatus"></p>
      </div>
      <aside class="build-preview" id="buildPreview">
        ${renderPreview()}
      </aside>
    </section>
  `;

  root.querySelectorAll("select").forEach((selectElement) => {
    selectElement.addEventListener("change", () => {
      updateState(selectElement.id, selectElement.value);
      ensureRoleCompatibility();
      updateUrl();
      render();
    });
  });
  root.querySelector("#randomBuild").addEventListener("click", () => {
    randomiseBuild();
    updateUrl();
    render();
  });
  root.querySelector("#copyBuildLink").addEventListener("click", copyBuildLink);
}

function field(label, control) {
  return `<label><span>${escapeHtml(label)}</span>${control}</label>`;
}

function select(id, options, selected) {
  return `
    <select id="${escapeHtml(id)}">
      ${options.map(([value, label]) => `<option value="${escapeHtml(value)}" ${value === selected ? "selected" : ""}>${escapeHtml(label)}</option>`).join("")}
    </select>
  `;
}

function characterOptions() {
  const rows = state.role === "Survivor" ? data.survivors : data.killers;
  return rows.map((item) => [item.id, displayName(item)]);
}

function perkOptions() {
  const role = state.role;
  const filtered = data.perks.filter((perk) => {
    const type = String(perk.perk_type || perk.type || "");
    return type === role || type === "General" || !type;
  });
  const rows = filtered.length ? filtered : data.perks;
  return rows.map((item) => [item.id, displayName(item)]);
}

function itemOptions() {
  return [["", "بدون أداة"], ...data.items.map((item) => [item.id, displayName(item)])];
}

function addonOptions() {
  const selectedItem = findById(data.items, state.item);
  const itemType = selectedItem?.category || selectedItem?.type || selectedItem?.name_en || "";
  const rows = data.addons.filter((addon) => {
    const type = String(addon.type || addon.owner_or_type || addon.category || "");
    if (state.role === "Killer") return type === "Killer Add-on";
    if (!itemType) return type !== "Killer Add-on";
    return type.toLowerCase().includes(itemType.toLowerCase()) || String(addon.owner || "").toLowerCase().includes(itemType.toLowerCase());
  });
  const fallback = state.role === "Killer" ? data.addons.filter((addon) => addon.type === "Killer Add-on") : data.addons.filter((addon) => addon.type !== "Killer Add-on");
  return [["", "بدون إضافة"], ...(rows.length ? rows : fallback).map((item) => [item.id, `${displayName(item)} - ${item.rarity || ""}`])];
}

function offeringOptions() {
  return [["", "بدون أوفرينغ"], ...data.offerings.map((item) => [item.id, displayName(item)])];
}

function renderPreview() {
  const character = findById(state.role === "Survivor" ? data.survivors : data.killers, state.character);
  const perks = state.perks.map((id) => findById(data.perks, id));
  const item = state.role === "Survivor" ? findById(data.items, state.item) : null;
  const addons = state.addons.map((id) => findById(data.addons, id));
  const offering = findById(data.offerings, state.offering);

  return `
    <div class="preview-character">
      ${image(character, "صورة الشخصية")}
      <div>
        <span>${escapeHtml(state.role)}</span>
        <h2>${escapeHtml(displayName(character) || "اختر شخصية")}</h2>
      </div>
    </div>
    <div class="preview-grid preview-perks">
      ${perks.map((perk, index) => previewSlot(perk, `Perk ${index + 1}`)).join("")}
    </div>
    <div class="preview-grid preview-equipment">
      ${state.role === "Survivor" ? previewSlot(item, "Item") : previewSlot(null, "Item")}
      ${addons.map((addon, index) => previewSlot(addon, `Add-on ${index + 1}`)).join("")}
      ${previewSlot(offering, "Offering")}
    </div>
  `;
}

function previewSlot(item, label) {
  return `
    <article class="preview-slot">
      ${image(item, label)}
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(displayName(item) || "غير محدد")}</strong>
    </article>
  `;
}

function image(item, alt) {
  const src = item?.image || "/images/dbd-hero.png";
  return `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" loading="lazy" onerror="this.src='/images/dbd-hero.png'" />`;
}

function updateState(id, value) {
  if (id === "role") {
    state.role = value;
    state.character = "";
    state.perks = ["", "", "", ""];
    state.item = "";
    state.addons = ["", ""];
    return;
  }
  if (id === "character") state.character = value;
  if (id.startsWith("perk")) state.perks[Number(id.replace("perk", ""))] = value;
  if (id === "item") {
    state.item = value;
    state.addons = ["", ""];
  }
  if (id.startsWith("addon")) state.addons[Number(id.replace("addon", ""))] = value;
  if (id === "offering") state.offering = value;
}

function ensureDefaults() {
  if (!state.character) state.character = firstId(state.role === "Survivor" ? data.survivors : data.killers);
  const perkIds = perkOptions().map(([id]) => id);
  state.perks = state.perks.map((id, index) => (perkIds.includes(id) ? id : perkIds[index] || ""));
  if (state.role === "Survivor" && !state.item) state.item = firstId(data.items);
  const addonIds = addonOptions().map(([id]) => id).filter(Boolean);
  state.addons = state.addons.map((id, index) => (addonIds.includes(id) ? id : addonIds[index] || ""));
  if (!state.offering) state.offering = firstId(data.offerings);
}

function ensureRoleCompatibility() {
  const characterIds = characterOptions().map(([id]) => id);
  if (!characterIds.includes(state.character)) state.character = firstId(state.role === "Survivor" ? data.survivors : data.killers);
  const perkIds = perkOptions().map(([id]) => id);
  state.perks = state.perks.map((id, index) => (perkIds.includes(id) ? id : perkIds[index] || ""));
  if (state.role === "Killer") state.item = "";
  const addonIds = addonOptions().map(([id]) => id);
  state.addons = state.addons.map((id, index) => (addonIds.includes(id) ? id : addonIds[index + 1] || ""));
}

function randomiseBuild() {
  const characters = state.role === "Survivor" ? data.survivors : data.killers;
  state.character = pick(characters)?.id || "";
  const perks = shuffle(perkOptions().map(([id]) => id)).slice(0, 4);
  state.perks = [perks[0] || "", perks[1] || "", perks[2] || "", perks[3] || ""];
  state.item = state.role === "Survivor" ? pick(data.items)?.id || "" : "";
  const addons = shuffle(addonOptions().map(([id]) => id).filter(Boolean)).slice(0, 2);
  state.addons = [addons[0] || "", addons[1] || ""];
  state.offering = pick(data.offerings)?.id || "";
}

function applyParams() {
  const params = new URLSearchParams(location.search);
  state.role = params.get("role") === "Killer" ? "Killer" : "Survivor";
  state.character = params.get("character") || "";
  state.perks = [params.get("p1") || "", params.get("p2") || "", params.get("p3") || "", params.get("p4") || ""];
  state.item = params.get("item") || "";
  state.addons = [params.get("a1") || "", params.get("a2") || ""];
  state.offering = params.get("offering") || "";
}

function updateUrl() {
  history.replaceState(null, "", buildUrl());
}

function buildUrl() {
  const params = new URLSearchParams();
  params.set("role", state.role);
  params.set("character", state.character);
  state.perks.forEach((id, index) => id && params.set(`p${index + 1}`, id));
  if (state.item) params.set("item", state.item);
  state.addons.forEach((id, index) => id && params.set(`a${index + 1}`, id));
  if (state.offering) params.set("offering", state.offering);
  return `${location.origin}${location.pathname}?${params.toString()}`;
}

async function copyBuildLink() {
  const url = buildUrl();
  const status = document.querySelector("#copyStatus");
  try {
    await navigator.clipboard.writeText(url);
    status.textContent = "تم نسخ رابط الـ Build.";
  } catch {
    status.textContent = url;
  }
}

function firstId(rows) {
  return rows?.[0]?.id || "";
}

function findById(rows, id) {
  return rows.find((item) => item.id === id);
}

function displayName(item) {
  return item?.name_ar || item?.nameAr || item?.title || item?.name || item?.name_en || "";
}

function pick(rows) {
  if (!rows.length) return null;
  return rows[Math.floor(Math.random() * rows.length)];
}

function shuffle(rows) {
  return [...rows].sort(() => Math.random() - 0.5);
}

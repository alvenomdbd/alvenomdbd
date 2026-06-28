import { collectionLabels, collections } from "./data-provider.js";

export function renderNav(active = "") {
  const links = [
    ["/", "الرئيسية", "home"],
    ["/pages/dbd.html", "Dead by Daylight", "dbd"],
    ["/pages/killers.html", "القتلة", "killers"],
    ["/pages/survivors.html", "الناجون", "survivors"],
    ["/pages/perks.html", "البيركات", "perks"],
    ["/pages/items.html", "الأدوات", "items"],
    ["/pages/addons.html", "الإضافات", "addons"],
    ["/pages/offerings.html", "الأوفرنغز", "offerings"],
    ["/pages/maps.html", "الخرائط", "maps"],
    ["/pages/news.html", "الأخبار", "news"],
    ["/pages/videos.html", "YouTube", "videos"],
    ["/pages/search.html", "البحث", "search"],
    ["/admin/", "Admin", "admin"],
  ];

  return `
    <nav class="nav">
      <a class="brand" href="/">ALVenomDBD</a>
      <button class="nav-toggle" type="button" aria-label="فتح القائمة">☰</button>
      <div class="nav-links">
        ${links.map(([href, label, key]) => `<a class="${active === key ? "active" : ""}" href="${href}">${label}</a>`).join("")}
      </div>
    </nav>
  `;
}

export function setupNavToggle() {
  document.addEventListener("click", (event) => {
    if (!event.target.matches(".nav-toggle")) return;
    document.querySelector(".nav-links")?.classList.toggle("open");
  });
}

export function renderPageHero({ eyebrow = "ALVenomDBD", title, subtitle }) {
  return `
    <header class="page-header">
      ${renderNav(document.body.dataset.collection || document.body.dataset.page)}
      <section class="page-title">
        <p class="eyebrow">${escapeHtml(eyebrow)}</p>
        <h1>${escapeHtml(title)}</h1>
        <p>${escapeHtml(subtitle || "")}</p>
      </section>
    </header>
  `;
}

export function renderCollectionCard(item, collection) {
  const image = item.image || fallbackImage(collection);
  const title = item.name_ar || item.nameAr || item.title || item.name || item.name_en || item.id;
  const english = item.name_en || item.name || "";
  const effect = item.effect_ar || "";
  const description = item.description_ar || item.summary || "";
  const detailHref = `/pages/detail.html?collection=${encodeURIComponent(collection)}&id=${encodeURIComponent(item.id)}`;
  const meta = [item.rarity, item.category, item.owner_or_type, item.type, item.role, item.difficulty, item.owner, item.realm, item.channel]
    .filter(Boolean)
    .join(" - ");
  const url = item.url ? `<a class="text-link" href="${escapeAttr(item.url)}" target="_blank" rel="noreferrer">فتح الرابط</a>` : "";
  return `
    <article class="content-card">
      <a class="card-link" href="${escapeAttr(detailHref)}" aria-label="${escapeAttr(title)}">
      <img src="${escapeAttr(image)}" alt="${escapeAttr(title)}" loading="lazy" />
      <span>${escapeHtml(meta || collectionLabels[collection] || collection)}</span>
      <h2>${escapeHtml(title)}</h2>
      ${english ? `<strong class="card-en">${escapeHtml(english)}</strong>` : ""}
      <p>${escapeHtml(description)}</p>
      ${effect ? `<p class="effect-text">${escapeHtml(effect)}</p>` : ""}
      ${renderTags(item)}
      </a>
      ${url}
    </article>
  `;
}

export function renderTags(item) {
  const tags = [...(item.tags || []), ...(item.perks || [])].filter(Boolean);
  if (!tags.length) return "";
  return `<div class="pill-list">${tags.map((tag) => `<em>${escapeHtml(tag)}</em>`).join("")}</div>`;
}

export function fallbackImage(collection) {
  if (collection === "killers") return "/images/killer.svg";
  if (collection === "survivors") return "/images/survivor.svg";
  if (collection === "perks") return "/images/perk-survivor.svg";
  if (collection === "addons") return "/images/equipment-killer-addon.svg";
  if (collection === "items") return "/images/equipment-item.svg";
  if (collection === "offerings") return "/images/equipment-offering.svg";
  return "/images/dbd-hero.png";
}

export function searchText(item) {
  return Object.values(item).flat().join(" ").toLowerCase();
}

export function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

export function compareBy(a, b, key) {
  const av = String(a[key] || a.nameAr || a.title || a.name || "");
  const bv = String(b[key] || b.nameAr || b.title || b.name || "");
  return av.localeCompare(bv, "ar", { sensitivity: "base" });
}

export function allCollectionLinks() {
  return collections.map((collection) => ({
    collection,
    label: collectionLabels[collection],
    href: `/pages/${collection}.html`,
  }));
}

export function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function escapeAttr(value) {
  return escapeHtml(value);
}

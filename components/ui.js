import { collectionLabels, collections } from "./data-provider.js";

export function renderNav(active = "") {
  const encyclopediaLinks = [
    ["/pages/killers.html", "القتلة", "killers"],
    ["/pages/survivors.html", "الناجون", "survivors"],
    ["/pages/perks.html", "البيركات", "perks"],
    ["/pages/items.html", "الأدوات", "items"],
    ["/pages/addons.html", "الإضافات", "addons"],
    ["/pages/offerings.html", "الأوفرينغ", "offerings"],
    ["/pages/maps.html", "الخرائط", "maps"],
  ];
  const isEncyclopediaActive = ["dbd", ...encyclopediaLinks.map(([, , key]) => key)].includes(active);

  return `
    <nav class="nav">
      <a class="brand" href="/">ALVenomDBD</a>
      <button class="nav-toggle" type="button" aria-label="فتح القائمة" aria-expanded="false">☰</button>
      <div class="nav-links">
        <a class="${active === "home" ? "active" : ""}" href="/">الرئيسية</a>
        <div class="nav-dropdown ${isEncyclopediaActive ? "active" : ""}">
          <button class="nav-dropdown-toggle" type="button" aria-expanded="false">الموسوعة <span>▼</span></button>
          <div class="nav-dropdown-menu">
            <a class="${active === "dbd" ? "active" : ""}" href="/pages/dbd.html">Dead by Daylight</a>
            ${encyclopediaLinks.map(([href, label, key]) => `<a class="${active === key ? "active" : ""}" href="${href}">${label}</a>`).join("")}
          </div>
        </div>
        <a class="${active === "news" ? "active" : ""}" href="/pages/news.html">الأخبار</a>
        <a class="${active === "videos" ? "active" : ""}" href="/pages/videos.html">YouTube</a>
        <a class="${active === "search" ? "active" : ""}" href="/pages/search.html">البحث</a>
        <a class="${active === "admin" ? "active" : ""}" href="/admin/">Admin</a>
      </div>
    </nav>
  `;
}

export function setupNavToggle() {
  document.addEventListener("click", (event) => {
    const navToggle = event.target.closest(".nav-toggle");
    const dropdownToggle = event.target.closest(".nav-dropdown-toggle");

    if (navToggle) {
      const navLinks = document.querySelector(".nav-links");
      const isOpen = navLinks?.classList.toggle("open") || false;
      navToggle.setAttribute("aria-expanded", String(isOpen));
      return;
    }

    if (dropdownToggle) {
      const dropdown = dropdownToggle.closest(".nav-dropdown");
      const isOpen = dropdown?.classList.toggle("open") || false;
      dropdownToggle.setAttribute("aria-expanded", String(isOpen));
      return;
    }

    if (!event.target.closest(".nav")) {
      document.querySelector(".nav-links")?.classList.remove("open");
      document.querySelector(".nav-toggle")?.setAttribute("aria-expanded", "false");
      document.querySelectorAll(".nav-dropdown.open").forEach((dropdown) => dropdown.classList.remove("open"));
      document.querySelectorAll(".nav-dropdown-toggle").forEach((button) => button.setAttribute("aria-expanded", "false"));
    }
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

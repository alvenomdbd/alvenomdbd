import { collectionLabels, createDataProvider } from "./data-provider.js";
import { escapeHtml, renderPageHero, renderTags, setupNavToggle } from "./ui.js";

const provider = createDataProvider();

initDetailPage();

async function initDetailPage() {
  const params = new URLSearchParams(location.search);
  const collection = params.get("collection");
  const id = params.get("id");
  document.body.insertAdjacentHTML(
    "afterbegin",
    renderPageHero({
      title: "التفاصيل",
      subtitle: "صفحة تفاصيل العنصر المحدد داخل قاعدة ALVenomDBD.",
    }),
  );
  setupNavToggle();

  const root = document.querySelector("#detailRoot");
  if (!collection || !id) {
    root.innerHTML = `<section class="info-panel"><h2>العنصر غير موجود</h2><p>الرابط ناقص بيانات المجموعة أو المعرف.</p></section>`;
    return;
  }

  const rows = await provider.list(collection);
  const item = rows.find((entry) => entry.id === id);
  if (!item) {
    root.innerHTML = `<section class="info-panel"><h2>العنصر غير موجود</h2><p>لم يتم العثور على هذا العنصر داخل ${escapeHtml(collection)}.</p></section>`;
    return;
  }

  document.title = `${item.name_ar || item.nameAr || item.name_en || item.name || item.id} - ALVenomDBD`;
  root.innerHTML = renderDetail(item, collection);
}

function renderDetail(item, collection) {
  const title = item.name_ar || item.nameAr || item.name_en || item.name || item.id;
  const english = item.name_en || item.name || "";
  const detailClass = collection === "perks" ? "perk-detail" : collection === "addons" ? `addon-detail rarity-${slugClass(item.rarity)}` : "";
  const fields = [
    ["القسم", collectionLabels[collection] || collection],
    ["الاسم الإنجليزي", english],
    [collection === "perks" ? "صاحب البيرك" : "يتبع لأي Killer أو Item", item.character || item.owner],
    ["النوع", item.perk_type || item.addon_type || item.type || item.category || item.role],
    ["الندرة", item.rarity],
    ["الفصل", item.chapter],
    ["Realm", item.realm],
    ["المالك / النوع", item.owner_or_type],
    ["تاريخ الإضافة", item.release_date],
  ].filter(([, value]) => value);

  return `
    <article class="detail-layout ${detailClass}">
      <aside class="detail-media">
        <img src="${escapeHtml(item.image || "")}" alt="${escapeHtml(title)}" />
      </aside>
      <section class="detail-copy">
        <span>${escapeHtml(collectionLabels[collection] || collection)}</span>
        <h1>${escapeHtml(title)}</h1>
        ${english ? `<strong class="card-en">${escapeHtml(english)}</strong>` : ""}
        <div class="detail-facts">
          ${fields.map(([label, value]) => `<div><b>${escapeHtml(label)}</b><em>${escapeHtml(value)}</em></div>`).join("")}
        </div>
        ${collection === "perks" ? renderPerkDetail(item) : collection === "addons" ? renderAddonDetail(item) : renderGenericDetail(item)}
        ${block("سجل التعديلات", arrayText(item.patch_history))}
        ${block("نصائح للكيلر", arrayText(item.killer_tips))}
        ${block("نصائح للسيرفايفر", arrayText(item.survivor_tips))}
        ${renderTags(item)}
      </section>
    </article>
  `;
}

function renderPerkDetail(item) {
  return `
    ${block("الوصف الرسمي", item.official_description_ar || item.official_description || item.description || item.summary)}
    ${block("شرح عربي مفصل", item.description_ar || item.arabic_guide || item.summary)}
    ${tierBlocks(item.tier_effects || item.tiers)}
    ${block("أفضل الكومبوهات", arrayText(item.best_combos || item.best_build))}
    ${block("البيركات المشابهة", arrayText(item.similar_perks || item.synergies))}
    ${block("مميزات البيرك", arrayText(item.strengths))}
    ${block("عيوب البيرك", arrayText(item.weaknesses))}
    ${block("القيم الرقمية", arrayText(item.numeric_values || item.values))}
  `;
}

function renderAddonDetail(item) {
  return `
    ${block("التأثير الرسمي", item.official_effect || item.official_description || item.effect_ar)}
    ${block("شرح عربي مفصل", item.description_ar || item.arabic_guide || item.summary)}
    ${block("أفضل الكومبوهات", arrayText(item.best_combos))}
    ${block("أفضل Builds يستخدم معها", arrayText(item.best_builds))}
    ${block("المميزات", arrayText(item.strengths))}
    ${block("العيوب", arrayText(item.weaknesses))}
    ${block("القيم الرقمية", arrayText(item.numeric_values || item.values))}
  `;
}

function renderGenericDetail(item) {
  return `
    ${block("الوصف الرسمي / المختصر", item.official_description_ar || item.official_description || item.description || item.summary)}
    ${block("شرح عربي مفصل", item.description_ar || item.arabic_guide || item.summary)}
    ${block("التأثير داخل القيم", item.effect_ar)}
    ${block("القيم الرقمية", arrayText(item.numeric_values || item.values))}
    ${block("Tier I / Tier II / Tier III", tierText(item.tiers))}
    ${block("أمثلة على الاستخدام", arrayText(item.usage_examples))}
    ${block("أفضل Build", arrayText(item.best_build))}
    ${block("يتوافق مع", arrayText(item.synergies))}
  `;
}

function block(title, value) {
  if (!value) return "";
  return `
    <section class="detail-block">
      <h2>${escapeHtml(title)}</h2>
      <p>${escapeHtml(value)}</p>
    </section>
  `;
}

function tierBlocks(tiers) {
  if (!tiers || typeof tiers !== "object") return "";
  return ["I", "II", "III"]
    .map((tier) => (tiers[tier] ? `<section class="detail-block tier-detail tier-${tier.toLowerCase()}"><h2>تأثير Tier ${tier}</h2><p>${escapeHtml(tiers[tier])}</p></section>` : ""))
    .join("");
}

function arrayText(value) {
  if (!value) return "";
  if (Array.isArray(value)) return value.filter(Boolean).join(" | ");
  if (typeof value === "object") return Object.entries(value).map(([key, val]) => `${key}: ${val}`).join(" | ");
  return value;
}

function tierText(value) {
  if (!value) return "";
  if (Array.isArray(value)) return value.join(" / ");
  if (typeof value === "object") return Object.entries(value).map(([key, val]) => `${key}: ${val}`).join(" / ");
  return value;
}

function slugClass(value) {
  return String(value || "unknown")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

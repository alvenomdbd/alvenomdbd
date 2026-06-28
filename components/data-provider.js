export const collections = ["killers", "survivors", "perks", "items", "addons", "offerings", "maps", "news", "videos"];

export const collectionLabels = {
  killers: "القتلة",
  survivors: "الناجون",
  perks: "البيركات",
  items: "الأدوات",
  addons: "الإضافات",
  offerings: "الأوفرنغز",
  maps: "الخرائط",
  news: "الأخبار",
  videos: "فيديوهات YouTube",
};

export class JsonDataProvider {
  constructor({ basePath = "../data" } = {}) {
    this.basePath = basePath;
    this.cache = new Map();
  }

  async list(collection) {
    if (this.cache.has(collection)) return this.cache.get(collection);
    const local = localStorage.getItem(storageKey(collection));
    if (local) {
      const parsed = JSON.parse(local);
      this.cache.set(collection, parsed);
      return parsed;
    }
    const response = await fetch(`${this.basePath}/${collection}.json`, { cache: "no-store" });
    if (!response.ok) throw new Error(`تعذر تحميل ${collection}`);
    const data = await response.json();
    this.cache.set(collection, data);
    return data;
  }

  async all() {
    const entries = await Promise.all(collections.map(async (name) => [name, await this.list(name)]));
    return Object.fromEntries(entries);
  }

  async saveLocal(collection, data) {
    localStorage.setItem(storageKey(collection), JSON.stringify(data, null, 2));
    this.cache.set(collection, data);
  }

  clearLocal(collection) {
    localStorage.removeItem(storageKey(collection));
    this.cache.delete(collection);
  }
}

// Future adapter seam: implement the same list/all/saveLocal methods using Supabase or Firebase.
export class RemoteDataProvider extends JsonDataProvider {}

export function storageKey(collection) {
  return `alvenomdbd:${collection}`;
}

export function createDataProvider(options = {}) {
  return new JsonDataProvider(options);
}

# ALVenomDBD

موقع عربي RTL ثابت للعبة Dead by Daylight، منظم ليكون قابلًا للتوسع والنقل لاحقًا إلى Supabase أو Firebase.

## الهيكل

```text
outputs/
  index.html
  data/
    killers.json
    survivors.json
    perks.json
    addons.json
    items.json
    maps.json
    news.json
    videos.json
  pages/
    dbd.html
    killers.html
    survivors.html
    perks.html
    addons.html
    items.html
    maps.html
    news.html
    videos.html
    search.html
  components/
    data-provider.js
    ui.js
    collection-page.js
    search-page.js
    home.js
  admin/
    index.html
    admin.js
  styles/
    main.css
  images/
    ...
```

## التشغيل المحلي

يفضل تشغيله بسيرفر محلي لأن الصفحات تقرأ JSON:

```bash
npx serve outputs
```

ثم افتح الرابط المحلي.

## النشر على Netlify

ارفع محتويات مجلد `outputs` على Netlify.

المسارات الجاهزة:

- `/`
- `/admin`
- `/perks`
- `/killers`
- `/survivors`
- `/addons`
- `/items`
- `/maps`
- `/news`
- `/videos`
- `/search`

## تعديل البيانات

كل قسم له ملف JSON مستقل داخل `data/`.

مثال إضافة بيرك داخل `data/perks.json`:

```json
{
  "id": "example",
  "name": "Example Perk",
  "nameAr": "بيرك مثال",
  "type": "Survivor",
  "owner": "Dwight Fairfield",
  "category": "Information",
  "summary": "شرح عربي مختصر.",
  "image": "/images/perk-survivor.svg",
  "tags": ["info", "beginner"]
}
```

## لوحة الإدارة

افتح `/admin`.

لوحة الإدارة:

- تقرأ ملفات JSON.
- تضيف وتعدل وتحذف محليًا داخل المتصفح.
- تصدر ملف JSON جاهزًا.

مهم: لأن الموقع ثابت ولا يستخدم قاعدة بيانات خارجية، المتصفح لا يستطيع الكتابة مباشرة داخل ملفات المشروع على Netlify. بعد التصدير:

1. استبدل ملف JSON المناسب داخل `data/`.
2. أعد رفع الموقع على Netlify.

## جاهزية Supabase/Firebase

كل الصفحات تستخدم `components/data-provider.js`.

عند الانتقال لاحقًا إلى Supabase أو Firebase، أنشئ Provider جديدًا بنفس الواجهة:

- `list(collection)`
- `all()`
- `saveLocal(collection, data)` أو `save(collection, data)`

ثم استبدل `createDataProvider` بدون إعادة بناء الصفحات.

# ALVenomDBD

موقع عربي RTL ثابت للعبة Dead by Daylight، منظم حتى يكون قابلًا للتوسع والنقل لاحقًا إلى Supabase أو Firebase.

## الهيكل

```text
index.html
data/
  killers.json
  survivors.json
  perks.json
  items.json
  addons.json
  offerings.json
  maps.json
  news.json
  videos.json
pages/
  dbd.html
  killers.html
  survivors.html
  perks.html
  items.html
  addons.html
  offerings.html
  maps.html
  news.html
  videos.html
  search.html
components/
admin/
styles/
images/
  items/
  addons/
  offerings/
  survivors/
```

## التشغيل المحلي

يفضل تشغيل الموقع بسيرفر محلي لأن الصفحات تقرأ ملفات JSON:

```bash
npx serve .
```

## النشر على Netlify

اربط المستودع مباشرة مع Netlify، واجعل مجلد النشر هو جذر المشروع.

المسارات الجاهزة:

- `/`
- `/admin`
- `/perks`
- `/killers`
- `/survivors`
- `/items`
- `/addons`
- `/offerings`
- `/maps`
- `/news`
- `/videos`
- `/search`

## تعديل البيانات

كل قسم له ملف JSON مستقل داخل `data/`.

معدات اللعبة مقسمة الآن إلى:

- `data/items.json`
- `data/addons.json`
- `data/offerings.json`

وصورها داخل:

- `images/items/`
- `images/addons/`
- `images/offerings/`

## لوحة الإدارة

افتح `/admin`.

لوحة الإدارة تقرأ ملفات JSON وتسمح بتعديل نسخة محلية داخل المتصفح ثم تصدير JSON. لأن الموقع ثابت على Netlify، المتصفح لا يستطيع الكتابة مباشرة داخل ملفات المشروع على GitHub.

## جاهزية Supabase/Firebase

كل الصفحات تستخدم `components/data-provider.js`.

عند الانتقال لاحقًا إلى Supabase أو Firebase، أنشئ Provider جديدًا بنفس الواجهة:

- `list(collection)`
- `all()`
- `saveLocal(collection, data)` أو `save(collection, data)`

ثم استبدل `createDataProvider` بدون إعادة بناء الصفحات.

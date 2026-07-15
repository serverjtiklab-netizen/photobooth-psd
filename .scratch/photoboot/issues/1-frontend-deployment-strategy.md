---
labels: ["wayfinder:grilling"]
---
Status: resolved

## Question

Should the Vue frontend be built and served statically by the Express backend in production, or should we keep them fully separate and use the Vue dev server during development, maybe wrapping it in its own Nginx container for production?

## Answer

**Disatukan (Monolitik)**. Kita akan me-build aplikasi Vue (HTML/CSS/JS statis) dan menyajikannya dari dalam container Express (menggunakan `express.static`). Ini mengurangi jumlah container menjadi 2 (Node dan MySQL) sehingga lebih simpel dan cepat.

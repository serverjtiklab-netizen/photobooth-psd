---
labels: ["wayfinder:map"]
---

## Destination

MVP of a Dockerized Vue+Express Photobooth App with Camera access, simple CSS filters, image snapshotting, local container storage, and a MySQL database for metadata.

## Notes

- **Tech Stack**: Vue.js (Frontend), Express.js (Backend), MySQL (Database).
- **Architecture**: Docker-compose wrapping backend (Express) and db (MySQL) services.
- **Storage**: Image files saved in the Express container's local file system (using volumes), metadata (e.g., file path, timestamp) stored in MySQL.
- **Filters**: Simple CSS color filters on the frontend.
- **Auth**: No authentication required.

## Decisions so far

- [issues/3-camera-library.md](file:///home/iyede/code/___psd___/photoboot/issues/3-camera-library.md) — Gunakan API native HTML5 `navigator.mediaDevices.getUserMedia` dengan bantuan VueUse `@vueuse/core`.
- [1-frontend-deployment-strategy.md](file:///home/iyede/code/___psd___/photoboot/.scratch/photoboot/issues/1-frontend-deployment-strategy.md) — Frontend Vue akan di-build statis dan disajikan langsung dari container Express.
- [2-database-schema.md](file:///home/iyede/code/___psd___/photoboot/.scratch/photoboot/issues/2-database-schema.md) — Schema MySQL menggunakan tabel `photos` sederhana dengan kolom filename, filepath, filter_used, dan created_at (prototype disimpan di database/init.sql).

## Not yet specified

*(kosong, peta jalan sudah jelas)*

## Out of scope

- Advanced AR face-tracking filters.
- User authentication and login.
- Cloud object storage (S3) integration.

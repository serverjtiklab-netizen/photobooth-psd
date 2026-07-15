---
labels: ["wayfinder:prototype"]
---
Status: resolved

## Question

What is the exact MySQL schema for storing the image metadata? We need to prototype a quick init.sql script.

## Answer

Disepakati menggunakan schema berikut untuk MVP (disimpan di `database/init.sql`):

```sql
CREATE DATABASE IF NOT EXISTS photobooth_db;
USE photobooth_db;

CREATE TABLE IF NOT EXISTS photos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    filepath VARCHAR(512) NOT NULL,
    filter_used VARCHAR(50) DEFAULT 'none',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

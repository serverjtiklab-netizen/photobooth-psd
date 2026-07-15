const express = require('express');
const mysql = require('mysql2/promise');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Setup storage directory for photos
const storagePath = path.join(__dirname, 'uploads');
if (!fs.existsSync(storagePath)) {
    fs.mkdirSync(storagePath, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, storagePath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'photo-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// MySQL Connection Pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'db',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'photobooth_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Serve frontend static files
app.use(express.static(path.join(__dirname, 'public')));
// Serve uploaded photos
app.use('/uploads', express.static(storagePath));

// API endpoint to upload a photo
app.post('/api/photos', upload.single('photo'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No photo uploaded.' });
        }

        const filename = req.file.filename;
        const filepath = `/uploads/${filename}`;
        const filterUsed = req.body.filter || 'none';

        // Save metadata to database
        const [result] = await pool.execute(
            'INSERT INTO photos (filename, filepath, filter_used) VALUES (?, ?, ?)',
            [filename, filepath, filterUsed]
        );

        res.status(201).json({
            message: 'Photo saved successfully',
            photoId: result.insertId,
            filepath: filepath,
            filter_used: filterUsed
        });
    } catch (error) {
        console.error('Error saving photo:', error);
        res.status(500).json({ error: 'Failed to save photo' });
    }
});

// API endpoint to get all photos
app.get('/api/photos', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM photos ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching photos:', error);
        res.status(500).json({ error: 'Failed to fetch photos' });
    }
});

// Fallback to index.html for Vue SPA routing
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Express server running on port ${port}`);
});

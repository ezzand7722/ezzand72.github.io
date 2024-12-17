const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Endpoint to process sheet music
app.post('/api/process-sheet-music', upload.single('sheet_music'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        console.log('Processing file:', req.file.path);

        // For testing, return some sample notes
        const sampleNotes = [
            { pitch: 'C4', duration: '4n', time: 0, velocity: 0.7 },
            { pitch: 'E4', duration: '4n', time: 0.5, velocity: 0.7 },
            { pitch: 'G4', duration: '4n', time: 1, velocity: 0.7 },
            { pitch: 'C5', duration: '2n', time: 1.5, velocity: 0.7 }
        ];

        res.json({ notes: sampleNotes });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 
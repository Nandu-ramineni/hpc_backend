import express from 'express';
import cors from 'cors';
import multer from 'multer';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

const app = express();
dotenv.config();
app.use(cors());
app.use(bodyParser.json({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));

const port = 8000;
const USERNAME = process.env.DB_USERNAME;
const PASSWORD = process.env.DB_PASSWORD;

mongoose.connect(`mongodb+srv://${USERNAME}:${PASSWORD}@file.hng0fkz.mongodb.net/?retryWrites=true&w=majority&appName=file`);
const conn = mongoose.connection;

conn.once('open', () => {
    console.log('Connected to MongoDB Atlas');
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

const fileSchema = new mongoose.Schema({
    filename: String,
    contentType: String,
    uploadDate: Date,
    data: Buffer,  
});
const File = mongoose.model('File', fileSchema);

app.post('/upload', upload.single('file'), (req, res) => {
    if (req.file) {
        const file = new File({
            filename: req.file.originalname,
            contentType: req.file.mimetype,
            data: req.file.buffer,
            uploadDate: new Date(),
        });
        file.save().then((savedFile) => {
            const fileData = {
                id: savedFile._id,
                filename: savedFile.filename,
                contentType: savedFile.contentType,
                uploadDate: savedFile.uploadDate,
            };
            if (req.body.lat && req.body.lon) {
                res.json({
                    message: 'File uploaded successfully with location data.',
                    file: fileData,
                    location: {
                        lat: req.body.lat,
                        lon: req.body.lon,
                    },
                });
            } else {
                res.json({
                    message: 'File uploaded successfully.',
                    file: fileData,
                });
            }
        }).catch((error) => {
            console.error('Error uploading file:', error);
            res.status(500).send('Error uploading file.');
        });
    } else {
        if (req.body.lat && req.body.lon) {
            res.json({
                message: 'Location data received.',
                location: {
                    lat: req.body.lat,
                    lon: req.body.lon,
                },
            });
        } else {
            res.status(400).send('No file or location data uploaded.');
        }
    }
});

app.get('/file/:id', async (req, res) => {
    try {
        const fileId = req.params.id;
        const file = await File.findById(fileId);
        if (!file) {
            return res.status(404).send('File not found.');
        }
        res.set('Content-Type', file.contentType);
        res.send(file.data);
    } catch (err) {
        console.error('Error fetching file:', err);
        res.status(500).send('Error fetching file.');
    }
});


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

app.get('/', (req, res) => {
    res.send('Hello World');
});

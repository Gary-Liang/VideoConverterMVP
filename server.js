const express = require('express');
const multer = require('multer');
const path = require('path');
const { exec } = require('child_process');
const cors = require('cors');
const ffmpeg = require('ffmpeg-static');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const app = express();
app.use(cors());

// Configure AWS S3 Client (v3)
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Configure multer for file uploads (temporary local storage)
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

// Serve static files (for health check)
app.use(express.static('public'));

// Ensure temporary directories exist
require('fs').mkdirSync('uploads', { recursive: true });
require('fs').mkdirSync('converted', { recursive: true });

// Health check endpoint
app.get('/health', (req, res) => res.send('OK'));

// Convert endpoint
app.post('/convert', (req, res) => {
  upload.single('video')(req, res, async (err) => {
    if (err) return res.status(400).send('File upload failed: ' + err.message);
    if (!req.file) return res.status(400).send('No file uploaded');
    if (req.file.size > 100 * 1024 * 1024) return res.status(400).send('File too large, max 100MB');

    const inputVideo = req.file.path;
    const outputVideo = `converted_${Date.now()}.mp4`;
    const outputPath = path.join(__dirname, 'converted', outputVideo);

    // Get user settings from query params (default to 30s, 720p)
    const duration = parseInt(req.query.duration) || 30;
    const resolution = req.query.resolution === '1080p' ? '1080:1920' : '720:1280';

    // FFmpeg command with user settings
    const command = `${ffmpeg} -i "${inputVideo}" -t ${duration} -vf "scale=${resolution}:force_original_aspect_ratio=decrease,pad=${resolution}:(ow-iw)/2:(oh-ih)/2" -c:v libx264 -c:a aac "${outputPath}"`;

    exec(command, async (error) => {
      if (error) {
        console.error('FFmpeg error:', error);
        return res.status(500).send('Conversion failed');
      }

      // Upload converted file to S3 using v3
      const fileContent = require('fs').readFileSync(outputPath);
      const s3Params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `converted/${outputVideo}`,
        Body: fileContent,
        ContentType: 'video/mp4',
        ACL: 'public-read',
      };

      try {
        const command = new PutObjectCommand(s3Params);
        await s3Client.send(command);
        const publicUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/converted/${outputVideo}`;

        // Clean up local files
        require('fs').unlinkSync(inputVideo);
        require('fs').unlinkSync(outputPath);

        res.json({ url: publicUrl });
      } catch (s3Error) {
        console.error('S3 upload error:', s3Error);
        res.status(500).send('Failed to upload to S3');
      }
    });
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
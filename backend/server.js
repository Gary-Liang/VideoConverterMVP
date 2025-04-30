const express = require('express');
const multer = require('multer');
const path = require('path');
const { exec } = require('child_process');
const cors = require('cors');
const ffmpeg = require('ffmpeg-static');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { v4: uuidv4 } = require('uuid'); // For generating unique job IDs

const app = express();
app.use(cors());

// Configure AWS S3 Client (v3)
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
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

// In-memory store for job status (use a database like Redis for production)
const jobs = new Map(); // { jobId: { status: 'processing' | 'completed' | 'failed', url?: string, error?: string } }

// Health check endpoint
app.get('/health', (req, res) => res.send('OK'));

// Convert endpoint
app.post('/convert', upload.single('video'), async (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded');
  if (req.file.size > 100 * 1024 * 1024) return res.status(400).send('File too large, max 100MB');

  const jobId = uuidv4(); // Generate a unique job ID
  const inputVideo = req.file.path;
  const outputVideo = `converted_${Date.now()}.mp4`;
  const outputPath = path.join(__dirname, 'converted', outputVideo);

  // Get user settings from query params (default to 30s, 720p)
  const duration = parseInt(req.query.duration) || 30;
  const resolution = req.query.resolution === '1080p' ? '1080:1920' : '720:1280';

  // Store initial job status
  jobs.set(jobId, { status: 'processing' });

  // Return jobId immediately
  res.json({ jobId });

  // Process video conversion in the background
  const command = `${ffmpeg} -i "${inputVideo}" -t ${duration} -vf "scale=${resolution}:force_original_aspect_ratio=decrease,pad=${resolution}:(ow-iw)/2:(oh-ih)/2" -c:v libx264 -c:a aac "${outputPath}"`;

  exec(command, async (error) => {
    if (error) {
      console.error('FFmpeg error:', error);
      jobs.set(jobId, { status: 'failed', error: 'Conversion failed' });
      require('fs').unlinkSync(inputVideo);
      return;
    }

    // Upload converted file to S3
    const fileContent = require('fs').readFileSync(outputPath);
    const s3Params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `converted/${outputVideo}`,
      Body: fileContent,
      ContentType: 'video/mp4',
      ContentDisposition: 'attachment; filename="converted-video.mp4"',
    };

    try {
      const command = new PutObjectCommand(s3Params);
      await s3Client.send(command);
      const publicUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/converted/${outputVideo}`;

      // Update job status with the result
      jobs.set(jobId, { status: 'completed', url: publicUrl });

      // Clean up local files
      require('fs').unlinkSync(inputVideo);
      require('fs').unlinkSync(outputPath);
    } catch (s3Error) {
      console.error('S3 upload error:', JSON.stringify(s3Error, null, 2));
      jobs.set(jobId, { status: 'failed', error: 'Failed to upload to S3: ' + s3Error.message });
      require('fs').unlinkSync(inputVideo);
      require('fs').unlinkSync(outputPath);
    }
  });
});

// Status endpoint to check job progress
app.get('/status/:jobId', (req, res) => {
  const jobId = req.params.jobId;
  const job = jobs.get(jobId);

  if (!job) {
    return res.status(404).send('Job not found');
  }

  res.json(job);

  // Optionally clean up completed/failed jobs to free memory
  if (job.status === 'completed' || job.status === 'failed') {
    jobs.delete(jobId);
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
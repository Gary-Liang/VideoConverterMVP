const express = require('express');
const multer = require('multer');
const path = require('path');
const { exec, spawn } = require('child_process');
const cors = require('cors');
const ffmpeg = require('ffmpeg-static');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

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
fs.mkdirSync('uploads', { recursive: true });
fs.mkdirSync('converted', { recursive: true });

// In-memory store for job status (use a database like Redis for production)
const jobs = new Map(); // { jobId: { status: 'processing' | 'completed' | 'failed', url?: string, error?: string, progress?: number, completedAt?: number } }

// Health check endpoint
app.get('/health', (req, res) => res.send('OK'));

// Convert endpoint
app.post('/convert', upload.single('video'), async (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded');
  if (req.file.size > 100 * 1024 * 1024) return res.status(400).send('File too large, max 100MB');

  const jobId = uuidv4();
  const inputVideo = req.file.path;
  const outputVideo = `converted_${Date.now()}.mp4`;
  const outputPath = path.join(__dirname, 'converted', outputVideo);

  // Store initial job status
  jobs.set(jobId, { status: 'processing', progress: 0 });
  console.log(`Job initialized: ${jobId}`);

  // Return jobId immediately
  res.json({ jobId });

  // Get total duration of the input video
  exec(`${ffmpeg} -i "${inputVideo}" -hide_banner 2>&1 | grep Duration | cut -d' ' -f4 | cut -d',' -f1`, (err, stdout) => {
    if (err) {
      console.error('FFmpeg duration error:', err);
      jobs.set(jobId, { status: 'failed', error: 'Failed to get video duration', completedAt: Date.now() });
      fs.unlinkSync(inputVideo);
      return;
    }

    const durationMatch = stdout.match(/(\d+):(\d+):(\d+\.\d+)/);
    if (!durationMatch) {
      console.error('Failed to parse video duration for job:', jobId, 'stdout:', stdout);
      jobs.set(jobId, { status: 'failed', error: 'Failed to parse video duration', completedAt: Date.now() });
      fs.unlinkSync(inputVideo);
      return;
    }

    const totalInputSeconds = parseInt(durationMatch[1]) * 3600 + parseInt(durationMatch[2]) * 60 + parseFloat(durationMatch[3]);
    const requestedDuration = parseInt(req.query.duration) || 15;
    const totalSeconds = Math.min(totalInputSeconds, requestedDuration); // Use requested duration or input duration, whichever is shorter

    console.log(`Total input duration: ${totalInputSeconds}s, Requested duration: ${requestedDuration}s, Using: ${totalSeconds}s`);

    // Process video conversion with progress via stderr
    const resolution = req.query.resolution === '1080p' ? '1080:1920' : '720:1280';
    const args = [
      '-i', inputVideo,
      '-t', totalSeconds.toString(),
      '-vf', `scale=${resolution}:force_original_aspect_ratio=decrease,pad=${resolution}:(ow-iw)/2:(oh-ih)/2`,
      '-c:v', 'libx264',
      '-c:a', 'aac',
      '-y',
      outputPath
    ];

    const ffmpegProcess = spawn(ffmpeg, args);

    ffmpegProcess.stderr.on('data', (data) => {
      const output = data.toString();
      const timeMatch = output.match(/time=(\d+:\d+:\d+\.\d+)/);
      if (timeMatch) {
        const timeStr = timeMatch[1];
        const [hours, minutes, seconds] = timeStr.split(':').map(parseFloat);
        const elapsedSeconds = hours * 3600 + minutes * 60 + seconds;
        const progress = Math.min(100, (elapsedSeconds / totalSeconds) * 100);
        jobs.set(jobId, { ...jobs.get(jobId), progress: Math.round(progress) });
        console.log(`Progress updated for job ${jobId}: ${Math.round(progress)}% (elapsed: ${elapsedSeconds}s)`);
      }
    });

    ffmpegProcess.on('close', async (code) => {
      if (code !== 0) {
        console.error('FFmpeg error for job:', jobId, `Exit code: ${code}`);
        jobs.set(jobId, { status: 'failed', error: 'Conversion failed', completedAt: Date.now() });
        fs.unlinkSync(inputVideo);
        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
        return;
      }

      // Upload converted file to S3
      const fileContent = fs.readFileSync(outputPath);
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
        jobs.set(jobId, { status: 'completed', url: publicUrl, progress: 100, completedAt: Date.now() });
        console.log(`Job completed: ${jobId}, URL: ${publicUrl}`);
      } catch (s3Error) {
        console.error('S3 upload error for job:', jobId, JSON.stringify(s3Error, null, 2));
        jobs.set(jobId, { status: 'failed', error: 'Failed to upload to S3: ' + s3Error.message, completedAt: Date.now() });
      }

      // Clean up local files
      fs.unlinkSync(inputVideo);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    });
  });
});

// Status endpoint to check job progress
app.get('/status/:jobId', (req, res) => {
  const jobId = req.params.jobId;
  const job = jobs.get(jobId);

  if (!job) {
    console.log(`Job not found: ${jobId}`);
    return res.status(404).send('Job not found');
  }

  console.log(`Status requested for job ${jobId}:`, job);
  res.json(job);

  // Clean up completed/failed jobs after 30 seconds
  if (job.status === "completed" || job.status === "failed") {
    const timeSinceCompletion = Date.now() - (job.completedAt || 0);
    if (timeSinceCompletion >= 30 * 1000) {
      jobs.delete(jobId);
      console.log(`Job deleted after 30s: ${jobId}`);
    }
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
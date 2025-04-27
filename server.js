const express = require('express');
const ffmpeg = require('ffmpeg-static');
const { exec } = require('child_process');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.post('/convert', (req, res) => {
//   const inputVideo = 'input.mp4'; // Placeholder for uploaded video
//   const outputVideo = 'output.mp4';

//   // FFmpeg command: trim to 30s, resize to 9:16 (1080x1920)
//   const command = `${ffmpeg} -i ${inputVideo} -t 30 -vf "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2" -c:v libx264 -c:a aac ${outputVideo}`;

//   exec(command, (error) => {
//     if (error) {
//       console.error(error);
//       return res.status(500).send('Conversion failed');
//     }
//     res.status(200).send('Conversion successful');
//   });
// });

app.listen(port, () => console.log(`Server running on port ${port}`));

const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

app.post('/convert', upload.single('video'), (req, res) => {
  const inputVideo = req.file.path;
  const outputVideo = `converted_${Date.now()}.mp4`;

  const command = `${ffmpeg} -i ${inputVideo} -t 30 -vf "scale=720:1280:force_original_aspect_ratio=decrease,pad=720:1280:(ow-iw)/2:(oh-ih)/2" -c:v libx264 -c:a aac ${outputVideo}`;

  exec(command, (error) => {
    if (error) {
      console.error(error);
      return res.status(500).send('Conversion failed');
    }
    res.download(outputVideo); // Send the converted file to the user
  });
});

app.get('/health', (req, res) => {
  res.status(200).send('Server is up!');
});
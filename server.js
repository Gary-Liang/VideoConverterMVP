const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

app.post('/convert', upload.single('video'), (req, res) => {
  const inputVideo = req.file.path;
  const outputVideo = `converted_${Date.now()}.mp4`;

  const command = `${ffmpeg} -i ${inputVideo} -t 30 -vf "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2" -c:v libx264 -c:a aac ${outputVideo}`;

  exec(command, (error) => {
    if (error) {
      console.error(error);
      return res.status(500).send('Conversion failed');
    }
    res.download(outputVideo); // Send the converted file to the user
  });
});
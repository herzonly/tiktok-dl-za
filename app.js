const express = require('express');
const { tikdown } = require('nayan-media-downloader');
const path = require('path');
const fs = require('fs');
const https = require('https');

const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Download route
app.use('/download', async (req, res) => {
  const { url } = req.query;
  
  // Input validation
  if (!url) {
    return res.status(400).json({ error: 'URL tidak diberikan' });
  }

  try {
    // Fetch TikTok video data
    const data = await tikdown(url);
    const videoUrl = data.data.video;
    if (!data.status) {
      return res.status(400).json({
        status: false,
        error: 'Gagal mendapatkan data TikTok',
        msg: "error mas",
      });
    }
    const downloadDir = path.join(__dirname, 'downloads');
    const filePath = path.join(downloadDir, `${data.data.title}.mp4`);

    // Ensure downloads directory exists
    fs.mkdirSync(downloadDir, { recursive: true });

    // Download video
    const file = fs.createWriteStream(filePath);
    
    https.get(videoUrl, (response) => {
      response.pipe(file);
      
      file.on('finish', () => {
        file.close(() => {
          res.download(filePath, (err) => {
            if (err) {
              console.error('Error saat mengunduh file:', err);
            }
            fs.unlinkSync(filePath);
          });
        });
      });

      file.on('error', (err) => {
        console.error('Error saat menyimpan file:', err);
        res.status(500).json({ error: 'Terjadi kesalahan saat menyimpan video.' });
      });
    }).on('error', (err) => {
      console.error('Error saat mengunduh file:', err);
      res.status(500).json({ error: 'Terjadi kesalahan saat mengunduh video.' });
    });
    
          // Send video metadata
          res.json({
            creator: "herza",
            msg: "success",
            status: true,
            data: {
              author: data.data.author,
              title: data.data.title,
              video_url: data.data.video,
              audio_url: data.data.audio,
              view: data.data.view,
              comment: data.data.comment,
              share: data.data.share,
              play: data.data.play,
              duration: data.data.duration,
            },
          });

          // Download and delete file
 
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan pada server' });
  }
});

// Home route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});

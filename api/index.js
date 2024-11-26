const express = require('express');
const { tikdown } = require('nayan-media-downloader');
const path = require('path');
const fs = require('fs');
const fetch = require('node-fetch');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/download', async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'URL tidak diberikan' });
  }

  try {
    const data = await tikdown(url);

    if (data.status) {
      const videoUrl = data.data.video;
      const filePath = path.join(__dirname, '..', 'downloads', `${data.data.title}.mp4`);

      const videoResponse = await fetch(videoUrl);
      const dest = fs.createWriteStream(filePath);

      videoResponse.body.pipe(dest);

      dest.on('finish', () => {
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
          }
        });

        res.download(filePath, (err) => {
          if (err) {
            console.error('Error downloading file:', err);
          }
          fs.unlinkSync(filePath);
        });
      });

      dest.on('error', (err) => {
        console.error('Error saving file:', err);
        res.status(500).json({ error: 'Terjadi kesalahan saat menyimpan video.' });
      });
    } else {
      return res.status(400).json({
        status: false,
        error: 'Gagal mendapatkan data TikTok',
        msg: "error mas"
      });
    }
  } catch (error) {
    res.status(500).json({ error: 'Terjadi kesalahan pada server' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});

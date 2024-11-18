const express = require('express');
const { tikdown } = require('nayan-media-downloader');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/download/', async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'URL tidak diberikan' });
  }

  try {
    const data = await tikdown(url);

    if (data.status) {
      return res.json({
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
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});

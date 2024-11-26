const express = require('express');
const { tikdown } = require('nayan-media-downloader');
const path = require('path');
const fs = require('fs');
const https = require('https'); // Menggunakan modul bawaan untuk unduhan
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/download', async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'URL tidak diberikan' });
  }

  try {
    const data = await tikdown(url);

    if (data.status) {
      const videoUrl = data.data.video;
      const filePath = path.join(__dirname, 'downloads', `${data.data.title}.mp4`);

      // Membuat direktori "downloads" jika belum ada
      if (!fs.existsSync(path.join(__dirname, 'downloads'))) {
        fs.mkdirSync(path.join(__dirname, 'downloads'));
      }

      const file = fs.createWriteStream(filePath);
      https.get(videoUrl, (response) => {
        response.pipe(file);

        file.on('finish', () => {
          file.close(() => {
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

            res.download(filePath, (err) => {
              if (err) {
                console.error('Error saat mengunduh file:', err);
              }
              fs.unlinkSync(filePath); // Menghapus file setelah diunduh
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
    } else {
      return res.status(400).json({
        status: false,
        error: 'Gagal mendapatkan data TikTok',
        msg: "error mas",
      });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan pada server' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});

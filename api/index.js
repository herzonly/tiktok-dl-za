const express = require('express');
const { tikdown } = require('nayan-media-downloader');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public'))); // Pindahkan ke sini

app.use('/download', async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'URL tidak diberikan' });
  }

  try {
    const data = await tikdown(url);

    if (data.status) {
      // Simpan file video ke server
      const videoUrl = data.data.video; // URL video
      const filePath = path.join(__dirname, 'downloads', `${data.data.title}.mp4`);

      // Download file video dari URL dan simpan ke server
      const videoResponse = await fetch(videoUrl);
      const dest = fs.createWriteStream(filePath);
      videoResponse.body.pipe(dest);

      dest.on('finish', () => {
        res.download(filePath, (err) => {
          if (err) {
            console.error('Error downloading file:', err);
          }
          // Hapus file setelah diunduh (opsional)
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

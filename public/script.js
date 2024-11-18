document.addEventListener('DOMContentLoaded', () => {
    const downloadForm = document.getElementById('download-form');
    const videoUrlInput = document.getElementById('video-url');
    const loadingBar = document.getElementById('loading-bar');
    const popup = document.getElementById('popup');
    const closePopup = document.getElementById('close-popup');
    const customAlert = document.getElementById('custom-alert');
    const alertCloseBtn = document.getElementById('alert-close-btn');

    downloadForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const videoUrl = videoUrlInput.value;

        if (isValidUrl(videoUrl)) {
            showLoadingBar();

            try {
                const response = await fetch('/api/download', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ url: videoUrl }),
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const videoData = await response.json();
                showPopup(videoData);
            } catch (error) {
                console.error('Error fetching video:', error);
                showCustomAlert();
            } finally {
                resetLoadingBar();
            }
        } else {
            showCustomAlert();
        }
    });

    closePopup.addEventListener('click', () => {
        popup.style.display = 'none';
        resetLoadingBar();
    });

    alertCloseBtn.addEventListener('click', () => {
        customAlert.style.display = 'none';
    });
});

function isValidUrl(url) {
    // Tambahkan logika validasi URL di sini
    return true; // Placeholder, ganti dengan validasi yang sebenarnya
}

function showLoadingBar() {
    loadingBar.style.display = 'block'; // Tampilkan loading bar
    loadingBar.style.width = '100%'; // Isi loading bar hingga penuh
}

function resetLoadingBar() {
    loadingBar.style.width = '0'; // Reset lebar loading bar
    loadingBar.style.display = 'none'; // Sembunyikan loading bar
}

function showPopup(videoData) {
    document.getElementById('video-title').innerText = videoData.title;
    document.getElementById('video-download').innerText = videoData.downloadUrl;
    document.getElementById('video-duration').innerText = videoData.duration;
    document.getElementById('video-comment').innerText = videoData.comments;
    document.getElementById('video-share').innerText = videoData.shares;
    document.getElementById('video-play').innerText = videoData.plays;

    const mediaContainer = document.getElementById('media-container');
    mediaContainer.innerHTML = `<img id="avatar" src="${videoData.thumbnail}" alt="Thumbnail">`;

    popup.style.display = 'block'; // Tampilkan popup
}

function showCustomAlert() {
    customAlert.style.display = 'block';
}

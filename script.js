// State
let isPlaying = false;
let currentTrackIndex = -1;
let currentPlaylist = [];
let audio = document.getElementById('audio-player');
let userLibrary = [];
let favorites = new Set(JSON.parse(localStorage.getItem('quran_favorites')) || []);
let playbackSpeeds = [1, 1.25, 1.5, 2];
let currentSpeedIndex = 0;

// DOM Elements
const playBtn = document.querySelector('.play-pause-btn');
const playIcon = document.getElementById('play-icon');
const seekBar = document.getElementById('seek-bar');
const currentTimeEl = document.getElementById('current-time');
const durationEl = document.getElementById('total-duration');
const volumeBar = document.getElementById('volume-bar');
const coverImg = document.getElementById('current-cover');
const titleEl = document.getElementById('current-title');
const reciterEl = document.getElementById('current-reciter');
const recitationsGrid = document.getElementById('recitations-grid');
const featuredGrid = document.getElementById('featured-grid');
const quranDisplay = document.getElementById('quran-display');

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    loadFeatured();
    loadLibrary();
    loadFavorites();
    setupEventListeners();
});

function setupEventListeners() {
    // Audio Events
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', nextTrack);
    audio.addEventListener('loadedmetadata', () => {
        durationEl.textContent = formatTime(audio.duration);
        seekBar.max = Math.floor(audio.duration);
    });

    // Controls
    seekBar.addEventListener('input', () => {
        audio.currentTime = seekBar.value;
    });

    volumeBar.addEventListener('input', (e) => {
        audio.volume = e.target.value / 100;
        localStorage.setItem('quran_volume', audio.volume);
    });

    // Restore Volume
    const savedVolume = localStorage.getItem('quran_volume');
    if (savedVolume !== null) {
        audio.volume = parseFloat(savedVolume);
        volumeBar.value = audio.volume * 100;
    }

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT') return; // Don't trigger when typing in search

        switch(e.code) {
            case 'Space':
                e.preventDefault();
                togglePlay();
                break;
            case 'ArrowRight':
                audio.currentTime += 5;
                break;
            case 'ArrowLeft':
                audio.currentTime -= 5;
                break;
            case 'KeyM':
                audio.muted = !audio.muted;
                break;
        }
    });

    // File Upload
    document.getElementById('file-upload').addEventListener('change', handleFileUpload);

    // Search
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => performSearch(e.target.value));
    }
}

// Navigation
function navigateTo(viewId) {
    document.querySelectorAll('.view').forEach(v => v.style.display = 'none');
    document.getElementById(viewId + '-view').style.display = 'block';

    document.querySelectorAll('nav li').forEach(li => li.classList.remove('active'));

    // Close sidebar on mobile when navigating
    if (window.innerWidth <= 768) {
        document.getElementById('app-sidebar').classList.remove('open');
        document.querySelector('.sidebar-overlay').classList.remove('active');
    }
}

function toggleSidebar() {
    const sidebar = document.getElementById('app-sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    sidebar.classList.toggle('open');
    overlay.classList.toggle('active');
}

// Search Logic
function performSearch(query) {
    const resultsContainer = document.getElementById('search-results');
    resultsContainer.innerHTML = '';

    if (!query) return;

    const lowerQuery = query.toLowerCase();
    const allTracks = [...featuredRecitations, ...userLibrary];

    const results = allTracks.filter(track =>
        track.title.toLowerCase().includes(lowerQuery) ||
        track.reciter.toLowerCase().includes(lowerQuery)
    );

    if (results.length > 0) {
        resultsContainer.innerHTML = results.map(track => createCard(track)).join('');
    } else {
        resultsContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #b3b3b3;">لا توجد نتائج</p>';
    }
}

// Favorites Logic
function toggleLikeCurrent() {
    if (!audio.src) return;

    // Find current track ID
    // We need to know which track is playing.
    // Ideally we store currentTrackId in state, but for now we can infer from currentPlaylist/Index
    if (currentPlaylist.length > 0 && currentTrackIndex >= 0) {
        const track = currentPlaylist[currentTrackIndex];
        if (favorites.has(track.id)) {
            favorites.delete(track.id);
        } else {
            favorites.add(track.id);
        }
        localStorage.setItem('quran_favorites', JSON.stringify([...favorites]));
        updateLikeButton();
        loadFavorites(); // Refresh view
    }
}

function updateLikeButton() {
    const likeIcon = document.getElementById('like-icon');
    if (currentPlaylist.length > 0 && currentTrackIndex >= 0) {
        const track = currentPlaylist[currentTrackIndex];
        if (favorites.has(track.id)) {
            likeIcon.className = "ph-fill ph-heart";
            likeIcon.style.color = "#1db954";
        } else {
            likeIcon.className = "ph ph-heart";
            likeIcon.style.color = "white";
        }
    }
}

function loadFavorites() {
    const list = document.getElementById('favorites-list');
    if (!list) return;
    list.innerHTML = '';

    const favoriteTracks = [...featuredRecitations, ...userLibrary].filter(t => favorites.has(t.id));

    favoriteTracks.forEach((track, index) => {
        const item = document.createElement('div');
        item.className = 'list-item';
        item.onclick = () => playTrack(track.id); // Re-use playTrack which handles finding it

        // ... (Similar DOM creation to Library, can refactor but copy-paste is safer for now)
         const numSpan = document.createElement('span');
        numSpan.textContent = index + 1;
        item.appendChild(numSpan);

        const infoDiv = document.createElement('div');
        infoDiv.style.cssText = "display: flex; align-items: center; gap: 10px;";

        const img = document.createElement('img');
        img.src = track.cover;
        img.width = 40;
        img.style.borderRadius = "4px";
        infoDiv.appendChild(img);

        const textDiv = document.createElement('div');

        const titleDiv = document.createElement('div');
        titleDiv.style.color = "white";
        titleDiv.textContent = track.title;
        textDiv.appendChild(titleDiv);

        const reciterDiv = document.createElement('div');
        reciterDiv.style.fontSize = "0.8rem";
        reciterDiv.textContent = track.reciter;
        textDiv.appendChild(reciterDiv);

        infoDiv.appendChild(textDiv);
        item.appendChild(infoDiv);

        const dateSpan = document.createElement('span');
        dateSpan.textContent = new Date().toLocaleDateString('ar-EG');
        item.appendChild(dateSpan);

        const timeSpan = document.createElement('span');
        timeSpan.textContent = "3:45"; // Mock duration
        item.appendChild(timeSpan);

        list.appendChild(item);
    });
}

// Load Content
function loadFeatured() {
    const grid = featuredRecitations.map(track => createCard(track)).join('');
    featuredGrid.innerHTML = grid;
    // Duplicate for "Good Morning" section for demo
    recitationsGrid.innerHTML = grid;
}

function createCard(track) {
    return `
        <div class="card" onclick="playTrack(${track.id})">
            <div style="position: relative;">
                <img src="${track.cover}" alt="${track.title}" class="card-img">
                <div class="play-overlay"><i class="ph-fill ph-play"></i></div>
            </div>
            <h3>${track.title}</h3>
            <p>${track.reciter}</p>
        </div>
    `;
}

// Player Logic
function playTrack(id) {
    let track = featuredRecitations.find(t => t.id === id);
    if (!track) {
        // Check library
        track = userLibrary.find(t => t.id === id);
    }

    if (track) {
        currentPlaylist = featuredRecitations; // Simplified queue logic
        currentTrackIndex = currentPlaylist.indexOf(track);

        loadTrackDetails(track);
        audio.src = track.src;
        audio.play();
        isPlaying = true;
        updatePlayButton();
        renderLyrics(track);
    }
}

function loadTrackDetails(track) {
    titleEl.textContent = track.title;
    reciterEl.textContent = track.reciter;
    coverImg.src = track.cover;
    updateLikeButton();
}

function togglePlay() {
    if (!audio.src) return;

    if (isPlaying) {
        audio.pause();
    } else {
        audio.play();
    }
    isPlaying = !isPlaying;
    updatePlayButton();
}

function updatePlayButton() {
    if (isPlaying) {
        playIcon.classList.replace('ph-play-circle', 'ph-pause-circle');
    } else {
        playIcon.classList.replace('ph-pause-circle', 'ph-play-circle');
    }
}

function nextTrack() {
    // Simple next logic
    if (currentTrackIndex < currentPlaylist.length - 1) {
        playTrack(currentPlaylist[currentTrackIndex + 1].id);
    }
}

function prevTrack() {
    if (currentTrackIndex > 0) {
        playTrack(currentPlaylist[currentTrackIndex - 1].id);
    }
}

function updateProgress() {
    seekBar.value = audio.currentTime;
    currentTimeEl.textContent = formatTime(audio.currentTime);
    syncLyrics();
}

function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

// Lyrics / Mushaf Mode
function toggleMushafMode() {
    const overlay = document.getElementById('mushaf-view');
    if (overlay.style.display === 'none') {
        overlay.style.display = 'flex';
    } else {
        overlay.style.display = 'none';
    }
}

function renderLyrics(track) {
    quranDisplay.innerHTML = '';
    if (track.lyrics && track.lyrics.length > 0) {
        track.lyrics.forEach(line => {
            const p = document.createElement('p');
            p.className = 'verse';
            p.dataset.time = line.time;
            p.textContent = line.text;
            quranDisplay.appendChild(p);
        });
    } else {
        quranDisplay.innerHTML = '<p class="verse">النص غير متوفر لهذه التلاوة</p>';
    }
}

function syncLyrics() {
    const verses = document.querySelectorAll('.verse');
    let activeVerse = null;

    verses.forEach(verse => {
        const time = parseFloat(verse.dataset.time);
        if (audio.currentTime >= time) {
            activeVerse = verse;
        }
    });

    if (activeVerse) {
        document.querySelectorAll('.verse.active').forEach(v => v.classList.remove('active'));
        activeVerse.classList.add('active');
        activeVerse.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// Library / Upload Logic
function triggerUpload() {
    document.getElementById('file-upload').click();
}

function handleFileUpload(event) {
    const files = event.target.files;
    if (files.length > 0) {
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const url = URL.createObjectURL(file);
            const newTrack = {
                id: Date.now() + i,
                title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
                reciter: "تلاوة خاصة",
                cover: "https://via.placeholder.com/150",
                src: url,
                lyrics: []
            };
            userLibrary.push(newTrack);
        }
        loadLibrary();
        navigateTo('library');
    }
}

function loadLibrary() {
    const list = document.getElementById('library-list');
    list.innerHTML = '';

    userLibrary.forEach((track, index) => {
        const item = document.createElement('div');
        item.className = 'list-item';
        item.onclick = () => playLibraryTrack(track.id);

        const numSpan = document.createElement('span');
        numSpan.textContent = index + 1;
        item.appendChild(numSpan);

        const infoDiv = document.createElement('div');
        infoDiv.style.cssText = "display: flex; align-items: center; gap: 10px;";

        const img = document.createElement('img');
        img.src = track.cover;
        img.width = 40;
        img.style.borderRadius = "4px";
        infoDiv.appendChild(img);

        const textDiv = document.createElement('div');

        const titleDiv = document.createElement('div');
        titleDiv.style.color = "white";
        titleDiv.textContent = track.title;
        textDiv.appendChild(titleDiv);

        const reciterDiv = document.createElement('div');
        reciterDiv.style.fontSize = "0.8rem";
        reciterDiv.textContent = track.reciter;
        textDiv.appendChild(reciterDiv);

        infoDiv.appendChild(textDiv);
        item.appendChild(infoDiv);

        const dateSpan = document.createElement('span');
        dateSpan.textContent = new Date().toLocaleDateString('ar-EG');
        item.appendChild(dateSpan);

        const timeSpan = document.createElement('span');
        timeSpan.textContent = "-:-";
        item.appendChild(timeSpan);

        list.appendChild(item);
    });
}

function toggleShuffle() {
    const btn = document.querySelector('button[onclick="toggleShuffle()"]');
    if (btn) btn.classList.toggle('active');
    // Logic for shuffle would go here
}

function toggleRepeat() {
    const btn = document.querySelector('button[onclick="toggleRepeat()"]');
    if (btn) btn.classList.toggle('active');
    if (audio) audio.loop = !audio.loop;
}

function toggleSpeed() {
    currentSpeedIndex = (currentSpeedIndex + 1) % playbackSpeeds.length;
    const speed = playbackSpeeds[currentSpeedIndex];
    audio.playbackRate = speed;

    const btn = document.querySelector('.speed-btn');
    if (btn) btn.textContent = speed + 'x';
}

function playLibraryTrack(id) {
    const track = userLibrary.find(t => t.id === id);
    if (track) {
        currentPlaylist = userLibrary;
        currentTrackIndex = userLibrary.indexOf(track);
        loadTrackDetails(track);
        audio.src = track.src;
        audio.play();
        isPlaying = true;
        updatePlayButton();
        renderLyrics(track);
    }
}

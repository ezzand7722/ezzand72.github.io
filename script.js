// State
let isPlaying = false;
let currentTrackIndex = -1;
let currentPlaylist = [];
let audio = document.getElementById('audio-player');
let userLibrary = [];

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
    });

    // File Upload
    document.getElementById('file-upload').addEventListener('change', handleFileUpload);
}

// Navigation
function navigateTo(viewId) {
    document.querySelectorAll('.view').forEach(v => v.style.display = 'none');
    document.getElementById(viewId + '-view').style.display = 'block';

    document.querySelectorAll('nav li').forEach(li => li.classList.remove('active'));
    // Simple active state toggle based on click context usually, but here manual for now
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

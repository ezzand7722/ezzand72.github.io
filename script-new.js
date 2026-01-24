// State Management
let isPlaying = false;
let currentTrackIndex = -1;
let currentPlaylist = [];
let audio = document.getElementById('audio-player');
let userLibrary = [];
let currentTrack = null;
let isShuffleEnabled = false;
let isRepeatEnabled = false;
let shuffleHistory = [];
let reciterPickerInitialized = false;

// Caches to prevent repeated API calls
const surahTextCache = new Map();
const verseTimingsCache = new Map();

// Mapping for Quran.com API IDs
const localToQuranRecitationMap = {
    'afs': '3',
    'sds': '1',
    's_gmd': '7',
    'maher': '9'
};

const recitationIdMap = {
    'ar.abdulbasit': '1',
    'ar.abdurrashid': '2',
    'ar.alafasy': '3',
    'ar.ajamy': '4',
    'ar.hudhaify': '5',
    'ar.husary': '6',
    'ar.ibrahimakhbar': '7',
    'ar.jibreel': '8',
    'ar.juhany': '9',
    'ar.khalifa': '10',
    'ar.mahmoudali': '11',
    'ar.minshawi': '12',
    'ar.muaiqly': '13',
    'ar.qatami': '14',
    'ar.saoodshuraym': '15',
    'ar.shatri': '16',
    'ar.tablawy': '17',
    'ar.walk': '18',
    'ar.yasser': '19'
};

const STORAGE_KEYS = {
    selectedReciterId: 'selectedReciterId',
    favouriteSurahIds: 'favouriteSurahIds'
};

// DOM Elements
const playIcon = document.getElementById('play-icon');
const seekBar = document.getElementById('seek-bar');
const currentTimeEl = document.getElementById('current-time');
const durationEl = document.getElementById('total-duration');
const volumeBar = document.getElementById('volume-bar');
const titleEl = document.getElementById('current-title');
const reciterEl = document.getElementById('current-reciter');
const recitationsGrid = document.getElementById('recitations-grid');
const featuredGrid = document.getElementById('featured-grid');
const quranDisplay = document.getElementById('quran-display');
const favouritesGrid = document.getElementById('favourites-grid');
const likeBtn = document.querySelector('.like-btn');
const reciterSelect = document.getElementById('reciter-select');

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    loadFeatured();
    loadLibrary();
    setupEventListeners();
    setupReciterPicker();
    loadMoreReciters();
    setupSearch();
    syncLikeButton();
});

function setupEventListeners() {
    // Audio Timeline Sync
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', handleTrackEnded);
    audio.addEventListener('loadedmetadata', () => {
        durationEl.textContent = formatTime(audio.duration);
        seekBar.max = Math.floor(audio.duration);
    });

    // Seek Logic
    seekBar.addEventListener('input', () => {
        audio.currentTime = seekBar.value;
    });

    // Volume Logic
    volumeBar.addEventListener('input', (e) => {
        audio.volume = e.target.value / 100;
    });

    // File Upload
    const fileInput = document.getElementById('file-upload');
    if (fileInput) fileInput.addEventListener('change', handleFileUpload);

    // Favourites
    if (likeBtn) {
        likeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFavouriteForCurrentTrack();
        });
    }
}

// NAVIGATION
function navigateTo(viewId) {
    document.querySelectorAll('.view').forEach(v => v.style.display = 'none');
    const target = document.getElementById(viewId + '-view');
    if (target) target.style.display = 'block';

    document.querySelectorAll('nav li').forEach(li => li.classList.remove('active'));
    if (viewId === 'favourites') renderFavourites();
}

// DATA LOADING
function loadFeatured() {
    if (typeof featuredSurahs === 'undefined') return;
    const allCards = featuredSurahs.map(track => createCard(track)).join('');
    if (recitationsGrid) recitationsGrid.innerHTML = allCards;
    
    const featuredCards = featuredSurahs.slice(0, 12).map(track => createCard(track)).join('');
    if (featuredGrid) featuredGrid.innerHTML = featuredCards;
}

function createCard(track) {
    const selectedReciter = getSelectedReciter();
    return `
        <div class="surah-row" onclick="playTrack(${track.id})">
            <div class="surah-row-num">${track.surahNumber}</div>
            <div class="surah-row-main">
                <div class="surah-row-title">${track.title}</div>
                <div class="surah-row-sub">${selectedReciter ? selectedReciter.name : ''}</div>
            </div>
            <div class="surah-row-action"><i class="ph-fill ph-play"></i></div>
        </div>
    `;
}

// CORE PLAYER LOGIC
function playTrack(id) {
    let track = featuredSurahs.find(t => t.id === id);
    if (!track) track = userLibrary.find(t => t.id === id);

    if (track) {
        currentPlaylist = featuredSurahs;
        currentTrackIndex = currentPlaylist.indexOf(track);
        currentTrack = track;

        loadTrackDetails(track);
        audio.src = getTrackAudioSrc(track);
        audio.play().catch(e => console.error("Playback failed:", e));
        
        isPlaying = true;
        updatePlayButton();
        
        const selectedReciter = getSelectedReciter();
        renderSurahText({ ...track, reciterId: selectedReciter?.id });
        syncLikeButton();
    }
}

function loadTrackDetails(track) {
    titleEl.textContent = track.title;
    const selectedReciter = getSelectedReciter();
    reciterEl.textContent = (track.reciter === 'تلاوة خاصة') ? track.reciter : (selectedReciter ? selectedReciter.name : '...');
}

function getSelectedReciter() {
    if (typeof reciters === 'undefined' || reciters.length === 0) return null;
    const savedId = localStorage.getItem(STORAGE_KEYS.selectedReciterId);
    return reciters.find(r => r.id === savedId && r.baseUrl) || reciters.find(r => r.baseUrl) || null;
}

function setupReciterPicker() {
    if (!reciterSelect || typeof reciters === 'undefined') return;
    
    reciterSelect.innerHTML = reciters
        .map(r => `<option value="${r.id}" ${!r.baseUrl ? 'disabled' : ''}>${r.name}${!r.baseUrl ? ' (قريبًا)' : ''}</option>`)
        .join('');

    const selected = getSelectedReciter();
    if (selected) reciterSelect.value = selected.id;

    if (reciterPickerInitialized) return;
    reciterPickerInitialized = true;

    reciterSelect.addEventListener('change', () => {
        localStorage.setItem(STORAGE_KEYS.selectedReciterId, reciterSelect.value);
        if (currentTrack) {
            const currentTime = audio.currentTime;
            playTrack(currentTrack.id);
            audio.currentTime = currentTime; 
        }
        loadFeatured();
    });
}

// SYNC & API LOGIC
async function fetchSurahUthmaniVerses(chapterNumber) {
    if (surahTextCache.has(chapterNumber)) return surahTextCache.get(chapterNumber);
    try {
        const res = await fetch(`https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${chapterNumber}`);
        const data = await res.json();
        surahTextCache.set(chapterNumber, data.verses);
        return data.verses;
    } catch { return []; }
}

async function fetchVerseTimings(reciterId, chapterNumber) {
    const key = `${reciterId}:${chapterNumber}`;
    if (verseTimingsCache.has(key)) return verseTimingsCache.get(key);

    const apiId = localToQuranRecitationMap[reciterId] || recitationIdMap[reciterId] || '3';
    
    try {
        // Using V3 API for word-level segments
        const res = await fetch(`https://api.quran.com/api/v3/chapters/${chapterNumber}/verses?recitation=${apiId}&text_type=words`);
        if (!res.ok) return [];
        const data = await res.json();
        
        const timings = data.verses.map(v => {
            const segments = v.audio?.segments || [];
            if (segments.length === 0) return null;
            
            return {
                verse: v.verse_number,
                start: segments[0][1] / 1000, // Convert ms to sec
                end: segments[segments.length - 1][2] / 1000 // Convert ms to sec
            };
        }).filter(t => t !== null);

        verseTimingsCache.set(key, timings);
        return timings;
    } catch (e) {
        console.error("Timings error:", e);
        return [];
    }
}

async function renderSurahText(track) {
    if (!quranDisplay || !track.surahNumber) return;
    quranDisplay.innerHTML = '<p class="verse">جاري تحميل النص القرآني...</p>';

    try {
        const [verses, timings] = await Promise.all([
            fetchSurahUthmaniVerses(track.surahNumber),
            fetchVerseTimings(track.reciterId || 'ar.alafasy', track.surahNumber)
        ]);

        quranDisplay.innerHTML = '';
        verses.forEach((v, i) => {
            const p = document.createElement('p');
            p.className = 'verse';
            const vNum = i + 1;
            
            const timing = timings.find(t => t.verse === vNum);
            if (timing) {
                p.dataset.time = timing.start;
                p.dataset.endTime = timing.end;
            }

            p.textContent = `${v.text_uthmani} ﴿${toArabicIndicDigits(vNum)}﴾`;
            quranDisplay.appendChild(p);
        });
    } catch (e) {
        quranDisplay.innerHTML = '<p class="verse">تعذر تحميل النص لهذا القارئ</p>';
    }
}

function syncLyrics() {
    if (!isPlaying) return;
    
    const verses = document.querySelectorAll('.verse');
    const currentTime = audio.currentTime;
    let activeVerse = null;

    // Check time range for each verse
    for (let v of verses) {
        const start = parseFloat(v.dataset.time);
        const end = parseFloat(v.dataset.endTime);
        
        if (!isNaN(start) && !isNaN(end)) {
            if (currentTime >= start && currentTime <= end) {
                activeVerse = v;
                break;
            }
        }
    }

    // Only update and scroll if verse actually changed
    if (activeVerse && !activeVerse.classList.contains('active')) {
        document.querySelectorAll('.verse.active').forEach(v => v.classList.remove('active'));
        activeVerse.classList.add('active');
        activeVerse.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

function updateProgress() {
    seekBar.value = audio.currentTime;
    currentTimeEl.textContent = formatTime(audio.currentTime);
    syncLyrics();
}

// UTILITIES
function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

function toArabicIndicDigits(value) {
    const map = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
    return String(value).replace(/\d/g, d => map[Number(d)]);
}

function togglePlay() {
    if (!audio.src) return;
    isPlaying ? audio.pause() : audio.play();
    isPlaying = !isPlaying;
    updatePlayButton();
}

function updatePlayButton() {
    playIcon.className = isPlaying ? 'ph-fill ph-pause-circle' : 'ph-fill ph-play-circle';
}

function toggleMushafMode() {
    const view = document.getElementById('mushaf-view');
    const isHidden = view.style.display === 'none';
    view.style.display = isHidden ? 'flex' : 'none';
}

function getTrackAudioSrc(track) {
    if (track.src) return track.src;
    const reciter = getSelectedReciter();
    if (!reciter || !track.surahNumber) return '';
    return `${reciter.baseUrl}${String(track.surahNumber).padStart(3, '0')}.mp3`;
}

// END TRACK HANDLERS
function handleTrackEnded() {
    nextTrack();
}

function nextTrack() {
    if (currentTrackIndex < featuredSurahs.length - 1) {
        playTrack(featuredSurahs[currentTrackIndex + 1].id);
    }
}

function prevTrack() {
    if (currentTrackIndex > 0) {
        playTrack(featuredSurahs[currentTrackIndex - 1].id);
    }
}

// FAVOURITES & SEARCH
function syncLikeButton() {
    if (!likeBtn || !currentTrack) return;
    const ids = JSON.parse(localStorage.getItem(STORAGE_KEYS.favouriteSurahIds) || '[]');
    const isLiked = ids.includes(currentTrack.id);
    likeBtn.classList.toggle('liked', isLiked);
    likeBtn.querySelector('i').className = isLiked ? 'ph-fill ph-heart' : 'ph ph-heart';
}

function toggleFavouriteForCurrentTrack() {
    if (!currentTrack) return;
    let ids = JSON.parse(localStorage.getItem(STORAGE_KEYS.favouriteSurahIds) || '[]');
    if (ids.includes(currentTrack.id)) {
        ids = ids.filter(id => id !== currentTrack.id);
    } else {
        ids.push(currentTrack.id);
    }
    localStorage.setItem(STORAGE_KEYS.favouriteSurahIds, JSON.stringify(ids));
    syncLikeButton();
    renderFavourites();
}

function renderFavourites() {
    if (!favouritesGrid) return;
    const ids = JSON.parse(localStorage.getItem(STORAGE_KEYS.favouriteSurahIds) || '[]');
    const tracks = featuredSurahs.filter(t => ids.includes(t.id));
    favouritesGrid.innerHTML = tracks.map(t => createCard(t)).join('');
}

function setupSearch() {
    const input = document.querySelector('.search-input');
    if (!input) return;
    input.addEventListener('input', (e) => {
        const q = e.target.value.toLowerCase();
        const results = featuredSurahs.filter(t => t.title.includes(q));
        const searchResults = document.getElementById('search-results');
        if (searchResults) searchResults.innerHTML = results.map(t => createCard(t)).join('');
    });
}

function loadLibrary() { /* Implementation for file uploads */ }
function handleFileUpload(e) { /* Implementation for file uploads */ }

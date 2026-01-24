// State
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
const surahTextCache = new Map();
const verseTimingsCache = new Map();
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
const playBtn = document.querySelector('.play-pause-btn');
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
    // Audio Events
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', handleTrackEnded);
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

    if (likeBtn) {
        likeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFavouriteForCurrentTrack();
        });
    }
}

// Navigation
function navigateTo(viewId) {
    document.querySelectorAll('.view').forEach(v => v.style.display = 'none');
    document.getElementById(viewId + '-view').style.display = 'block';

    document.querySelectorAll('nav li').forEach(li => li.classList.remove('active'));
    // Simple active state toggle based on click context usually, but here manual for now

    if (viewId === 'favourites') {
        renderFavourites();
    }
}

// Load Content
function loadFeatured() {
    const all = featuredSurahs.map(track => createCard(track)).join('');
    recitationsGrid.innerHTML = all;

    const featured = featuredSurahs.slice(0, 12).map(track => createCard(track)).join('');
    featuredGrid.innerHTML = featured;
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

// Player Logic
function playTrack(id) {
    let track = featuredSurahs.find(t => t.id === id);
    if (!track) {
        // Check library
        track = userLibrary.find(t => t.id === id);
    }

    if (track) {
        currentPlaylist = featuredSurahs; // Simplified queue logic
        currentTrackIndex = currentPlaylist.indexOf(track);

        shuffleHistory = [];

        currentTrack = track;

        loadTrackDetails(track);
        audio.src = getTrackAudioSrc(track);
        audio.play();
        isPlaying = true;
        updatePlayButton();
        const selectedReciter = getSelectedReciter();
        renderSurahText({ ...track, reciterId: selectedReciter?.id });
        syncLikeButton();
    }
}

function loadTrackDetails(track) {
    titleEl.textContent = track.title;
    if (track && track.reciter === 'تلاوة خاصة') {
        reciterEl.textContent = track.reciter;
    } else {
        const selectedReciter = getSelectedReciter();
        reciterEl.textContent = selectedReciter ? selectedReciter.name : '...';
    }
}

function getSelectedReciter() {
    if (!Array.isArray(reciters) || reciters.length === 0) return null;
    const savedId = localStorage.getItem(STORAGE_KEYS.selectedReciterId);
    const found = reciters.find(r => r.id === savedId);
    if (found && found.baseUrl) return found;
    return reciters.find(r => r.baseUrl) || null;
}

function setSelectedReciterId(reciterId) {
    localStorage.setItem(STORAGE_KEYS.selectedReciterId, reciterId);
}

function setupReciterPicker() {
    if (!reciterSelect || !Array.isArray(reciters)) return;

    reciterSelect.innerHTML = reciters
        .map(r => {
            const disabled = !r.baseUrl;
            const label = disabled ? `${r.name} (YouTube/SoundCloud)` : r.name;
            return `<option value="${r.id}" ${disabled ? 'disabled' : ''}>${label}</option>`;
        })
        .join('');

    const selected = getSelectedReciter();
    if (selected) reciterSelect.value = selected.id;

    if (reciterPickerInitialized) return;
    reciterPickerInitialized = true;

    reciterSelect.addEventListener('change', () => {
        const next = reciters.find(r => r.id === reciterSelect.value);
        if (!next || !next.baseUrl) {
            const current = getSelectedReciter();
            if (current) reciterSelect.value = current.id;
            return;
        }

        setSelectedReciterId(reciterSelect.value);

        if (currentTrack) {
            const wasPlaying = isPlaying;
            const previousTime = audio.currentTime || 0;

            loadTrackDetails(currentTrack);
            audio.src = getTrackAudioSrc(currentTrack);
            audio.addEventListener('loadedmetadata', () => {
                audio.currentTime = Math.min(previousTime, audio.duration || previousTime);
                if (wasPlaying) {
                    audio.play();
                }
            }, { once: true });
            const selectedReciter = getSelectedReciter();
            renderSurahText({ ...currentTrack, reciterId: selectedReciter?.id });
        } else {
            // Update UI reciter label even if nothing playing
            const selectedNow = getSelectedReciter();
            reciterEl.textContent = selectedNow ? selectedNow.name : '...';
        }

        loadFeatured();
        renderFavourites();
    });
}

async function loadMoreReciters() {
    if (!Array.isArray(reciters)) return;

    try {
        const res = await fetch('https://www.mp3quran.net/api/v3/reciters?language=ar');
        if (!res.ok) return;
        const data = await res.json();
        const list = Array.isArray(data?.reciters) ? data.reciters : [];

        const existing = new Set(reciters.map(r => String(r.id)));
        const added = [];

        for (const r of list) {
            if (!r || !r.id || !Array.isArray(r.moshaf)) continue;

            const m = r.moshaf.find(mo => mo && mo.moshaf_type === 11 && mo.surah_total === 114 && typeof mo.server === 'string' && mo.server);
            if (!m) continue;

            const id = `mp3q_${r.id}`;
            if (existing.has(id)) continue;

            added.push({
                id,
                name: r.name,
                baseUrl: m.server
            });
            existing.add(id);

            if (added.length >= 40) break;
        }

        if (added.length === 0) return;
        reciters.push(...added);
        setupReciterPicker();
        loadFeatured();
        renderFavourites();
    } catch {
        return;
    }
}

function normalizeArabicForSearch(input) {
    if (!input) return '';
    return String(input)
        .toLowerCase()
        .replace(/\u0640/g, '')
        .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g, '')
        .replace(/[إأآا]/g, 'ا')
        .replace(/ى/g, 'ي')
        .replace(/ؤ/g, 'و')
        .replace(/ئ/g, 'ي')
        .replace(/ة/g, 'ه')
        .replace(/\s+/g, ' ')
        .trim();
}

function getTrackAudioSrc(track) {
    // Uploaded tracks keep their own src
    if (track && track.reciter === 'تلاوة خاصة' && track.src) return track.src;

    const selectedReciter = getSelectedReciter();
    if (!track || !selectedReciter || typeof track.surahNumber !== 'number') return '';
    
    // Use mp3quran.net as initial source, will be replaced with synced audio in renderSurahText
    const padded = String(track.surahNumber).padStart(3, '0');
    return `${selectedReciter.baseUrl}${padded}.mp3`;
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
    if (!Array.isArray(currentPlaylist) || currentPlaylist.length === 0) return;

    if (isShuffleEnabled) {
        if (currentTrackIndex >= 0) shuffleHistory.push(currentTrackIndex);

        let nextIndex = currentTrackIndex;
        if (currentPlaylist.length === 1) {
            nextIndex = 0;
        } else {
            while (nextIndex === currentTrackIndex) {
                nextIndex = Math.floor(Math.random() * currentPlaylist.length);
            }
        }

        playTrack(currentPlaylist[nextIndex].id);
        return;
    }

    if (currentTrackIndex < currentPlaylist.length - 1) {
        playTrack(currentPlaylist[currentTrackIndex + 1].id);
        return;
    }

    if (isRepeatEnabled) {
        playTrack(currentPlaylist[0].id);
    }
}

function prevTrack() {
    if (!Array.isArray(currentPlaylist) || currentPlaylist.length === 0) return;

    if (isShuffleEnabled && shuffleHistory.length > 0) {
        const prevIndex = shuffleHistory.pop();
        if (typeof prevIndex === 'number' && prevIndex >= 0 && prevIndex < currentPlaylist.length) {
            playTrack(currentPlaylist[prevIndex].id);
        }
        return;
    }

    if (currentTrackIndex > 0) {
        playTrack(currentPlaylist[currentTrackIndex - 1].id);
        return;
    }

    if (isRepeatEnabled) {
        playTrack(currentPlaylist[currentPlaylist.length - 1].id);
    }
}

function handleTrackEnded() {
    nextTrack();
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

function toArabicIndicDigits(value) {
    const map = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
    return String(value).replace(/\d/g, d => map[Number(d)]);
}

async function fetchSurahUthmaniVerses(chapterNumber) {
    const n = Number(chapterNumber);
    if (!Number.isFinite(n) || n < 1 || n > 114) return [];
    if (surahTextCache.has(n)) return surahTextCache.get(n);

    const res = await fetch(`https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${n}`);
    if (!res.ok) return [];
    const data = await res.json();
    const verses = Array.isArray(data?.verses) ? data.verses : [];
    surahTextCache.set(n, verses);
    return verses;
}

async function fetchVerseTimings(reciterId, chapterNumber) {
    const key = `${reciterId}:${chapterNumber}`;
    if (verseTimingsCache.has(key)) return verseTimingsCache.get(key);

    // Get quranComId from reciter data
    const reciter = reciters.find(r => r.id === reciterId);
    const quranComId = reciter?.quranComId;
    
    // If reciter not available on Quran.com, we can't provide accurate sync
    if (!quranComId) {
        console.log('[fetchVerseTimings] reciter', reciterId, 'not available on Quran.com - no sync available');
        const result = { timings: [], audioUrl: null, syncAvailable: false };
        verseTimingsCache.set(key, result);
        return result;
    }

    try {
        // First try Quran.com v4 API (works for reciter ID 159 - Maher Al-Muaiqly)
        // This API returns 'timestamps' instead of 'verse_timings'
        const quranComRes = await fetch(`https://api.quran.com/api/v4/chapter_recitations/${quranComId}/${chapterNumber}?segments=true`);
        if (quranComRes.ok) {
            const quranComData = await quranComRes.json();
            const audioFile = quranComData?.audio_file;
            
            if (audioFile) {
                let audioUrl = audioFile?.audio_url || null;
                // Handle 'timestamps' format from Quran.com v4 API
                const timingsData = audioFile?.timestamps || audioFile?.verse_timings || [];
                
                // Add delay offset for Maher Al-Muaiqly (reciter ID 159) - 6 seconds intro delay
                const delayOffset = (quranComId === 159) ? 6.0 : 0;
                
                const timings = timingsData.map(vt => {
                    const verseKey = vt?.verse_key || '';
                    const parts = verseKey.split(':');
                    const ayahNum = parts.length === 2 ? parseInt(parts[1], 10) : null;
                    
                    // timestamps are in milliseconds, convert to seconds and add delay offset
                    const start = typeof vt?.timestamp_from === 'number' ? (vt.timestamp_from / 1000) + delayOffset : null;
                    const end = typeof vt?.timestamp_to === 'number' ? (vt.timestamp_to / 1000) + delayOffset : null;
                    
                    return { verse: ayahNum, start, end };
                }).filter(t => typeof t.verse === 'number' && t.verse >= 1 && t.start !== null && t.end !== null);
                
                if (timings.length > 0) {
                    const result = { timings, audioUrl, syncAvailable: true };
                    verseTimingsCache.set(key, result);
                    console.log('[fetchVerseTimings] timings from Quran.com v4 for', key, ':', timings.length, 'verses, delay:', delayOffset, 's');
                    return result;
                }
            }
        }
        
        // Fallback to QuranCDN API (for other reciters like Mishary, Sudais, etc.)
        const res = await fetch(`https://api.qurancdn.com/api/qdc/audio/reciters/${quranComId}/audio_files?chapter=${chapterNumber}&segments=true`);
        if (!res.ok) return { timings: [], audioUrl: null, syncAvailable: false };
        const data = await res.json();
        
        const audioFiles = data?.audio_files || [];
        if (audioFiles.length === 0) return { timings: [], audioUrl: null, syncAvailable: false };
        
        const audioFile = audioFiles[0];
        // audio_url may be a full URL or a relative path
        let audioUrl = audioFile?.audio_url || null;
        if (audioUrl && !audioUrl.startsWith('http')) {
            audioUrl = `https://audio.qurancdn.com/${audioUrl}`;
        }
        const verseTimingsData = audioFile?.verse_timings || [];
        
        const timings = verseTimingsData.map(vt => {
            const verseKey = vt?.verse_key || '';
            const parts = verseKey.split(':');
            const ayahNum = parts.length === 2 ? parseInt(parts[1], 10) : null;
            
            // timestamps are in milliseconds
            const start = typeof vt?.timestamp_from === 'number' ? vt.timestamp_from / 1000 : null;
            const end = typeof vt?.timestamp_to === 'number' ? vt.timestamp_to / 1000 : null;
            
            return { verse: ayahNum, start, end };
        }).filter(t => typeof t.verse === 'number' && t.verse >= 1 && t.start !== null && t.end !== null);
        
        const result = { timings, audioUrl, syncAvailable: true };
        verseTimingsCache.set(key, result);
        console.log('[fetchVerseTimings] timings for', key, ':', timings.length, 'verses');
        return result;
    } catch (e) {
        console.error('[fetchVerseTimings] error:', e);
        return { timings: [], audioUrl: null, syncAvailable: false };
    }
}

async function renderSurahText(track) {
    if (!quranDisplay) return;

    const chapterNumber = track && typeof track.surahNumber === 'number' ? track.surahNumber : null;
    if (!chapterNumber) {
        renderLyrics(track);
        return;
    }

    quranDisplay.innerHTML = '<p class="verse">جاري تحميل نص السورة...</p>';

    try {
        const [verses, timingsResult] = await Promise.all([
            fetchSurahUthmaniVerses(chapterNumber),
            fetchVerseTimings(track.reciterId || 'afs', chapterNumber)
        ]);
        
        const timings = timingsResult.timings || [];
        const syncedAudioUrl = timingsResult.audioUrl;
        const syncAvailable = timingsResult.syncAvailable;

        if (!Array.isArray(verses) || verses.length === 0) {
            quranDisplay.innerHTML = '<p class="verse">تعذر تحميل نص السورة.</p>';
            return;
        }

        // If sync is available, use the synced audio from Quran.com
        if (syncAvailable && syncedAudioUrl) {
            const wasPlaying = !audio.paused;
            audio.src = syncedAudioUrl;
            if (wasPlaying) audio.play();
        }
        // Otherwise, keep the mp3quran.net audio (no sync highlighting)

        quranDisplay.innerHTML = '';

        const timingsByVerse = new Map(timings.map(t => [t.verse, t]));

        verses.forEach(v => {
            const p = document.createElement('p');
            p.className = 'verse';

            const ayahNum = (v?.verse_key && String(v.verse_key).includes(':'))
                ? parseInt(String(v.verse_key).split(':')[1], 10)
                : null;

            if (ayahNum) {
                p.dataset.ayah = String(ayahNum);
                // Only apply timings if sync is available
                if (syncAvailable) {
                    const timing = timingsByVerse.get(ayahNum);
                    if (timing) {
                        p.dataset.time = String(timing.start);
                        p.dataset.endTime = String(timing.end);
                    }
                }
            }

            const suffix = ayahNum ? ` ﴿${toArabicIndicDigits(ayahNum)}﴾` : '';
            p.textContent = `${v?.text_uthmani || ''}${suffix}`;

            quranDisplay.appendChild(p);
        });
        
        if (!syncAvailable) {
            console.log('[renderSurahText] sync not available for this reciter - showing text only');
        }
        
        console.log('[renderSurahText] rendered', verses.length, 'verses, syncAvailable:', syncAvailable);
    } catch (e) {
        console.error('[renderSurahText] error:', e);
        quranDisplay.innerHTML = '<p class="verse">تعذر تحميل نص السورة.</p>';
    }
}

function syncLyrics() {
    const verses = document.querySelectorAll('.verse');
    let activeVerse = null;

    let hasTimedVerse = false;
    verses.forEach(verse => {
        const raw = verse.dataset.time;
        const time = typeof raw === 'string' ? parseFloat(raw) : NaN;
        if (Number.isFinite(time)) hasTimedVerse = true;
    });

    if (!hasTimedVerse) {
        document.querySelectorAll('.verse.active').forEach(v => v.classList.remove('active'));
        return;
    }

    // Use current time in seconds for comparison
    const currentTime = audio.currentTime;
    
    // Find the verse with the most recent start time that hasn't ended yet
    let latestStartTime = -1;
    verses.forEach(verse => {
        const time = parseFloat(verse.dataset.time);
        const endTime = parseFloat(verse.dataset.endTime);

        const endBuffer = 0.35; // seconds
        const bufferedEnd = Number.isFinite(endTime) ? endTime + endBuffer : endTime;

        if (Number.isFinite(time) && Number.isFinite(bufferedEnd) && currentTime >= time && currentTime <= bufferedEnd && time > latestStartTime) {
            activeVerse = verse;
            latestStartTime = time;
        }
    });

    if (activeVerse) {
        const wasActive = activeVerse.classList.contains('active');
        if (!wasActive) {
            document.querySelectorAll('.verse.active').forEach(v => v.classList.remove('active'));
            activeVerse.classList.add('active');
            activeVerse.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
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
    isShuffleEnabled = !isShuffleEnabled;
    if (btn) btn.classList.toggle('active', isShuffleEnabled);
}

function toggleRepeat() {
    const btn = document.querySelector('button[onclick="toggleRepeat()"]');
    isRepeatEnabled = !isRepeatEnabled;
    if (btn) btn.classList.toggle('active', isRepeatEnabled);
}

function setupSearch() {
    const searchInput = document.querySelector('.search-input');
    const searchResults = document.getElementById('search-results');
    if (!searchInput || !searchResults) return;

    const render = () => {
        const raw = (searchInput.value || '').trim();
        const q = normalizeArabicForSearch(raw);

        let results = featuredSurahs;
        if (q) {
            const numeric = Number(raw);
            if (!Number.isNaN(numeric) && Number.isFinite(numeric)) {
                results = featuredSurahs.filter(t => t.surahNumber === numeric);
            } else {
                results = featuredSurahs.filter(t => {
                    const title = normalizeArabicForSearch(String(t.title || ''));
                    const withoutPrefix = title.replace(/^سوره?\s+/g, '');
                    return title.includes(q) || withoutPrefix.includes(q);
                });
            }
        }

        searchResults.innerHTML = results.map(t => createCard(t)).join('');
    };

    searchInput.addEventListener('input', render);
    render();
}

function playLibraryTrack(id) {
    const track = userLibrary.find(t => t.id === id);
    if (track) {
        currentPlaylist = userLibrary;
        currentTrackIndex = userLibrary.indexOf(track);
        currentTrack = track;
        loadTrackDetails(track);
        audio.src = track.src;
        audio.play();
        isPlaying = true;
        updatePlayButton();
        renderLyrics(track);
        syncLikeButton();
    }
}

function getFavouriteSurahIds() {
    try {
        const raw = localStorage.getItem(STORAGE_KEYS.favouriteSurahIds);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function setFavouriteSurahIds(ids) {
    localStorage.setItem(STORAGE_KEYS.favouriteSurahIds, JSON.stringify(ids));
}

function isTrackFavouritable(track) {
    return !!track && typeof track.surahNumber === 'number';
}

function isCurrentTrackFavourited() {
    if (!isTrackFavouritable(currentTrack)) return false;
    const ids = getFavouriteSurahIds();
    return ids.includes(currentTrack.id);
}

function toggleFavouriteForCurrentTrack() {
    if (!isTrackFavouritable(currentTrack)) return;
    const ids = getFavouriteSurahIds();
    const exists = ids.includes(currentTrack.id);
    const next = exists ? ids.filter(id => id !== currentTrack.id) : [...ids, currentTrack.id];
    setFavouriteSurahIds(next);
    syncLikeButton();
    renderFavourites();
}

function syncLikeButton() {
    if (!likeBtn) return;
    const icon = likeBtn.querySelector('i');

    if (!isTrackFavouritable(currentTrack)) {
        likeBtn.classList.remove('liked');
        if (icon) {
            icon.classList.remove('ph-fill');
            icon.classList.add('ph');
            icon.classList.remove('ph-heart-straight');
            icon.classList.add('ph-heart');
        }
        likeBtn.disabled = true;
        return;
    }

    likeBtn.disabled = false;
    const liked = isCurrentTrackFavourited();
    likeBtn.classList.toggle('liked', liked);
    if (icon) {
        icon.classList.toggle('ph-fill', liked);
        icon.classList.toggle('ph', !liked);
        icon.classList.remove('ph-heart-straight');
        icon.classList.add('ph-heart');
    }
}

function renderFavourites() {
    if (!favouritesGrid) return;
    const ids = getFavouriteSurahIds();
    const tracks = featuredSurahs.filter(t => ids.includes(t.id));

    if (tracks.length === 0) {
        favouritesGrid.innerHTML = '';
        return;
    }

    favouritesGrid.innerHTML = tracks.map(track => createCard(track)).join('');
}

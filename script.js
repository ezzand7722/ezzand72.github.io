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

// Ayah Range Repeat State (for memorization)
let ayahRangeStart = null;
let ayahRangeEnd = null;
let isAyahRangeActive = false;
let currentTimings = [];  // Store current track timings for range looping
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

// Custom local reciter audio/timings data (for reciters like Hussein Azzam without mp3quran.net support)
// Hussain Azzam now fetches timestamps dynamically from Supabase storage
const customReciterAudio = {
    'husein_azzam': {
        // Dynamic - handled by fetchHussainAzzamTimings()
    }
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

    // Update sidebar active state
    document.querySelectorAll('nav li').forEach(li => li.classList.remove('active'));

    // Update mobile nav active state
    document.querySelectorAll('.mobile-nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('onclick')?.includes(viewId)) {
            btn.classList.add('active');
        }
    });

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

// Helper function to check if reciter has any content available
function hasReciterContent(reciter) {
    if (reciter.baseUrl) return true;
    // Hussain Azzam fetches content dynamically from Supabase
    if (reciter.id === 'husein_azzam') return true;
    // Check if reciter has custom local audio for any surah
    const customData = customReciterAudio[reciter.id];
    return customData && Object.keys(customData).length > 0;
}

function getSelectedReciter() {
    if (!Array.isArray(reciters) || reciters.length === 0) return null;
    const savedId = localStorage.getItem(STORAGE_KEYS.selectedReciterId);
    const found = reciters.find(r => r.id === savedId);
    if (found && hasReciterContent(found)) return found;
    return reciters.find(r => hasReciterContent(r)) || null;
}

function setSelectedReciterId(reciterId) {
    localStorage.setItem(STORAGE_KEYS.selectedReciterId, reciterId);
}

function setupReciterPicker() {
    if (!reciterSelect || !Array.isArray(reciters)) return;

    reciterSelect.innerHTML = reciters
        .map(r => {
            const hasContent = hasReciterContent(r);
            const disabled = !hasContent;
            let label = r.name;
            if (!r.baseUrl && hasContent) {
                // Custom reciter with limited content
                label = `${r.name} (محتوى محدد)`;
            } else if (disabled) {
                label = `${r.name} (YouTube/SoundCloud)`;
            }
            return `<option value="${r.id}" ${disabled ? 'disabled' : ''}>${label}</option>`;
        })
        .join('');

    const selected = getSelectedReciter();
    if (selected) reciterSelect.value = selected.id;


    if (reciterPickerInitialized) return;
    reciterPickerInitialized = true;

    reciterSelect.addEventListener('change', () => {
        const next = reciters.find(r => r.id === reciterSelect.value);
        if (!next || !hasReciterContent(next)) {
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

    // Handle Hussain Azzam dynamically - audio from Supabase storage
    if (selectedReciter.id === 'husein_azzam') {
        return `https://globdesovygfvvyuzrvy.supabase.co/storage/v1/object/public/timestamps/hussain_azzam_${track.surahNumber}.mp3`;
    }

    // Check for custom local audio for reciters without baseUrl
    const customData = customReciterAudio[selectedReciter.id];
    if (customData && customData[track.surahNumber]) {
        return customData[track.surahNumber].audioFile;
    }

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
    // If ayah range is active, loop back to start of range
    if (isAyahRangeActive && currentTimings.length > 0) {
        const rangeStart = currentTimings.find(t => t.verse === ayahRangeStart);
        if (rangeStart) {
            audio.currentTime = rangeStart.start;
            audio.play();
            return;
        }
    }
    nextTrack();
}

// Skip Forward/Backward Functions
function skipForward(seconds) {
    if (audio && audio.duration) {
        audio.currentTime = Math.min(audio.currentTime + seconds, audio.duration);
    }
}

function skipBackward(seconds) {
    if (audio) {
        audio.currentTime = Math.max(audio.currentTime - seconds, 0);
    }
}

// Ayah Range Repeat Functions (for memorization)
function setAyahRange() {
    const startInput = document.getElementById('ayah-start');
    const endInput = document.getElementById('ayah-end');
    const statusEl = document.getElementById('ayah-range-status');

    const start = parseInt(startInput.value, 10);
    const end = parseInt(endInput.value, 10);

    if (!start || !end || start < 1 || end < 1 || start > end) {
        statusEl.textContent = 'خطأ في الآيات';
        statusEl.classList.remove('active');
        return;
    }

    ayahRangeStart = start;
    ayahRangeEnd = end;
    isAyahRangeActive = true;

    // Jump to start of range if we have timings
    if (currentTimings.length > 0) {
        const rangeStart = currentTimings.find(t => t.verse === start);
        if (rangeStart) {
            audio.currentTime = rangeStart.start;
        }
    }

    statusEl.textContent = `تكرار ${start} - ${end}`;
    statusEl.classList.add('active');

    // Add visual indicator to the repeat button
    const repeatBtn = document.getElementById('repeat-btn');
    if (repeatBtn) repeatBtn.classList.add('active');

    console.log('[setAyahRange] Range set:', start, '-', end);
}

function clearAyahRange() {
    ayahRangeStart = null;
    ayahRangeEnd = null;
    isAyahRangeActive = false;

    const startInput = document.getElementById('ayah-start');
    const endInput = document.getElementById('ayah-end');
    const statusEl = document.getElementById('ayah-range-status');

    if (startInput) startInput.value = '';
    if (endInput) endInput.value = '';
    if (statusEl) {
        statusEl.textContent = '';
        statusEl.classList.remove('active');
    }

    // Remove visual indicator from the repeat button (if not in full repeat mode)
    if (!isRepeatEnabled) {
        const repeatBtn = document.getElementById('repeat-btn');
        if (repeatBtn) repeatBtn.classList.remove('active');
    }

    console.log('[clearAyahRange] Range cleared');
}

// Check if playback should loop within ayah range
function checkAyahRangeLoop() {
    if (!isAyahRangeActive || currentTimings.length === 0) return;

    const rangeEnd = currentTimings.find(t => t.verse === ayahRangeEnd);
    if (rangeEnd && audio.currentTime >= rangeEnd.end) {
        const rangeStart = currentTimings.find(t => t.verse === ayahRangeStart);
        if (rangeStart) {
            audio.currentTime = rangeStart.start;
        }
    }
}

function updateProgress() {
    seekBar.value = audio.currentTime;
    currentTimeEl.textContent = formatTime(audio.currentTime);
    syncLyrics();
    checkAyahRangeLoop();  // Check if we need to loop within ayah range
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
    const map = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
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



// Cache for custom local timings
const customTimingsCache = new Map();

// Fetch Hussain Azzam timestamps from Supabase storage
async function fetchHussainAzzamTimings(chapterNumber) {
    const key = `husein_azzam:${chapterNumber}`;
    if (customTimingsCache.has(key)) return customTimingsCache.get(key);

    const url = `https://globdesovygfvvyuzrvy.supabase.co/storage/v1/object/public/timestamps/hussain_azzam_${chapterNumber}.json?t=${new Date().getTime()}`;

    // Construct audio URL and offset
    const audioFile = `https://globdesovygfvvyuzrvy.supabase.co/storage/v1/object/public/timestamps/hussain_azzam_${chapterNumber}.mp3`;
    let audioStartOffset = 0;

    try {
        const res = await fetch(url);
        if (!res.ok) {
            console.log('[fetchHussainAzzamTimings] Timestamps not found for Surah', chapterNumber, '- falling back to audio only');
            // Return audio without sync if timestamps missing
            const result = {
                timings: [],
                audioUrl: audioFile,
                syncAvailable: false,
                notAvailable: false,
                isLocal: true,
                audioStartOffset
            };
            customTimingsCache.set(key, result);
            return result;
        }

        const timingsData = await res.json();

        if (timingsData && typeof timingsData.offset === 'number') {
            audioStartOffset = timingsData.offset;
        }

        if (!timingsData || !Array.isArray(timingsData)) {
            console.error('[fetchHussainAzzamTimings] Invalid timing data for surah', chapterNumber);
            // Fallback to audio only
            const result = {
                timings: [],
                audioUrl: audioFile,
                syncAvailable: false,
                notAvailable: false,
                isLocal: true,
                audioStartOffset
            };
            customTimingsCache.set(key, result);
            return result;
        }

        // Convert the timing format to our standard format
        const timings = timingsData.map(t => ({
            verse: t.ayah,
            start: t.start_time,
            end: t.end_time
        })).filter(t => typeof t.verse === 'number' && t.verse >= 1 && t.start !== null && t.end !== null);

        const result = {
            timings,
            audioUrl: audioFile,
            syncAvailable: true,
            isLocal: true,
            audioStartOffset
        };

        customTimingsCache.set(key, result);
        console.log('[fetchHussainAzzamTimings] loaded timings for surah', chapterNumber, ':', timings.length, 'verses');
        return result;
    } catch (e) {
        console.error('[fetchHussainAzzamTimings] error fetching timings:', e);
        // Fallback to audio only on error
        const result = {
            timings: [],
            audioUrl: audioFile,
            syncAvailable: false,
            notAvailable: false,
            audioStartOffset
        };
        customTimingsCache.set(key, result);
        return result;
    }
}

async function fetchCustomLocalTimings(reciterId, chapterNumber) {
    const key = `${reciterId}:${chapterNumber}`;
    if (customTimingsCache.has(key)) return customTimingsCache.get(key);

    // Special handling for Hussain Azzam - fetch from Supabase
    if (reciterId === 'husein_azzam') {
        return fetchHussainAzzamTimings(chapterNumber);
    }

    const reciterData = customReciterAudio[reciterId];
    if (!reciterData || !reciterData[chapterNumber]) {
        return null;
    }

    const surahData = reciterData[chapterNumber];

    // Use embedded timing data instead of fetching (fixes CORS issues when running from file://)
    const timingsData = typeof surahData.getTimingsData === 'function' ? surahData.getTimingsData() : null;

    if (!timingsData || !Array.isArray(timingsData)) {
        console.error('[fetchCustomLocalTimings] No embedded timing data found for', key);
        return null;
    }

    try {
        // Convert the timing format to our standard format (only timing data needed)
        const timings = timingsData.map(t => ({
            verse: t.ayah,
            start: t.start_time,
            end: t.end_time
        })).filter(t => typeof t.verse === 'number' && t.verse >= 1 && t.start !== null && t.end !== null);

        const result = {
            timings,
            audioUrl: surahData.audioFile,
            syncAvailable: true,
            isLocal: true
        };

        customTimingsCache.set(key, result);
        console.log('[fetchCustomLocalTimings] loaded embedded timings for', key, ':', timings.length, 'verses');
        return result;
    } catch (e) {
        console.error('[fetchCustomLocalTimings] error processing embedded timings:', e);
        return null;
    }
}

async function fetchVerseTimings(reciterId, chapterNumber) {
    const key = `${reciterId}:${chapterNumber}`;
    if (verseTimingsCache.has(key)) return verseTimingsCache.get(key);

    // Get quranComId from reciter data
    const reciter = reciters.find(r => r.id === reciterId);
    const quranComId = reciter?.quranComId;

    // First check for custom local timings (for reciters like Hussein Azzam)
    const customTimings = await fetchCustomLocalTimings(reciterId, chapterNumber);
    if (customTimings) {
        verseTimingsCache.set(key, customTimings);
        return customTimings;
    }

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
        // Always fetch Uthmani text from API (regardless of reciter)
        // Local timing data is only used for timestamps, not verse text
        const [verses, timingsResult] = await Promise.all([
            fetchSurahUthmaniVerses(chapterNumber),
            fetchVerseTimings(track.reciterId || 'afs', chapterNumber)
        ]);

        const timings = timingsResult.timings || [];
        const syncedAudioUrl = timingsResult.audioUrl;
        const syncAvailable = timingsResult.syncAvailable;
        const notAvailable = timingsResult.notAvailable || false;

        // Store timings globally for ayah range looping
        currentTimings = timings;

        // Check if this reciter's recitation is not available for this surah
        if (notAvailable) {
            quranDisplay.innerHTML = '<p class="verse" style="text-align: center; color: #ff6b6b;">التلاوة غير متوفرة لهذه السورة</p>';
            // Stop audio playback for unavailable recitations
            audio.pause();
            audio.src = '';
            return;
        }

        if (!Array.isArray(verses) || verses.length === 0) {
            quranDisplay.innerHTML = '<p class="verse">تعذر تحميل نص السورة.</p>';
            return;
        }

        // If sync is available and not a local file, use the synced audio from Quran.com
        // For local files (isLocal=true), the audio is already set correctly by getTrackAudioSrc
        if (syncAvailable && syncedAudioUrl && !timingsResult.isLocal) {
            const wasPlaying = !audio.paused;
            audio.src = syncedAudioUrl;
            if (wasPlaying) audio.play();
        }

        // Apply audio start offset if specified (e.g., for Hussain Azzam Surah 14)
        const audioStartOffset = timingsResult.audioStartOffset || 0;
        if (audioStartOffset > 0 && timingsResult.isLocal) {
            audio.addEventListener('loadedmetadata', () => {
                if (audio.currentTime < audioStartOffset) {
                    audio.currentTime = audioStartOffset;
                }
            }, { once: true });
            // Also set immediately in case metadata is already loaded
            if (audio.readyState >= 1 && audio.currentTime < audioStartOffset) {
                audio.currentTime = audioStartOffset;
            }
        }
        // Otherwise, keep the current audio (mp3quran.net or local custom audio)

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

                        // Click to seek
                        p.style.cursor = 'pointer';
                        p.onclick = () => {
                            audio.currentTime = timing.start;
                            if (audio.paused) audio.play();
                        };
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

// ============================================
// Reading Practice Mode
// ============================================

// Reading State
let recognition = null;
let isReadingModeOpen = false;
let isListening = false;
let readingVerses = [];
let currentVerseIndex = 0;
let currentWordIndex = 0;
let correctCount = 0;
let totalAttempts = 0;
let selectedReadingSurah = null;

// DOM Elements for Reading Mode
const readingOverlay = document.getElementById('reading-practice-view');
const readingSurahSelect = document.getElementById('reading-surah-select');
const readingDisplay = document.getElementById('reading-display');
const micBtn = document.getElementById('mic-btn');
const micIcon = document.getElementById('mic-icon');
const micStatus = document.getElementById('mic-status');
const readingVerseCount = document.getElementById('reading-verse-count');
const readingAccuracy = document.getElementById('reading-accuracy');
const readingProgressFill = document.getElementById('reading-progress-fill');

// Initialize Speech Recognition
function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        console.error('Speech Recognition not supported in this browser');
        return null;
    }

    const rec = new SpeechRecognition();
    rec.lang = 'ar-SA'; // Arabic (Saudi Arabia)
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    rec.onstart = () => {
        console.log('[Speech Recognition] Started');
        isListening = true;
        updateMicButton();
        if (micStatus) micStatus.textContent = 'جاري الاستماع...';
        const transcriptEl = document.getElementById('live-transcript');
        if (transcriptEl) transcriptEl.innerHTML = '<span style="color: #888;">جاري الاستماع...</span>';
    };

    rec.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
            } else {
                interimTranscript += event.results[i][0].transcript;
            }
        }

        console.log('[Speech Recognition] Interim:', interimTranscript);
        console.log('[Speech Recognition] Final:', finalTranscript);

        // Show interim text for feedback
        const transcriptEl = document.getElementById('live-transcript');
        if (transcriptEl) {
            if (finalTranscript || interimTranscript) {
                transcriptEl.innerHTML = `
                    <span style="color: white; font-weight: bold;">${finalTranscript}</span>
                    <span style="color: #aaa;">${interimTranscript}</span>
                 `;
            }
        }

        if (micStatus && (interimTranscript || finalTranscript)) {
            micStatus.textContent = 'جاري الاستماع...';
        }

        // Process final results
        if (finalTranscript) {
            processReadingResult([finalTranscript]);
        }
    };

    rec.onerror = (event) => {
        console.error('[Speech Recognition] Error:', event.error);

        // Don't stop for no-speech, just stay listening equivalent
        if (event.error === 'no-speech') {
            console.log('[Speech Recognition] No speech detected - keeping alive');
            return;
        }

        // For other errors, we might need to stop
        if (event.error === 'not-allowed') {
            alert('يرجى السماح بصلاحية استخدام الميكروفون للمتابعة.');
            isListening = false;
            updateMicButton();
        } else {
            // Try to restart if it crashes? Or just stop.
            // For now, let's stop and let user restart
            isListening = false;
            updateMicButton();
            if (micStatus) micStatus.textContent = 'حدث خطأ: ' + event.error;
        }
    };

    rec.onend = () => {
        console.log('[Speech Recognition] Ended');
        // If we are supposed to be listening (and it wasn't a deliberate stop), restart with a delay
        if (isListening) {
            console.log('[Speech Recognition] Connection dropped, restarting in 100ms...');
            setTimeout(() => {
                if (isListening) {
                    try {
                        rec.start();
                        console.log('[Speech Recognition] Restarted successfully');
                    } catch (e) {
                        console.log('Error restarting:', e);
                        isListening = false;
                        updateMicButton();
                    }
                }
            }, 100);
            return;
        }

        isListening = false;
        updateMicButton();
    };

    return rec;
}

// Toggle Reading Mode
function toggleReadingMode() {
    isReadingModeOpen = !isReadingModeOpen;

    if (isReadingModeOpen) {
        readingOverlay.style.display = 'flex';
        setupReadingMode();
    } else {
        readingOverlay.style.display = 'none';
        stopListening();
    }
}

// Setup Reading Mode
function setupReadingMode() {
    const readingSurahInput = document.getElementById('reading-surah-input');
    const readingSurahList = document.getElementById('reading-surah-list');

    // Populate Surah list if empty
    if (readingSurahList && readingSurahList.innerHTML === '') {
        readingSurahList.innerHTML = featuredSurahs.map((surah) => {
            return `<option value="${surah.title}">`;
        }).join('');
    }

    // Add event listener for Surah input (change)
    if (readingSurahInput && !readingSurahInput.dataset.listenerAttached) {
        readingSurahInput.addEventListener('change', () => {
            const selectedTitle = readingSurahInput.value;
            const selectedIndex = featuredSurahs.findIndex(s => s.title === selectedTitle);

            if (selectedIndex !== -1) {
                console.log('[Reading Mode] Surah selected:', selectedTitle, 'index:', selectedIndex);
                loadReadingSurah(selectedIndex);
            } else {
                console.log('[Reading Mode] Invalid Surah selection:', selectedTitle);
            }
        });

        // Also handle input event for clearer UX (optional, but 'change' covers selection)
        readingSurahInput.dataset.listenerAttached = 'true';
        console.log('[Reading Mode] Surah input listener attached');
    }

    // Initialize speech recognition
    if (!recognition) {
        recognition = initSpeechRecognition();
        if (!recognition) {
            alert('عذراً، متصفحك لا يدعم التعرف على الصوت. يرجى استخدام Google Chrome.');
            toggleReadingMode();
            return;
        }
    }

    // Load first surah if available and no verses loaded yet (and set input value)
    if (readingSurahInput && readingVerses.length === 0 && featuredSurahs.length > 0) {
        // Default to first surah
        // readingSurahInput.value = featuredSurahs[0].title;
        // loadReadingSurah(0); 
        // Or keep empty to force choice? Let's keep behavior consistent: load first.

        // Actually, let's load empty initially or placeholder?
        // Let's load the first one for convenience but maybe clear the text?
        // Better: Set value to first surah title and load it.
        // readingSurahInput.value = featuredSurahs[0].title;
        // loadReadingSurah(0);

        // Wait, original code loaded logic was:
        // if (select.value) load...

        // Let's NOT auto-load to avoid confusion if input is empty.
        // Or auto-load Surah Fatiha (index 0).
    }
}

// Load Surah for Reading
async function loadReadingSurah(surahIndex) {
    if (surahIndex < 0 || surahIndex >= featuredSurahs.length) return;

    selectedReadingSurah = featuredSurahs[surahIndex];
    const chapterNumber = selectedReadingSurah.surahNumber;

    readingDisplay.innerHTML = '<p class="reading-verse">جاري تحميل السورة...</p>';

    try {
        const verses = await fetchSurahUthmaniVerses(chapterNumber);

        if (!verses || verses.length === 0) {
            readingDisplay.innerHTML = '<p class="reading-verse">تعذر تحميل السورة.</p>';
            return;
        }

        readingVerses = verses.map(v => {
            const ayahNum = (v?.verse_key && String(v.verse_key).includes(':'))
                ? parseInt(String(v.verse_key).split(':')[1], 10)
                : null;

            const text = v.text_uthmani || '';

            // Quranic stop/pause signs (waqf marks) - these are NOT words to recite
            const waqfSigns = /^[\u06D6-\u06ED\u0600-\u0605\u061B-\u061F\u066A-\u066D\u06DD\u06DE\u06E9۞۩ۣۖۗۘۙۚۛۜ۟۠ۡۢۤۥۦ۪ۭۧۨ]+$/;

            // Split into words and filter out waqf signs
            const words = text.split(/\s+/)
                .filter(w => w.length > 0)
                .filter(w => !waqfSigns.test(w))  // Remove standalone waqf signs
                .map(word => ({
                    text: word,  // Original with harakat
                    normalized: normalizeArabicForMatching(word),  // Without harakat for loose matching
                    status: 'pending'  // pending, correct, incorrect
                }));

            return {
                ayah: ayahNum,
                text: text,
                words: words,
                status: 'pending'
            };
        }).filter(v => v.ayah && v.words.length > 0);

        currentVerseIndex = 0;
        currentWordIndex = 0;
        correctCount = 0;
        totalAttempts = 0;

        renderReadingVerses();
        updateReadingProgress();

        console.log('[Reading Mode] Loaded', readingVerses.length, 'verses for Surah', chapterNumber);
    } catch (e) {
        console.error('[Reading Mode] Error loading surah:', e);
        readingDisplay.innerHTML = '<p class="reading-verse">حدث خطأ في التحميل.</p>';
    }
}

// Render Reading Verses
function renderReadingVerses() {
    if (!readingDisplay || readingVerses.length === 0) return;

    readingDisplay.innerHTML = readingVerses.map((verse, vIndex) => {
        let verseClass = 'reading-verse';
        if (vIndex === currentVerseIndex) {
            verseClass += ' verse-active';
        } else if (verse.status === 'correct') {
            verseClass += ' verse-correct';
        }

        // Render each word with its status
        const wordsHtml = verse.words.map((word, wIndex) => {
            let wordClass = 'reading-word';
            if (vIndex === currentVerseIndex) {
                if (word.status === 'correct') {
                    wordClass += ' word-correct';
                } else if (word.status === 'incorrect') {
                    wordClass += ' word-incorrect';
                } else if (wIndex === currentWordIndex) {
                    wordClass += ' word-current';
                }
            } else if (verse.status === 'correct') {
                wordClass += ' word-correct';
            }
            return `<span class="${wordClass}">${word.text}</span>`;
        }).join(' ');

        return `<p class="${verseClass}" data-index="${vIndex}">${wordsHtml} <span class="verse-number">(${verse.ayah})</span></p>`;
    }).join('');

    // Auto-scroll to active verse
    setTimeout(() => {
        const activeVerse = readingDisplay.querySelector('.verse-active');
        if (activeVerse) {
            activeVerse.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, 100);
}

// Toggle Microphone
function toggleMicrophone() {
    if (!recognition) {
        alert('عذراً، ميزة التعرف على الصوت غير متاحة.');
        return;
    }

    if (readingVerses.length === 0) {
        alert('يرجى اختيار سورة أولاً.');
        return;
    }

    if (currentVerseIndex >= readingVerses.length) {
        alert('لقد أنهيت السورة! يمكنك إعادة التعيين للبدء من جديد.');
        return;
    }

    if (isListening) {
        stopListening();
    } else {
        startListening();
    }
}

// Start Listening
function startListening() {
    if (!recognition || isListening) return;

    try {
        recognition.start();
        console.log('[Reading Mode] Started listening for verse', currentVerseIndex + 1);
    } catch (e) {
        console.error('[Reading Mode] Error starting recognition:', e);
    }
}

// Stop Listening
function stopListening() {
    if (!recognition || !isListening) return;

    try {
        recognition.stop();
    } catch (e) {
        console.error('[Reading Mode] Error stopping recognition:', e);
    }
}

// Update Mic Button
function updateMicButton() {
    if (!micBtn || !micIcon || !micStatus) return;

    micBtn.classList.remove('listening', 'processing');

    if (isListening) {
        micBtn.classList.add('listening');
        micStatus.textContent = 'جاري الاستماع...';
        micIcon.className = 'ph-fill ph-microphone-slash';
    } else {
        micStatus.textContent = 'اضغط للبدء';
        micIcon.className = 'ph-fill ph-microphone';
    }
}

// Process Reading Result - Word by Word
function processReadingResult(alternatives) {
    if (currentVerseIndex >= readingVerses.length) return;

    const currentVerse = readingVerses[currentVerseIndex];
    if (!currentVerse.words || currentWordIndex >= currentVerse.words.length) return;

    // Get all spoken words from alternatives
    let spokenWords = [];
    for (const alt of alternatives) {
        const words = alt.split(/\s+/).filter(w => w.length > 0);
        spokenWords.push(...words);
    }

    console.log('[Reading Mode] Spoken words:', spokenWords);

    let matchedCount = 0;

    // Iterate through spoken words one by one
    for (const spokenWord of spokenWords) {
        if (currentWordIndex >= currentVerse.words.length) break;

        const currentTarget = currentVerse.words[currentWordIndex];
        const spokenNorm = normalizeArabicForMatching(spokenWord);

        // 1. Check against CURRENT word
        let matchResult = checkWordMatch(currentTarget.normalized, spokenNorm);

        if (matchResult.isMatch) {
            console.log(`[Reading Mode] MATCH Current: "${spokenWord}" matches "${currentTarget.text}"`);
            currentTarget.status = 'correct';
            currentWordIndex++;
            matchedCount++;
            correctCount++;
            continue; // Move to next spoken word
        }

        // 2. Check for BACKTRACKING (check previous 3 words)
        // If user says a word we recently passed, move pointer back to follow them
        let backtracked = false;
        const lookBackLimit = Math.min(3, currentWordIndex);

        for (let b = 1; b <= lookBackLimit; b++) {
            const prevIndex = currentWordIndex - b;
            const prevWord = currentVerse.words[prevIndex];

            let prevMatch = checkWordMatch(prevWord.normalized, spokenNorm);
            if (prevMatch.isMatch) {
                console.log(`[Reading Mode] BACKTRACK: User said "${spokenWord}" (index ${prevIndex}). Moving pointer to ${prevIndex + 1}`);

                // User repeated a previous word. 
                // We accept it, and set the pointer to the NEXT word after it.
                // Reset status of words in between? No, keep them correct, just move the "current" pointer.
                currentWordIndex = prevIndex + 1;
                backtracked = true;
                break;
            }
        }

        if (backtracked) continue;

        // 3. If no match (current or previous), it's a mistake on the CURRENT word
        console.log(`[Reading Mode] MISMATCH: "${spokenWord}" vs "${currentTarget.text}" (${matchResult.similarity.toFixed(2)})`);

        // Mark as incorrect and STOP processing further spoken words
        currentTarget.status = 'incorrect';
        totalAttempts++;

        // Show what went wrong
        const transcriptEl = document.getElementById('live-transcript');
        if (transcriptEl) {
            transcriptEl.innerHTML = `
                <div style="color: #ff6b6b; font-weight: bold;">❌ خطأ في الكلمة</div>
                <div style="margin-top: 8px;">المتوقع: <span style="color: #51cf66;">${currentTarget.text}</span></div>
                <div>ما قلته: <span style="color: #ff6b6b;">${spokenWord}</span></div>
            `;
        }

        renderReadingVerses();

        // Reset incorrect status after delay
        setTimeout(() => {
            if (currentTarget.status === 'incorrect') {
                currentTarget.status = 'pending';
                renderReadingVerses();
            }
        }, 2000);
        return; // STOP! verification failed
    }

    totalAttempts++;

    // Update live transcript with progress (if successful)
    const transcriptEl = document.getElementById('live-transcript');
    if (transcriptEl && matchedCount > 0) {
        const remaining = currentVerse.words.length - currentWordIndex;
        transcriptEl.innerHTML = `
            <div style="color: #51cf66;">✓ ${matchedCount} كلمة صحيحة</div>
            <div style="margin-top: 5px; color: #aaa;">متبقي: ${remaining} كلمة</div>
        `;
    }

    // Check if verse is complete
    if (currentWordIndex >= currentVerse.words.length) {
        currentVerse.status = 'correct';

        setTimeout(() => {
            if (currentVerseIndex < readingVerses.length - 1) {
                currentVerseIndex++;
                currentWordIndex = 0;
                renderReadingVerses();
                updateReadingProgress();
            } else {
                alert('مبارك! لقد أتممت السورة بنجاح!');
                updateReadingProgress();
            }
        }, 800);
    }

    renderReadingVerses();
    updateReadingProgress();
}

// Check word match with dynamic strictness
function checkWordMatch(expectedNorm, spokenNorm) {
    const similarity = calculateWordSimilarity(expectedNorm, spokenNorm);
    const len = expectedNorm.length;

    // Stricter thresholds for shorter words to avoid false positives
    let threshold = 0.5; // Default (was 0.4)
    if (len <= 2) threshold = 0.95;     // Very short: Extremely strict
    else if (len <= 4) threshold = 0.8; // Short words: Strict (was 0.7)

    return {
        isMatch: similarity >= threshold,
        similarity: similarity
    };
}

// Calculate word similarity (character-level)
function calculateWordSimilarity(str1, str2) {
    if (!str1 && !str2) return 1;
    if (!str1 || !str2) return 0;
    if (str1 === str2) return 1;

    // Check if one contains the other - but ONLY if length difference is small
    // This prevents "La" matching "WaLa" via inclusion
    if (str1.includes(str2) || str2.includes(str1)) {
        const lenDiff = Math.abs(str1.length - str2.length);
        if (lenDiff <= 1) return 0.9; // Almost exact
        return 0.6; // Penalty for extra characters even if included
    }

    // Character-level comparison
    const len1 = str1.length;
    const len2 = str2.length;
    let matches = 0;
    const minLen = Math.min(len1, len2);

    for (let i = 0; i < minLen; i++) {
        if (str1[i] === str2[i]) matches++;
    }

    return matches / Math.max(len1, len2);
}

// Normalize Arabic Text for Matching
function normalizeArabicForMatching(text) {
    if (!text) return '';

    // First handle specific Quranic characters before stripping diacritics
    let normalized = String(text)
        .replace(/\u0670/g, 'ا')  // Superscript Alef (Dagger Alef) -> Alef
        .replace(/ٱ/g, 'ا');      // Alef Wasla -> Alef

    // Fix specific words where standard dictation omits the Alef
    // "Dhalika" -> "Dhalika" (not Dhaalika)
    normalized = normalized
        .replace(/ذالك/g, 'ذلك')
        .replace(/هاذا/g, 'هذا')
        .replace(/لاكن/g, 'لكن')
        .replace(/الرحمان/g, 'الرحمن')
        .replace(/اللله/g, 'الله') // Just in case
        .replace(/اولائك/g, 'اولئك')
        .replace(/هائولاء/g, 'هؤلاء');

    return normalized
        // Remove all diacritics and tashkeel (excluding 0670 which is handled)
        .replace(/[\u0610-\u061A\u064B-\u065F\u06D6-\u06ED]/g, '')
        // Remove tatweel
        .replace(/\u0640/g, '')
        // Remove standalone hamza
        .replace(/ء/g, '')
        // Normalize Alef variations
        .replace(/[أإآ]/g, 'ا')
        // Normalize Ya variations
        .replace(/[ىئي]/g, 'ي')
        // Normalize Waw variations
        .replace(/[ؤ]/g, 'و')
        // Normalize Ta marbuta
        .replace(/ة/g, 'ه')
        // Remove any remaining non-Arabic characters except spaces
        .replace(/[^\u0620-\u064A\s]/g, '')
        // Remove extra whitespace
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();
}

// Calculate Similarity (Simple Levenshtein-based)
function calculateSimilarity(str1, str2) {
    // Simple token-based similarity
    const tokens1 = str1.split(' ').filter(t => t.length > 0);
    const tokens2 = str2.split(' ').filter(t => t.length > 0);

    if (tokens1.length === 0 && tokens2.length === 0) return 1;
    if (tokens1.length === 0 || tokens2.length === 0) return 0;

    // Count matching tokens
    let matches = 0;
    for (const token of tokens1) {
        if (tokens2.includes(token)) {
            matches++;
        }
    }

    // Similarity = matches / average length
    const avgLength = (tokens1.length + tokens2.length) / 2;
    return matches / avgLength;
}

// Update Reading Progress
function updateReadingProgress() {
    if (!readingVerseCount || !readingAccuracy || !readingProgressFill) return;

    const total = readingVerses.length;
    const completed = readingVerses.filter(v => v.status === 'correct').length;
    const accuracy = totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : 0;

    readingVerseCount.textContent = `${toArabicIndicDigits(completed)} / ${toArabicIndicDigits(total)}`;
    readingAccuracy.textContent = `الدقة: ${toArabicIndicDigits(accuracy)}%`;

    const progressPercent = total > 0 ? (completed / total) * 100 : 0;
    readingProgressFill.style.width = `${progressPercent}%`;
}

// Reset Reading Progress
function resetReadingProgress() {
    currentVerseIndex = 0;
    currentWordIndex = 0;
    correctCount = 0;
    totalAttempts = 0;

    // Reset all verse and word statuses
    readingVerses.forEach(v => {
        v.status = 'pending';
        if (v.words) {
            v.words.forEach(w => w.status = 'pending');
        }
    });

    renderReadingVerses();
    updateReadingProgress();
    stopListening();

    console.log('[Reading Mode] Progress reset');
}


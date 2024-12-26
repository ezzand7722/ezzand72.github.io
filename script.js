document.getElementById('fileInput').addEventListener('change', handleFileUpload);
document.getElementById('cutButton').addEventListener('click', cutMedia);
document.getElementById('addAudioButton').addEventListener('click', addAudio);
document.getElementById('playButton').addEventListener('click', playMedia);
document.getElementById('pauseButton').addEventListener('click', pauseMedia);
document.getElementById('themeToggleButton').addEventListener('click', toggleTheme);
document.getElementById('mergeButton').addEventListener('click', mergeAudioVideo);
document.getElementById('previewButton').addEventListener('click', togglePreview);

document.addEventListener('DOMContentLoaded', function() {
    console.log('Version 2.0 loaded - Audio Position enabled');
});

let mediaElement;
let mediaType;
let mediaDuration;
let rangeSlider;
let audioContext;
let audioTrack = null;
let audioStartPosition = 0;
let audioSlider;
let previewMode = false;

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    console.log('File uploaded:', file);

    const url = URL.createObjectURL(file);
    if (file.type.startsWith('video')) {
        mediaElement = document.getElementById('videoPlayer');
        mediaType = 'video';
    } else if (file.type.startsWith('audio')) {
        mediaElement = document.getElementById('audioPlayer');
        mediaType = 'audio';
    }

    mediaElement.src = url;
    mediaElement.classList.remove('d-none');
    mediaElement.load();
    mediaElement.onloadedmetadata = () => {
        mediaDuration = mediaElement.duration;
        document.getElementById('duration').textContent = formatTime(mediaDuration);
        console.log('Media loaded:', mediaType, 'Duration:', mediaDuration);
        initializeRangeSlider();
    };
    mediaElement.ontimeupdate = updateProgress;
}

function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    document.body.classList.toggle('light-theme');
}

function initializeRangeSlider() {
    if (rangeSlider) {
        rangeSlider.noUiSlider.destroy();
    }

    rangeSlider = document.getElementById('rangeSlider');
    noUiSlider.create(rangeSlider, {
        start: [0, mediaDuration],
        connect: true,
        step: 0.1,
        behaviour: 'tap-drag',
        range: {
            'min': 0,
            'max': mediaDuration
        },
        tooltips: [
            {
                to: function(value) {
                    return formatTime(value);
                },
                from: Number
            },
            {
                to: function(value) {
                    return formatTime(value);
                },
                from: Number
            }
        ],
        handleAttributes: [
            { 'aria-label': 'Start time' },
            { 'aria-label': 'End time' }
        ],
    });

    // Update media position when dragging start handle
    rangeSlider.noUiSlider.on('slide', function(values, handle) {
        if (handle === 0) { // only for start handle
            mediaElement.currentTime = parseFloat(values[0]);
        }
    });
}

function cutMedia() {
    const range = rangeSlider.noUiSlider.get();
    const startTime = parseFloat(range[0].split(':').reduce((acc, time) => (60 * acc) + parseFloat(time)));
    const endTime = parseFloat(range[1].split(':').reduce((acc, time) => (60 * acc) + parseFloat(time)));

    console.log('Cutting media from', startTime, 'to', endTime);

    if (mediaType === 'video') {
        cutVideo(startTime, endTime);
    } else if (mediaType === 'audio') {
        cutAudio(startTime, endTime);
    }
}

function cutVideo(startTime, endTime) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = mediaElement.videoWidth;
    canvas.height = mediaElement.videoHeight;

    const stream = canvas.captureStream();
    const recorder = new MediaRecorder(stream);
    const chunks = [];

    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'cut_video.webm';
        a.click();
        console.log('Video cut and downloaded');
    };

    mediaElement.currentTime = startTime;
    mediaElement.play();
    recorder.start();

    mediaElement.ontimeupdate = () => {
        if (mediaElement.currentTime >= endTime) {
            mediaElement.pause();
            recorder.stop();
        }
        ctx.drawImage(mediaElement, 0, 0, canvas.width, canvas.height);
    };
}

function cutAudio(startTime, endTime) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioContext.createMediaElementSource(mediaElement);
    const destination = audioContext.createMediaStreamDestination();
    source.connect(destination);

    const recorder = new MediaRecorder(destination.stream);
    const chunks = [];

    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'cut_audio.webm';
        a.click();
        console.log('Audio cut and downloaded');
    };

    mediaElement.currentTime = startTime;
    mediaElement.play();
    recorder.start();

    mediaElement.ontimeupdate = () => {
        if (mediaElement.currentTime >= endTime) {
            mediaElement.pause();
            recorder.stop();
        }
    };
}

function addAudio() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'audio/*';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        // Create audio element
        const audioEl = document.createElement('audio');
        audioEl.src = URL.createObjectURL(file);
        
        // Create draggable container
        const container = document.createElement('div');
        container.className = 'audio-block';
        container.innerHTML = `
            <div class="audio-name">${file.name}</div>
            <div class="time-indicator">0:00</div>
        `;
        
        // Make draggable
        container.draggable = true;
        let startX = 0;
        
        container.addEventListener('mousedown', function(e) {
            startX = e.clientX;
        });
        
        container.addEventListener('mousemove', function(e) {
            if (e.buttons !== 1) return; // Only move when mouse button is pressed
            
            const timeline = document.getElementById('timelineContainer');
            const rect = timeline.getBoundingClientRect();
            const position = (e.clientX - rect.left) / rect.width;
            
            if (position >= 0 && position <= 1) {
                container.style.left = `${position * 100}%`;
                audioStartPosition = position * mediaDuration;
                container.querySelector('.time-indicator').textContent = formatTime(audioStartPosition);
            }
        });
        
        // Remove existing audio block if any
        const existingBlock = document.querySelector('.audio-block');
        if (existingBlock) {
            existingBlock.remove();
        }
        
        // Add to timeline
        const timeline = document.getElementById('timelineContainer');
        timeline.appendChild(container);
        
        // Store audio track
        audioTrack = {
            element: audioEl,
            container: container
        };
        
        // Enable merge button
        document.getElementById('mergeButton').disabled = false;
    };
    
    input.click();
}

function mergeAudioVideo() {
    if (!mediaElement || !audioTrack) {
        alert('Please add both video and audio first');
        return;
    }
    
    try {
        // Create merged stream
        const stream = mediaElement.captureStream();
        const audioStream = audioTrack.element.captureStream();
        
        const recorder = new MediaRecorder(new MediaStream([
            ...stream.getTracks(),
            ...audioStream.getTracks()
        ]));
        
        const chunks = [];
        recorder.ondataavailable = e => chunks.push(e.data);
        
        recorder.onstop = () => {
            const blob = new Blob(chunks, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'merged_video.webm';
            a.click();
        };
        
        // Start recording
        mediaElement.currentTime = 0;
        mediaElement.play();
        
        setTimeout(() => {
            audioTrack.element.play();
            recorder.start();
        }, audioStartPosition * 1000);
        
        mediaElement.onended = () => {
            recorder.stop();
            mediaElement.pause();
            audioTrack.element.pause();
        };
        
    } catch (error) {
        console.error('Merge error:', error);
        alert('Error merging files: ' + error.message);
    }
}

function updateChangelog(message) {
    const changelog = document.getElementById('changelog');
    const entry = document.createElement('div');
    entry.textContent = `${new Date().toLocaleTimeString()} - ${message}`;
    changelog.insertBefore(entry, changelog.firstChild);
}

function handleDragStart(e) {
    e.dataTransfer.setData('text/plain', '');
    e.target.classList.add('dragging');
}

function handleDrag(e) {
    const timeline = document.getElementById('timelineContainer');
    const rect = timeline.getBoundingClientRect();
    const position = (e.clientX - rect.left) / rect.width;
    audioStartPosition = position * mediaDuration;
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
    updateAudioPosition();
}

function initializeAudioHandles() {
    const handles = document.querySelectorAll('.resize-handle');
    handles.forEach(handle => {
        handle.addEventListener('mousedown', initResize);
    });
}

function initResize(e) {
    const handle = e.target;
    const container = handle.parentElement;
    const isLeft = handle.classList.contains('left');
    
    function resize(e) {
        const timeline = document.getElementById('timelineContainer');
        const rect = timeline.getBoundingClientRect();
        const position = (e.clientX - rect.left) / rect.width;
        
        if (isLeft) {
            audioStartPosition = position * mediaDuration;
            container.style.left = `${position * 100}%`;
        } else {
            const width = position - (audioStartPosition / mediaDuration);
            container.style.width = `${width * 100}%`;
        }
    }
    
    function stopResize() {
        window.removeEventListener('mousemove', resize);
        window.removeEventListener('mouseup', stopResize);
    }
    
    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', stopResize);
}

function drawWaveform(audioBuffer, container) {
    const canvas = document.createElement('canvas');
    canvas.className = 'waveform';
    const ctx = canvas.getContext('2d');
    
    const data = audioBuffer.getChannelData(0);
    const step = Math.ceil(data.length / canvas.width);
    const amp = canvas.height / 2;
    
    ctx.beginPath();
    ctx.moveTo(0, amp);
    
    for(let i = 0; i < canvas.width; i++) {
        let min = 1.0;
        let max = -1.0;
        
        for(let j = 0; j < step; j++) {
            const datum = data[(i * step) + j];
            if (datum < min) min = datum;
            if (datum > max) max = datum;
        }
        
        ctx.lineTo(i, (1 + min) * amp);
        ctx.lineTo(i, (1 + max) * amp);
    }
    
    ctx.stroke();
    container.appendChild(canvas);
}

function updateAudioPosition() {
    if (!audioTrack) return;
    const timeline = document.getElementById('timelineContainer');
    const timelineWidth = timeline.offsetWidth;
    const position = (audioStartPosition / mediaDuration) * 100;
    audioTrack.container.style.left = `${position}%`;
    
    // Update audio element time
    audioTrack.element.currentTime = audioStartPosition;
}

function playMedia() {
    if (mediaElement) {
        mediaElement.play();
    }
}

function pauseMedia() {
    if (mediaElement) {
        mediaElement.pause();
    }
}

function updateProgress() {
    const currentTime = mediaElement.currentTime;
    const progressBar = document.getElementById('progressBar');
    const currentTimeDisplay = document.getElementById('currentTime');

    progressBar.style.width = (currentTime / mediaDuration) * 100 + '%';
    currentTimeDisplay.textContent = formatTime(currentTime);
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}

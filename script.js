// Challenge start date and time (first day just completed)
const today = new Date();
const challengeStartDate = new Date();
challengeStartDate.setDate(today.getDate() - 3); // Changed from -2 to -3
challengeStartDate.setUTCHours(20, 0, 0, 0); // 22:00 GMT+2 = 20:00 UTC
const totalDays = 8;

// Motivational quotes array
const motivationalQuotes = [
    { text: "Every day is a new beginning.", author: "T.S. Eliot" },
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
    { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
    { text: "The future depends on what you do today.", author: "Mahatma Gandhi" },
    { text: "Success is not final, failure is not fatal.", author: "Winston Churchill" },
    { text: "Your time is limited, don't waste it living someone else's life.", author: "Steve Jobs" },
    { text: "The best way to predict the future is to create it.", author: "Peter Drucker" }
];

// Encouragement messages
const encouragementMessages = [
    "You're doing amazing! Keep going! 🌟",
    "Every small step counts! You've got this! 💪",
    "Stay strong, you're making progress! 🎯",
    "You're stronger than you know! 🦋",
    "Believe in yourself like we believe in you! ✨"];

// Easter egg messages for each day
const easterEggs = {
    1: { message: "🌟 First day champion! Here's a secret: Click the progress bar for a surprise!", effect: "rainbow" },
    2: { message: "💫 Double trouble! Try clicking your badges!", effect: "spin" },
    3: { message: "🎯 Triple threat! Type 'dance' while on the page!", effect: "bounce" },
    4: { message: "✨ Halfway there! Double-click the quote for magic!", effect: "glitter" },
    5: { message: "🖐️ High five! Press 'F' to pay respects to junk food!", effect: "fireworks" },
    6: { message: "⚡ Super six! Click the timer three times!", effect: "shake" },
    7: { message: "🎨 Lucky seven! Type 'colors' for a surprise!", effect: "colorshift" },
    8: { message: "👑 Ultimate champion! Click everywhere for celebration!", effect: "party" }
};

// Add these arrays after your existing constants
const amongUsContent = [
    {
        day: 1,
        message: "⚠️ EMERGENCY MEETING RESULTS ⚠️\n1 Impostor has been ejected!\n7 tasks remaining for Crewmates!",
        gif: "https://media.giphy.com/media/ej0Ay8fH6Y1Wg/giphy.gif"
    },
    {
        day: 2,
        message: "🚨 WAIT... WHAT'S THAT IN THE VENT?!\n*rustling noises*\nOh, just your determination shining through!\n6 tasks remaining!",
        gif: "https://media.giphy.com/media/SUAkb7bpsqso0/giphy.gif",
        surprise: {
            type: 'vent-animation',
            content: 'https://media.giphy.com/media/ysiCYZUJkW3XRb7k9K/giphy.gif'
        }
    },
    {
        day: 3,
        message: "🎵 Found this note in Electrical:\n'Roses are red\nImpostors are sus\nYou're doing amazing\nMaking us proud of us!'\n5 tasks remaining!",
        gif: "https://media.giphy.com/media/RtdRhc7TxBxB0YAsK6/giphy.gif",
        surprise: {
            type: 'pixel-art',
            content: 'https://media.giphy.com/media/9VlE2ZqHoFEnVjFWeR/giphy.gif'
        }
    },
    {
        day: 4,
        message: "🔧 Task Completion Status:\nImpostor eliminated!\n4 more tasks for victory!\nYou're doing great!",
        gif: "https://media.giphy.com/media/yAnC4g6sUpX0MDkGOg/giphy.gif?cid=790b76114wls35wh13ne70bfvxg86zywa9q91aee587i8pr1&ep=v1_gifs_search&rid=giphy.gif&ct=g"
    },
    {
        day: 5,
        message: "😱 BEHIND YOU!\n...\n...\nJust kidding! But your progress is scary good!\n3 tasks remaining!",
        gif: "https://media.giphy.com/media/LmBsnpDCuturMhtLfw/giphy.gif",
        surprise: {
            type: 'jumpscare',
            content: 'https://media.giphy.com/media/VHlKSFRTQ7nn81fkv4/giphy.gif'
        }
    },
    {
        day: 6,
        message: "🎮 SPECIAL GAMING MOMENT!\nThe Impostor left a gaming console!\nOnly 2 tasks remain!\nTime for a quick game break?",
        gif: "https://media.giphy.com/media/ejJmQ6FPJrQKVy5QVz/giphy.gif",
        surprise: {
            type: 'video',
            content: `
                <div class="video-surprise">
                    <a href="https://www.youtube.com/watch?v=nZBJnSvGAf0" target="_blank" class="video-link">
                        🎮 Watch Silly Among Us Dance! 🎮
                    </a>
                </div>
            `
        }
    },
    {
        day: 7,
        message: "💝 Dear Crewmate,\nWe've watched you grow stronger each day.\nYou've shown incredible dedication.\nJust one tiny task remains.\nWe're already so proud of you.\nYou're our star player!\n- Your Among Us Family",
        gif: "https://media.giphy.com/media/fxBXUfxizJRoYC0vIo/giphy.gif",
        surprise: {
            type: 'heartfelt',
            content: 'https://media.giphy.com/media/dw36yjtOAtuSZyxEJG/giphy.gif'
        }
    },
    {
        day: 8,
        message: "🎊 ULTIMATE VICTORY! 🎊\nYOU ARE THE CHAMPION!\nALL TASKS COMPLETED!\nCREWMATE OF THE YEAR!\n\n*Special Achievement Unlocked*\n'The Legendary Crewmate'",
        gif: "https://media.giphy.com/media/Zu6AATBpCeUzm/giphy.gif",
        surprise: {
            type: 'finale',
            content: 'victory'
        }
    }
];

const bookQuotes = [
    {
        quote: "A reader lives a thousand lives before they die.",
        author: "George R.R. Martin",
        emoji: "🐉"
    },
    {
        quote: "Books are a uniquely portable magic.",
        author: "Stephen King",
        emoji: "✨"
    },
    {
        quote: "There is no friend as loyal as a book.",
        author: "Ernest Hemingway",
        emoji: "📖"
    },
    {
        quote: "Reading is breathing in, writing is breathing out.",
        author: "Pam Allyn",
        emoji: "🌬️"
    },
    {
        quote: "Books are mirrors: you only see in them what you already have inside you.",
        author: "Carlos Ruiz Zafón",
        emoji: "🪞"
    },
    {
        quote: "Once you learn to read, you will be forever free.",
        author: "Frederick Douglass",
        emoji: "🕊️"
    },
    {
        quote: "Reading is an exercise in empathy.",
        author: "Malorie Blackman",
        emoji: "💝"
    },
    {
        quote: "Books are lighthouses erected in the great sea of time.",
        author: "E.P. Whipple",
        emoji: "🏮"
    }
];

// Update the dailyCelebrationGifs array with unique GIFs for each day
const dailyCelebrationGifs = [
    // Day 1 - First Steps Theme
    {
        gif1: "https://media.giphy.com/media/l0HlGVD6AsbobSTe0/giphy.gif",
        gif2: "https://media.giphy.com/media/QW5nKIoebG8y4/giphy.gif", // Happy star
        gif3: "https://media.giphy.com/media/26u4cqiYI30juCOGY/giphy.gif", // Celebration
        gif4: "https://media.giphy.com/media/g9582DNuQppxC/giphy.gif"
    },
    // Day 2 - Achievement Theme
    {
        gif1: "https://media.giphy.com/media/XreQmk7ETCak0/giphy.gif",
        gif2: "https://media.giphy.com/media/3oz9ZE2Oo9zRC/giphy.gif",
        gif3: "https://media.giphy.com/media/3o6Zt8qDiPE2d3kayI/giphy.gif",
        gif4: "https://media.giphy.com/media/xT8qBepJQzUjXpeWU8/giphy.gif"
    },
    // Day 3 - Dance Theme
    {
        gif1: "https://media.giphy.com/media/l0HlGVD6AsbobSTe0/giphy.gif",
        gif2: "https://media.giphy.com/media/DGWAx8d3IkICs/giphy.gif", // Dancing
        gif3: "https://media.giphy.com/media/blSTtZehjAZ8I/giphy.gif", // More dancing
        gif4: "https://media.giphy.com/media/l4q8cJzGdR9J8w3hS/giphy.gif"
    },
    // Day 4 - Magic Theme
    {
        gif1: "https://media.giphy.com/media/3NtY188QaxDdC/giphy.gif?cid=790b7611xjxq63ec33vakmp70v80s41vxlyfpq590p0krk3r&ep=v1_gifs_search&rid=giphy.gif&ct=g",
        gif2: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExc2F6eGlrZnNoZTk4a2lwZWdld2hiOHhrMWdzbmFkd3UwazA3Z2tlMiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/mGK1g88HZRa2FlKGbz/giphy.gif", // Magic
        gif3: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExc2F6eGlrZnNoZTk4a2lwZWdld2hiOHhrMWdzbmFkd3UwazA3Z2tlMiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/3o7abKhOpu0NwenH3O/giphy.gif", // Sparkles
        gif4: "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExNWdtb2JzbmVzZnJza3c5anY1MWQ0YnN2bjBlamhiY3Iwd3R6dmZwbiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/o75ajIFH0QnQC3nCeD/giphy.gif"
    },
    // Day 5 - High Five Theme
    {
        gif1: "https://media.giphy.com/media/l0HlGVD6AsbobSTe0/giphy.gif",
        gif2: "https://media.giphy.com/media/3oEjHV0z8S7WM4MwnK/giphy.gif", // High five
        gif3: "https://media.giphy.com/media/wrzf9P70YWLJK/giphy.gif", // Celebration
        gif4: "https://media.giphy.com/media/l4q8cJzGdR9J8w3hS/giphy.gif"
    },
    // Day 6 - Gaming Theme (updated 4th GIF)
    {
        gif1: "https://media.giphy.com/media/l0HlGVD6AsbobSTe0/giphy.gif",
        gif2: "https://media.giphy.com/media/B7o99rIuystY4/giphy.gif",
        gif3: "https://media.giphy.com/media/1n4FT4KRQkDvK0IO4X/giphy.gif",
        gif4: "https://media.giphy.com/media/3oEjI6hkw6nbYNQkz6/giphy.gif" // New gaming celebration GIF
    },
    // Day 7 - Rainbow Theme (updated 3rd GIF)
    {
        gif1: "https://media.giphy.com/media/l0HlGVD6AsbobSTe0/giphy.gif",
        gif2: "https://media.giphy.com/media/26tPplGWjN0xLybiU/giphy.gif",
        gif3: "https://media.giphy.com/media/26BRvQJ3ke9rHRPyg/giphy.gif", // New colorful celebration GIF
        gif4: "https://media.giphy.com/media/U4DswrBiaz0p67ZweH/giphy.gif"
    },
    // Day 8 - Grand Finale
    {
        gif1: "https://media.giphy.com/media/l0HlGVD6AsbobSTe0/giphy.gif",
        gif2: "https://media.giphy.com/media/l2JhGYxcjMcKqiaHu/giphy.gif", // Trophy
        gif3: "https://media.giphy.com/media/2gtoSIzdrSMFO/giphy.gif", // Ultimate win
        gif4: "https://media.giphy.com/media/26u4lOMA8JKSnL9Uk/giphy.gif"
    }
];

// Main login function
function checkLogin() {
    const username = document.getElementById('username').value.toLowerCase();
    
    if (username === 'onizuka') {
        document.getElementById('login-section').classList.add('hidden');
        document.getElementById('celebration-section').classList.remove('hidden');
        updateProgress();
        startCountdown();
        updateQuote();
        updateDailyContent();
        // Celebrate first login
        setTimeout(() => {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
        }, 1000);
    } 
    // Add secret preview username
    else if (username === 'prev') {
        document.getElementById('login-section').classList.add('hidden');
        document.getElementById('celebration-section').classList.remove('hidden');
        
        // Add preview mode indicator
        const indicator = document.createElement('div');
        indicator.className = 'preview-mode';
        indicator.textContent = '👀 Preview Mode - Day 1';
        document.body.appendChild(indicator);

        // Show all days as buttons
        const previewContainer = document.createElement('div');
        previewContainer.className = 'preview-days';
        previewContainer.innerHTML = `
            <div class="preview-buttons">
                ${Array.from({length: 8}, (_, i) => `
                    <button onclick="previewDay(${i + 1})">Day ${i + 1}</button>
                `).join('')}
            </div>
            <button onclick="exitPreview()" class="exit-preview">Exit Preview</button>
        `;
        document.body.appendChild(previewContainer);
        
        // Show day 1 by default
        previewDay(1);
    } 
    else {
        alert('Please enter the correct username!');
    }
}

function calculateDaysCompleted() {
    const now = new Date();
    const timeDifference = now - challengeStartDate;
    const daysPassed = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    
    // Ensure we don't exceed 8 days and don't go below 2 (since we're on day 2)
    return Math.max(2, Math.min(daysPassed + 1, 8));
}

function updateProgress() {
    const daysCompleted = calculateDaysCompleted();
    const progressBar = document.querySelector('.progress');
    const daysCompletedText = document.querySelector('.days-completed');

    // Update progress bar
    const progressPercentage = (daysCompleted / totalDays) * 100;
    progressBar.style.width = `${progressPercentage}%`;

    // Update text
    daysCompletedText.textContent = `${daysCompleted} day${daysCompleted > 1 ? 's' : ''} completed out of ${totalDays} days!`;

    // Update badges
    updateBadges(daysCompleted);

    // Update motivation text based on progress
    updateMotivationText(daysCompleted);
}

function updateMotivationText(daysCompleted) {
    const motivationText = document.querySelector('.motivation-text');
    const messages = {
        1: {
            title: "First day conquered! 🌟",
            message1: "You've taken the first step on this amazing journey!",
            message2: "Try clicking the progress bar for a colorful surprise! 🌈"
        },
        2: {
            title: "Double the achievement! 💫",
            message1: "Two days down, you're building momentum!",
            message2: "Click your achievement badges for a special effect! ✨"
        },
        3: {
            title: "Triple the power! 🔥",
            message1: "Three days strong, you're on a roll!",
            message2: "Type 'dance' to show off your moves! 💃"
        },
        4: {
            title: "Halfway champion! ",
            message1: "You're at the halfway point, and you're crushing it!",
            message2: "Double-click the daily quote for some magic! ✨"
        },
        5: {
            title: "High five! 🖐️",
            message1: "Five days of pure determination!",
            message2: "Press 'F' to pay respects to your progress! 🎮"
        },
        6: {
            title: "Super six! ⚡",
            message1: "Six days of showing what you're made of!",
            message2: "Click the timer three times for a shake! ⏰"
        },
        7: {
            title: "Seventh heaven! 🌠",
            message1: "One more day to go, you're nearly there!",
            message2: "Type 'colors' to see something special! 🎨"
        },
        8: {
            title: "Ultimate victory! 👑",
            message1: "You've done it! All 8 days completed!",
            message2: "Click anywhere for a celebration! 🎉"
        }
    };

    const dayMessage = messages[daysCompleted];
    motivationText.innerHTML = `
        <h2>${dayMessage.title}</h2>
        <p>${dayMessage.message1}</p>
        <p>${dayMessage.message2}</p>
    `;
}

function startCountdown() {
    function updateCountdown() {
        const now = new Date();
        
        // Calculate next milestone
        const nextMilestone = new Date(challengeStartDate);
        nextMilestone.setDate(nextMilestone.getDate() + calculateDaysCompleted());
        nextMilestone.setUTCHours(20, 0, 0, 0); // 22:00 GMT+2 = 20:00 UTC

        const diff = nextMilestone - now;

        // If we've passed the milestone, refresh the page to show new day
        if (diff < 0 && calculateDaysCompleted() < 8) {
            window.location.reload();
            return;
        }

        // Convert to hours, minutes, seconds
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        // Update the countdown display
        document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
        document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
        document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');

        // Update content
        updateProgress();
        updateDailyContent();
    }

    // Update immediately and then every second
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

function showEncouragement() {
    const message = encouragementMessages[Math.floor(Math.random() * encouragementMessages.length)];
    alert(message);
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F472B6', '#3B82F6']
    });
}

// Add event listener for Enter key
document.addEventListener('DOMContentLoaded', function() {
    const usernameInput = document.getElementById('username');
    usernameInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            checkLogin();
        }
    });
});

// Add these functions after your existing code
function addEasterEggs() {
    // Progress bar click effect
    document.querySelector('.progress-bar').addEventListener('click', () => {
        const progress = document.querySelector('.progress');
        progress.style.background = 'linear-gradient(45deg, #F472B6, #3B82F6, #EC4899, #60A5FA)';
        progress.style.backgroundSize = '300% 300%';
        progress.style.animation = 'gradient 2s ease infinite';
        confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.8 },
            colors: ['#F472B6', '#3B82F6', '#EC4899', '#60A5FA'] // Pink and aqua confetti
        });
    });

    // Badge hover sound effect
    document.querySelectorAll('.badge').forEach(badge => {
        badge.addEventListener('mouseenter', () => {
            if (!badge.classList.contains('locked')) {
                const audio = new Audio('https://www.soundjay.com/button/sounds/button-09.mp3');
                audio.volume = 0.2;
                audio.play();
            }
        });
    });

    // Konami code easter egg (up up down down left right left right B A)
    let konamiCode = '';
    document.addEventListener('keydown', (e) => {
        konamiCode += e.key;
        if (konamiCode.includes('ArrowUpArrowUpArrowDownArrowDownArrowLeftArrowRightArrowLeftArrowRightba')) {
            document.body.style.animation = 'rainbow 5s infinite';
            confetti({
                particleCount: 300,
                spread: 180,
                origin: { y: 0.5 }
            });
            konamiCode = '';
        }
    });

    // Daily quote double-click effect
    const quoteDiv = document.querySelector('.daily-quote');
    if (quoteDiv) {
        // Create audio element with a more fun sound
        const magicSound = new Audio('https://www.myinstants.com/media/sounds/fairy-sparkle.mp3');
        magicSound.volume = 0.4; // Set volume to 40%

        quoteDiv.addEventListener('dblclick', function() {
            if (calculateDaysCompleted() === 4) {
                // Play the fun sparkle sound
                magicSound.currentTime = 0; // Reset sound to start
                magicSound.play();

                this.style.animation = 'glitter 1s infinite';
                // Add more sparkle effects
                for (let i = 0; i < 30; i++) { // Increased number of sparkles
                    const sparkle = document.createElement('div');
                    sparkle.className = 'sparkle';
                    sparkle.innerHTML = ['✨', '⭐', '🌟'][Math.floor(Math.random() * 3)]; // Random sparkle types
                    sparkle.style.left = Math.random() * window.innerWidth + 'px';
                    sparkle.style.top = Math.random() * window.innerHeight + 'px';
                    document.body.appendChild(sparkle);
                    setTimeout(() => sparkle.remove(), 1500); // Longer duration
                }
                // More colorful confetti
                confetti({
                    particleCount: 80,
                    spread: 100,
                    origin: { y: 0.6 },
                    colors: ['#FFD700', '#FFA500', '#FF69B4', '#00FF00', '#4169E1'],
                    scalar: 1.2
                });
                
                setTimeout(() => {
                    this.style.animation = '';
                }, 1000);
            }
        });
    }
}

// Add this function to update Among Us and Book content
function updateDailyContent() {
    const daysCompleted = calculateDaysCompleted();
    const amongUsDiv = document.getElementById('amongus-content');
    const bookDiv = document.getElementById('book-content');

    // Update the daily quote (add this at the beginning of the function)
    const dailyQuote = motivationalQuotes[daysCompleted - 1];
    const quoteDiv = document.querySelector('#quote-text');
    const authorDiv = document.querySelector('#quote-author');
    
    if (quoteDiv && authorDiv && dailyQuote) {
        quoteDiv.textContent = `"${dailyQuote.text}"`;
        authorDiv.textContent = `- ${dailyQuote.author}`;
    }

    // Update Among Us content with styled message
    const amongUsDay = amongUsContent[daysCompleted - 1];
    let amongUsHTML = `
        <div class="amongus-message">
            ${amongUsDay.message.split('\n').map(line => `<p>${line}</p>`).join('')}
        </div>
        <img src="${amongUsDay.gif}" alt="Among Us" class="amongus-gif">
    `;

    // Add surprise content if it exists
    if (amongUsDay.surprise) {
        switch (amongUsDay.surprise.type) {
            case 'vent-animation':
                amongUsHTML += `
                    <div class="vent-surprise">
                        <img src="${amongUsDay.surprise.content}" alt="Vent surprise" class="surprise-gif">
                    </div>
                `;
                break;
            case 'jumpscare':
                amongUsHTML += `
                    <div class="jumpscare-surprise">
                        <img src="${amongUsDay.surprise.content}" alt="Surprise!" class="surprise-gif">
                    </div>
                `;
                break;
            case 'finale':
                // Special finale celebration
                setTimeout(() => {
                    confetti({
                        particleCount: 300,
                        spread: 180,
                        origin: { y: 0.6 },
                        colors: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF']
                    });
                }, 1000);
                amongUsHTML += `
                    <div class="finale-celebration">
                        <div class="trophy">🏆</div>
                        <div class="stars">⭐🌟⭐</div>
                        <div class="final-message">You're Officially Amazing!</div>
                    </div>
                `;
                break;
        }
    }
    amongUsDiv.innerHTML = amongUsHTML;

    // Book content remains the same
    const bookDay = bookQuotes[daysCompleted - 1];
    bookDiv.innerHTML = `        <p>${bookDay.emoji} "${bookDay.quote}"</p>
        <p style="color: #F472B6; margin-top: 0.5rem;">- ${bookDay.author}</p>
    `;

    // Update celebration GIFs
    updateCelebrationGifs(daysCompleted);

    // Add special effect buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'special-buttons';
    
    // Day 3 Dance Button
    if (daysCompleted === 3) {
        const danceButton = document.createElement('button');
        danceButton.textContent = "Let's Dance! 💃";
        danceButton.className = 'special-effect-button';
        danceButton.onclick = function() {
            document.body.style.animation = 'dance 0.5s infinite';
            
            // Add floating music notes
            for (let i = 0; i < 10; i++) {
                const note = document.createElement('div');
                note.className = 'music-note';
                note.innerHTML = ['♪', '♫', '♬', '♩'][Math.floor(Math.random() * 4)];
                note.style.left = Math.random() * window.innerWidth + 'px';
                note.style.top = window.innerHeight + 'px';
                document.body.appendChild(note);
            }

            // Add confetti
            confetti({
                particleCount: 50,
                spread: 70,
                origin: { y: 0.6 }
            });

            setTimeout(() => {
                document.body.style.animation = '';
                document.querySelectorAll('.music-note').forEach(note => note.remove());
            }, 3000);
        };
        buttonContainer.appendChild(danceButton);
    }

    // Day 5 Fireworks Button
    if (daysCompleted === 5) {
        const fireworksButton = document.createElement('button');
        fireworksButton.textContent = 'Launch Fireworks! 🎆';
        fireworksButton.className = 'special-effect-button';
        fireworksButton.onclick = function() {
            confetti({
                particleCount: 100,
                spread: 180,
                origin: { y: 0.6 },
                colors: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00']
            });
        };
        buttonContainer.appendChild(fireworksButton);
    }

    // Day 7 - Changed to Disco Mode
    if (daysCompleted === 7) {
        const discoButton = document.createElement('button');
        discoButton.textContent = 'Disco Time! 🕺';
        discoButton.className = 'special-effect-button';
        discoButton.onclick = function() {
            document.body.style.animation = 'disco 1.5s infinite';
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF']
            });
            setTimeout(() => {
                document.body.style.animation = '';
            }, 3000);
        };
        buttonContainer.appendChild(discoButton);
    }

    // Add the button container after the motivation text
    const motivationText = document.querySelector('.motivation-text');
    if (motivationText && buttonContainer.children.length > 0) {
        motivationText.appendChild(buttonContainer);
    }
}

// Helper function for music notes
function createMusicNotes() {
    for (let i = 0; i < 10; i++) {
        const note = document.createElement('div');
        note.className = 'music-note';
        note.innerHTML = ['♪', '♫', '♬', '♩'][Math.floor(Math.random() * 4)];
        note.style.left = Math.random() * window.innerWidth + 'px';
        note.style.top = window.innerHeight + 'px';
        document.body.appendChild(note);
        setTimeout(() => note.remove(), 3000);
    }
}

// Add this CSS for the game surprise
const styles = `
.video-link {
    display: inline-block;
    padding: 10px 20px;
    background: linear-gradient(45deg, #F472B6, #3B82F6);
    color: white;
    text-decoration: none;
    border-radius: 5px;
    margin-top: 1rem;
    font-weight: bold;
    transition: transform 0.3s, box-shadow 0.3s;
}

.video-link:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(244, 114, 182, 0.3);
}

.video-surprise {
    margin-top: 1rem;
    text-align: center;
}
`;

// Add event listener for the encouragement button
document.addEventListener('DOMContentLoaded', function() {
    const encourageBtn = document.getElementById('encourageBtn');
    if (encourageBtn) {
        encourageBtn.addEventListener('click', showEncouragement);
    }
});

// Add these event listeners for daily interactive features
document.addEventListener('DOMContentLoaded', function() {
    // Create and add buttons for each day's special effect
    const daysCompleted = calculateDaysCompleted();
    const motivationText = document.querySelector('.motivation-text');
    
    if (daysCompleted === 3) {
        const danceButton = document.createElement('button');
        danceButton.textContent = "Let's Dance! 💃";
        danceButton.className = 'special-effect-button';
        danceButton.onclick = function() {
            document.body.style.animation = 'dance 0.5s infinite';
            
            // Add floating music notes
            for (let i = 0; i < 10; i++) {
                const note = document.createElement('div');
                note.className = 'music-note';
                note.innerHTML = ['♪', '♫', '♬', '♩'][Math.floor(Math.random() * 4)];
                note.style.left = Math.random() * window.innerWidth + 'px';
                note.style.top = window.innerHeight + 'px';
                document.body.appendChild(note);
            }

            // Add confetti
            confetti({
                particleCount: 50,
                spread: 70,
                origin: { y: 0.6 }
            });

            setTimeout(() => {
                document.body.style.animation = '';
                document.querySelectorAll('.music-note').forEach(note => note.remove());
            }, 3000);
        };
        motivationText.appendChild(danceButton);
    }

    if (daysCompleted === 5) {
        const fireworksButton = document.createElement('button');
        fireworksButton.textContent = 'Launch Fireworks! 🎆';
        fireworksButton.className = 'special-effect-button';
        fireworksButton.onclick = function() {
            document.body.style.animation = 'shake 0.5s infinite';
            confetti({
                particleCount: 100,
                spread: 180,
                origin: { y: 0.9 }
            });
            setTimeout(() => {
                document.body.style.animation = '';
            }, 1000);
        };
        motivationText.appendChild(fireworksButton);
    }

    // Day 7 - Changed to Disco Mode
    if (daysCompleted === 7) {
        const discoButton = document.createElement('button');
        discoButton.textContent = 'Disco Time! 🕺';
        discoButton.className = 'special-effect-button';
        discoButton.onclick = function() {
            document.body.style.animation = 'disco 1.5s infinite';
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF']
            });
            setTimeout(() => {
                document.body.style.animation = '';
            }, 3000);
        };
        motivationText.appendChild(discoButton);
    }

    // Add styles for the special effect buttons
    const newStyles = `
        .special-effect-button {
            background: linear-gradient(45deg, #F472B6, #3B82F6);
            border: none;
            border-radius: 20px;
            color: white;
            padding: 10px 20px;
            margin: 10px;
            cursor: pointer;
            font-size: 1rem;
            transition: transform 0.3s, box-shadow 0.3s;
        }

        .special-effect-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(244, 114, 182, 0.3);
        }

        @keyframes dance {
            0% { transform: translateY(0) rotate(0deg); }
            25% { transform: translateY(-15px) rotate(-5deg); }
            50% { transform: translateY(0) rotate(0deg); }
            75% { transform: translateY(-15px) rotate(5deg); }
            100% { transform: translateY(0) rotate(0deg); }
        }

        @keyframes disco {
            0% { filter: hue-rotate(0deg) brightness(1); }
            25% { filter: hue-rotate(90deg) brightness(1.2); }
            50% { filter: hue-rotate(180deg) brightness(1); }
            75% { filter: hue-rotate(270deg) brightness(1.2); }
            100% { filter: hue-rotate(360deg) brightness(1); }
        }
    `;

    const styleSheet = document.createElement("style");
    styleSheet.textContent = newStyles;
    document.head.appendChild(styleSheet);
});

// Helper functions for the effects
function createMusicNote() {
    const note = document.createElement('div');
    note.className = 'music-note';
    note.innerHTML = ['♪', '♫', '♬', '♩'][Math.floor(Math.random() * 4)];
    note.style.left = Math.random() * window.innerWidth + 'px';
    note.style.top = window.innerHeight + 'px';
    document.body.appendChild(note);
    setTimeout(() => note.remove(), 3000);
}

function createSparkle(x, y) {
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle';
    sparkle.innerHTML = '✨';
    sparkle.style.left = (x - 10) + 'px';
    sparkle.style.top = (y - 10) + 'px';
    document.body.appendChild(sparkle);
    setTimeout(() => sparkle.remove(), 1000);
}

function createMatrixEffect() {
    // Matrix-style effect
    const matrix = document.createElement('div');
    matrix.className = 'matrix-effect';
    document.body.appendChild(matrix);
    setTimeout(() => matrix.remove(), 3000);
}

function createPixelExplosion(element) {
    const rect = element.getBoundingClientRect();
    for (let i = 0; i < 20; i++) {
        const pixel = document.createElement('div');
        pixel.className = 'pixel';
        pixel.style.left = (rect.left + rect.width/2) + 'px';
        pixel.style.top = (rect.top + rect.height/2) + 'px';
        document.body.appendChild(pixel);
        setTimeout(() => pixel.remove(), 1000);
    }
}

function createRainbowTrail(x, y) {
    const trail = document.createElement('div');
    trail.className = 'rainbow-trail';
    trail.style.left = x + 'px';
    trail.style.top = y + 'px';
    document.body.appendChild(trail);
    setTimeout(() => trail.remove(), 500);
}

// Add this function to update celebration GIFs
function updateCelebrationGifs(day) {
    const celebrationDiv = document.querySelector('.celebration-images');
    if (!celebrationDiv) return;

    const dayGifs = dailyCelebrationGifs[day - 1];
    if (!dayGifs) return;

    celebrationDiv.innerHTML = `
        <img src="${dayGifs.gif1}" alt="Celebration" />
        <img src="${dayGifs.gif2}" alt="Success" />
        <img src="${dayGifs.gif3}" alt="Motivation" />
        <img src="${dayGifs.gif4}" alt="Stars" />
    `;
}

// Update the badges in your HTML to show these achievements
const achievements = [
    {
        day: 1,
        icon: "🌟",
        title: "First Step Champion",
        description: "Started the journey with determination!"
    },
    {
        day: 2,
        icon: "💪",
        title: "Momentum Builder",
        description: "Two days strong and getting stronger!"
    },
    {
        day: 3,
        icon: "🎵",
        title: "Rhythm Master",
        description: "Found your groove and kept moving!"
    },
    {
        day: 4,
        icon: "✨",
        title: "Halfway Hero",
        description: "Crossed the midpoint with style!"
    },
    {
        day: 5,
        icon: "🖐️",
        title: "High Five Hero",
        description: "Gave junk food the hand!"
    },
    {
        day: 6,
        icon: "🎮",
        title: "Game Master",
        description: "Played the health game and won!"
    },
    {
        day: 7,
        icon: "⭐",
        title: "Star Seeker",
        description: "Almost there, shining brighter each day!"
    },
    {
        day: 8,
        icon: "👑",
        title: "Ultimate Champion",
        description: "Completed the entire challenge!"
    }
];

// Function to update badges
function updateBadges(daysCompleted) {
    const badgesContainer = document.querySelector('.badges');
    badgesContainer.innerHTML = achievements.map((achievement, index) => `
        <div class="badge ${index >= daysCompleted ? 'locked' : ''}" 
             onclick="if(${index < daysCompleted}) this.classList.add('animate')">
            <div class="badge-icon">${achievement.icon}</div>
            <div class="badge-title">${achievement.title}</div>
            <div class="badge-description">${achievement.description}</div>
        </div>
    `).join('');
}

// Keep these preview helper functions
function previewDay(day) {
    // Update preview mode indicator
    const indicator = document.querySelector('.preview-mode');
    if (indicator) {
        indicator.textContent = `👀 Preview Mode - Day ${day}`;
    }
    
    // Override calculateDaysCompleted temporarily
    const originalCalculate = calculateDaysCompleted;
    calculateDaysCompleted = () => day;
    
    // Update content
    updateProgress();
    updateDailyContent();
    
    // Restore original function
    calculateDaysCompleted = originalCalculate;
}

function exitPreview() {
    // Remove preview elements
    document.querySelector('.preview-days')?.remove();
    document.querySelector('.preview-mode')?.remove();
    
    // Show login section again
    document.getElementById('celebration-section').classList.add('hidden');
    document.getElementById('login-section').classList.remove('hidden');
}

// Add this inside your DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', function() {
    // Day 4 - Double click quote for magic sparkles
    const quoteDiv = document.querySelector('.daily-quote');
    if (quoteDiv) {
        // Create audio element with a more fun sound
        const magicSound = new Audio('https://www.myinstants.com/media/sounds/fairy-sparkle.mp3');
        magicSound.volume = 0.4; // Set volume to 40%

        quoteDiv.addEventListener('dblclick', function() {
            if (calculateDaysCompleted() === 4) {
                // Play the fun sparkle sound
                magicSound.currentTime = 0; // Reset sound to start
                magicSound.play();

                this.style.animation = 'glitter 1s infinite';
                // Add more sparkle effects
                for (let i = 0; i < 30; i++) { // Increased number of sparkles
                    const sparkle = document.createElement('div');
                    sparkle.className = 'sparkle';
                    sparkle.innerHTML = ['✨', '⭐', '🌟'][Math.floor(Math.random() * 3)]; // Random sparkle types
                    sparkle.style.left = Math.random() * window.innerWidth + 'px';
                    sparkle.style.top = Math.random() * window.innerHeight + 'px';
                    document.body.appendChild(sparkle);
                    setTimeout(() => sparkle.remove(), 1500); // Longer duration
                }
                // More colorful confetti
                confetti({
                    particleCount: 80,
                    spread: 100,
                    origin: { y: 0.6 },
                    colors: ['#FFD700', '#FFA500', '#FF69B4', '#00FF00', '#4169E1'],
                    scalar: 1.2
                });
                
                setTimeout(() => {
                    this.style.animation = '';
                }, 1000);
            }
        });
    }
});

// Add these styles to your CSS
const newStyles = `
    @keyframes glitter {
        0% { text-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 15px #FFD700; }
        50% { text-shadow: 0 0 20px #fff, 0 0 30px #fff, 0 0 40px #FFD700; }
        100% { text-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 15px #FFD700; }
    }

    .sparkle {
        position: fixed;
        pointer-events: none;
        animation: sparkle-fade 1s ease-in forwards;
        z-index: 1000;
    }

    @keyframes sparkle-fade {
        0% { transform: scale(0) rotate(0deg); opacity: 1; }
        100% { transform: scale(1) rotate(360deg); opacity: 0; }
    }
`;

const styleSheet = document.createElement("style");
styleSheet.textContent = newStyles;
document.head.appendChild(styleSheet);
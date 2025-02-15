// Challenge start date and time (first day just completed)
const today = new Date();
const challengeStartDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 20, 0, 0); // 22:00 GMT+2 = 20:00 UTC
const totalDays = 8;

// Motivational quotes array
const motivationalQuotes = [
    { text: "Every day is a new beginning.", author: "T.S. Eliot" },
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
    { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
    { text: "The future depends on what you do today.", author: "Mahatma Gandhi" }];

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
    5: { message: "�� High five! Press 'F' to pay respects to junk food!", effect: "fireworks" },
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
        gif: "https://media.giphy.com/media/W0crByKlXhLlC/giphy.gif"
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
            type: 'game',
            content: `
                <div class="game-surprise">
                    <img src="https://media.giphy.com/media/Mab1lyzb70X0YiNmUn/giphy.gif" alt="Gaming Crewmate" class="surprise-gif">
                    <div class="game-message">
                        🎮 Click here to play the Among Us Jump Game! 🎮
                    </div>
                    <a href="game.html" class="game-link">Play Game!</a>
                </div>
            `
        },
        link: "https://www.youtube.com/watch?v=nZBJnSvGAf0",
        linkText: "Silly Among Us Dance"
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

// Add this new array for daily celebration GIFs
const dailyCelebrationGifs = [
    // Day 1
    {
        gif1: "https://media.giphy.com/media/l0HlGVD6AsbobSTe0/giphy.gif",
        gif2: "https://media.giphy.com/media/26u4cqiYI30juCOGY/giphy.gif",
        gif3: "https://media.giphy.com/media/3oz8xAFtqoOUUrsh7W/giphy.gif",
        gif4: "https://media.giphy.com/media/g9582DNuQppxC/giphy.gif"
    },
    // Day 2
    {
        gif1: "https://media.giphy.com/media/l0HlGVD6AsbobSTe0/giphy.gif",
        gif2: "https://media.giphy.com/media/QvvVchqUIZ31QBQGwg/giphy.gif",
        gif3: "https://media.giphy.com/media/lMameLIF8voLu8HxWV/giphy.gif",
        gif4: "https://media.giphy.com/media/dZX3AduGrY3uJ7qCsx/giphy.gif"
    },
    // Day 3
    {
        gif1: "https://media.giphy.com/media/l0HlGVD6AsbobSTe0/giphy.gif",
        gif2: "https://media.giphy.com/media/IwAZ6dvvvaTtdI8SD5/giphy.gif",
        gif3: "https://media.giphy.com/media/3oKIPf3C7HqqYBVcCY/giphy.gif",
        gif4: "https://media.giphy.com/media/l4q8cJzGdR9J8w3hS/giphy.gif"
    },
    // Day 4
    {
        gif1: "https://media.giphy.com/media/l0HlGVD6AsbobSTe0/giphy.gif",
        gif2: "https://media.giphy.com/media/LSvB8JdEf4yascdXf1/giphy.gif",
        gif3: "https://media.giphy.com/media/3oz8xPyx3qgq5jAmMo/giphy.gif",
        gif4: "https://media.giphy.com/media/26BRv0ThflsHCqDrG/giphy.gif"
    },
    // Day 5
    {
        gif1: "https://media.giphy.com/media/l0HlGVD6AsbobSTe0/giphy.gif",
        gif2: "https://media.giphy.com/media/l2JhL0Gpfbvs4Y07K/giphy.gif",
        gif3: "https://media.giphy.com/media/Q8IYWnnogTYM5T6Yo0/giphy.gif",
        gif4: "https://media.giphy.com/media/l4q8cJzGdR9J8w3hS/giphy.gif"
    },
    // Day 6
    {
        gif1: "https://media.giphy.com/media/l0HlGVD6AsbobSTe0/giphy.gif",
        gif2: "https://media.giphy.com/media/3o7TKDEhaXOzP13ETS/giphy.gif",
        gif3: "https://media.giphy.com/media/l4HodBpDmoMA5p9bG/giphy.gif",
        gif4: "https://media.giphy.com/media/26u4b45b8KlgAB7iM/giphy.gif"
    },
    // Day 7
    {
        gif1: "https://media.giphy.com/media/l0HlGVD6AsbobSTe0/giphy.gif",
        gif2: "https://media.giphy.com/media/5GoVLqeAOo6PK/giphy.gif",
        gif3: "https://media.giphy.com/media/QWvra259h4LCvdJnxP/giphy.gif",
        gif4: "https://media.giphy.com/media/U4DswrBiaz0p67ZweH/giphy.gif"
    },
    // Day 8 (Final Day)
    {
        gif1: "https://media.giphy.com/media/l0HlGVD6AsbobSTe0/giphy.gif",
        gif2: "https://media.giphy.com/media/TdfyKrN7HGTIY/giphy.gif",
        gif3: "https://media.giphy.com/media/6brH8dM3zeMyA/giphy.gif",
        gif4: "https://media.giphy.com/media/2gtoSIzdrSMFO/giphy.gif"
    }
];

// Main login function
function checkLogin() {
    const username = document.getElementById('username').value;
    if (username.toLowerCase() === 'onizuka') {
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
    } else {
        alert('Please enter the correct username!');
    }
}

function calculateDaysCompleted() {
    // Get current time in GMT+2
    const now = new Date();
    const gmt2Offset = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
    const nowGMT2 = new Date(now.getTime() + gmt2Offset);

    // Calculate days completed (starting with 1 since first day is done)
    return 1; // Fixed at 1 since only first day is completed
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

    // Update motivation text based on progress
    updateMotivationText(daysCompleted);
}

function updateMotivationText(daysCompleted) {
    const motivationText = document.querySelector('.motivation-text');
    motivationText.innerHTML = `
        <h2>You're doing amazing! 💪</h2>
        <p>You've completed ${daysCompleted} day, showing incredible strength!</p>
        <p>Keep going, you've got this! 🌟</p>
    `;
}

function startCountdown() {
    function updateCountdown() {
        const now = new Date();
        const gmt2Offset = 2 * 60 * 60 * 1000;
        const nowGMT2 = new Date(now.getTime() + gmt2Offset);

        // Calculate next milestone (today at 10 PM GMT+2)
        const nextMilestone = new Date();
        nextMilestone.setUTCHours(20, 0, 0, 0); // 22:00 GMT+2 = 20:00 UTC

        // If we're past today's 10 PM, set for next day
        if (nowGMT2 > nextMilestone) {
            nextMilestone.setDate(nextMilestone.getDate() + 1);
        }
        const diff = nextMilestone - now;

        // Convert to hours, minutes, seconds
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        // Update the countdown display
        document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
        document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
        document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');

        // Update progress
        updateProgress();
        updateDailyContent();
    }
    // Update immediately and then every second
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

function updateQuote() {
    const quote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
    document.getElementById('quote-text').textContent = `"${quote.text}"`;
    document.getElementById('quote-author').textContent = `- ${quote.author}`;
}

function showEncouragement() {
    const message = encouragementMessages[Math.floor(Math.random() * encouragementMessages.length)];
    alert(message);
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
    });
}

// Add event listener for Enter key on username input
document.addEventListener('DOMContentLoaded', function() {
    const usernameInput = document.getElementById('username');
    usernameInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            checkLogin();
        }
    });

    // Add preview button to login section
    const previewButton = document.createElement('button');
    previewButton.onclick = showPreviewMode;
    previewButton.className = 'preview-button';
    previewButton.textContent = 'Preview Days';
    previewButton.style.marginLeft = '10px';
    document.querySelector('.login-form').appendChild(previewButton);
});

// Update quote every day
setInterval(updateQuote, 24 * 60 * 60 * 1000);

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
    document.querySelector('.daily-quote').addEventListener('dblclick', () => {
        const quote = document.querySelector('.daily-quote');
        quote.style.transform = 'scale(1.05)';
        quote.style.transition = 'transform 0.3s';
        setTimeout(() => {
            quote.style.transform = 'scale(1)';
        }, 300);
    });
}

// Add this function to update Among Us and Book content
function updateDailyContent() {
    const daysCompleted = calculateDaysCompleted();
    const amongUsDiv = document.getElementById('amongus-content');
    const bookDiv = document.getElementById('book-content');

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
    bookDiv.innerHTML = `
        <p>${bookDay.emoji} "${bookDay.quote}"</p>
        <p style="color: #F472B6; margin-top: 0.5rem;">- ${bookDay.author}</p>
    `;

    // Update celebration GIFs
    updateCelebrationGifs(daysCompleted);
}

// Preview mode functions
let isPreviewMode = false;
let originalDay = 1;

function showPreviewMode() {
    document.getElementById('login-section').classList.add('hidden');
    document.getElementById('preview-section').classList.remove('hidden');
    document.getElementById('celebration-section').classList.remove('hidden');
    
    // Add preview mode indicator
    const indicator = document.createElement('div');
    indicator.className = 'preview-mode';
    indicator.textContent = '👀 Preview Mode';
    document.body.appendChild(indicator);
}

function previewDay(day) {
    isPreviewMode = true;
    if (!originalDay) {
        originalDay = calculateDaysCompleted();
    }
    const originalCalculate = calculateDaysCompleted;
    calculateDaysCompleted = () => day;
    updateProgress();
    updateDailyContent();
    updateCelebrationGifs(day);
    calculateDaysCompleted = originalCalculate;
}

function exitPreview() {
    isPreviewMode = false;
    document.getElementById('preview-section').classList.add('hidden');
    document.getElementById('celebration-section').classList.add('hidden');
    document.getElementById('login-section').classList.remove('hidden');
    
    const indicator = document.querySelector('.preview-mode');
    if (indicator) {
        indicator.remove();
    }
}

// Add some fun interaction for day 6
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') {
        const crewmate = document.querySelector('.pixel-crewmate');
        if (crewmate) {
            crewmate.style.animation = 'none';
            crewmate.offsetHeight; // Trigger reflow
            crewmate.style.animation = 'jump 0.5s ease';
            
            // Add a little confetti when jumping
            confetti({
                particleCount: 20,
                spread: 30,
                origin: { y: 0.7 },
                colors: ['#F472B6', '#3B82F6']
            });
        }
    }
});

// Add this CSS for the game surprise
const styles = `
    .game-surprise {
        margin-top: 2rem;
        text-align: center;
        background: rgba(0, 0, 0, 0.8);
        padding: 20px;
        border-radius: 10px;
    }

    .pixel-crewmate {
        margin: 1rem auto;
        cursor: pointer;
        width: 100px;
        height: 100px;
        position: relative;
    }

    .pixel-crewmate img {
        width: 100%;
        height: 100%;
        object-fit: contain;
    }

    .game-message {
        color: #F472B6;
        margin-top: 1rem;
        font-family: 'Courier New', monospace;
        animation: blink 1s infinite;
        font-weight: bold;
    }

    @keyframes jump {
        0% { transform: translateY(0); }
        50% { transform: translateY(-50px); }
        100% { transform: translateY(0); }
    }

    @keyframes blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
    }

    .game-link {
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

    .game-link:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(244, 114, 182, 0.3);
    }

    .surprise-gif {
        width: 150px;
        height: 150px;
        margin: 1rem auto;
        display: block;
    }
`;

// Add the styles to the document
const styleSheet = document.createElement("style");
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

// Add this function to update celebration GIFs
function updateCelebrationGifs(day) {
    const celebrationDiv = document.querySelector('.celebration-images');
    const dayGifs = dailyCelebrationGifs[day - 1];
    celebrationDiv.innerHTML = `
        <img src="${dayGifs.gif1}" alt="Celebration" />
        <img src="${dayGifs.gif2}" alt="Success" />
        <img src="${dayGifs.gif3}" alt="Motivation" />
        <img src="${dayGifs.gif4}" alt="Stars" />
    `;
} 
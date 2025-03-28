const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const resultScreen = document.getElementById('result-screen');

const startButton = document.getElementById('start-button');
const rematchButton = document.getElementById('rematch-button');
const restartButton = document.getElementById('restart-button');
const penaltyToggle = document.getElementById('penalty-mode');

const score1Display = document.getElementById('score1');
const score2Display = document.getElementById('score2');
const finalScore1 = document.getElementById('final-score1');
const finalScore2 = document.getElementById('final-score2');
const resultMessage = document.getElementById('result-message');
const timerDisplay = document.getElementById('timer');

const player1Zone = document.getElementById('player1');
const player2Zone = document.getElementById('player2');

const tapSound = document.getElementById('tap-sound');
const errorSound = document.getElementById('error-sound');
const endSound = document.getElementById('end-sound');

// Add configuration section after initial variables
const CONFIG = {
  gameDuration: 30,
  dotSize: 50,
  dotTimeout: 3000,
  countdownTime: 3
};

let gameDuration = CONFIG.gameDuration;
let countdownInterval;
let currentTime;
let score1 = 0;
let score2 = 0;
let penaltyMode = false;

function getRandomPosition(zone) {
  const zoneRect = zone.getBoundingClientRect();
  const size = CONFIG.dotSize;
  const radius = size / 2;
  
  // Create a buffer zone equal to the dot's radius to prevent partial circles
  // This ensures dots are fully contained within the player's zone
  const isVertical = gameScreen.classList.contains('vertical');
  
  let x, y;
  
  // Adjust the available area to ensure dots are fully visible
  const availableWidth = zoneRect.width - size;
  const availableHeight = zoneRect.height - size;
  
  // Position dots within the safe area (buffer from edges)
  if (!isVertical) {
    // In horizontal layout (left/right)
    x = Math.floor(Math.random() * availableWidth + radius);
    y = Math.floor(Math.random() * availableHeight + radius);
  } else {
    // In vertical layout (up/down)
    x = Math.floor(Math.random() * availableWidth + radius);
    y = Math.floor(Math.random() * availableHeight + radius);
  }
  
  return { x, y };
}

// Improved sound playing function with better error handling
function playSound(sound, force = false) {
  // Only play sound if it's not already playing or if force=true
  if (sound.paused || force) {
    sound.currentTime = 0;
    const playPromise = sound.play();
    
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.log("Sound play error:", error);
        // Handle autoplay restrictions
        if (error.name === "NotAllowedError") {
          console.log("Sound autoplay restricted. User interaction required.");
        }
      });
    }
  }
}

function spawnDot(playerZone, playerNumber) {
  const dot = document.createElement('div');
  dot.classList.add('dot');
  const { x, y } = getRandomPosition(playerZone);
  
  // Position dot at the calculated coordinates
  dot.style.left = `${x}px`;
  dot.style.top = `${y}px`;

  // Store dot timeout reference so we can clear it if needed
  let dotTimeout;

  function handleTouch(e) {
    e.stopPropagation();
    e.preventDefault();

    // Clear dot timeout to prevent error sound
    if (dotTimeout) {
      clearTimeout(dotTimeout);
    }

    if (playerNumber === 1) {
      score1++;
      score1Display.textContent = score1;
    } else {
      score2++;
      score2Display.textContent = score2;
    }

    // Use improved sound playing function
    playSound(tapSound, true);

    playerZone.removeChild(dot);
    spawnDot(playerZone, playerNumber);
  }

  // Add mouse click support for desktop testing
  dot.addEventListener('click', handleTouch);
  dot.addEventListener('touchstart', handleTouch, { passive: false });

  // Add timeout animation class but don't play error sound
  dotTimeout = setTimeout(() => {
    if (playerZone.contains(dot)) {
      dot.classList.add('timeout');
      setTimeout(() => {
        if (playerZone.contains(dot)) {
          playerZone.removeChild(dot);
          spawnDot(playerZone, playerNumber);
        }
      }, 300);
    }
  }, CONFIG.dotTimeout - 300);

  playerZone.appendChild(dot);
}

function startGame() {
  // Get selected game duration
  const durationRadios = document.getElementsByName('game-duration');
  let selectedDuration = CONFIG.gameDuration; // Default value
  
  for (const radio of durationRadios) {
    if (radio.checked) {
      if (radio.value === 'custom') {
        selectedDuration = parseInt(document.getElementById('custom-duration').value);
        // Ensure custom value is within valid range
        selectedDuration = Math.min(Math.max(selectedDuration, 5), 300);
      } else {
        selectedDuration = parseInt(radio.value);
      }
      break;
    }
  }
  
  // Update CONFIG
  CONFIG.gameDuration = selectedDuration;
  
  // Apply screen orientation
  const isVertical = document.querySelector('input[name="screen-orientation"]:checked').value === 'vertical';
  if (isVertical) {
    gameScreen.classList.add('vertical');
  } else {
    gameScreen.classList.remove('vertical');
  }
  
  // Start with countdown sequence
  startScreen.classList.remove('active');
  gameScreen.classList.add('active');
  
  let countdown = CONFIG.countdownTime;
  timerDisplay.textContent = countdown;
  timerDisplay.classList.add('countdown');
  
  // Ensure sounds are loaded and ready
  tapSound.load();
  errorSound.load();
  endSound.load();
  
  const countdownTimer = setInterval(() => {
    countdown--;
    if (countdown > 0) {
      timerDisplay.textContent = countdown;
    } else {
      timerDisplay.textContent = 'GO!';
      setTimeout(() => {
        timerDisplay.classList.remove('countdown');
        initializeGame();
      }, 1000);
      clearInterval(countdownTimer);
    }
  }, 1000);
}

function initializeGame() {
  score1 = 0;
  score2 = 0;
  currentTime = CONFIG.gameDuration;
  timerDisplay.textContent = currentTime;
  penaltyMode = penaltyToggle.checked;

  // Fix score elements handling
  // Clear all contents except score elements
  const playerElements = document.querySelectorAll('.player-zone');
  playerElements.forEach(zone => {
    // Remove all child elements except scores
    Array.from(zone.children).forEach(child => {
      if (!child.classList.contains('score')) {
        zone.removeChild(child);
      }
    });
  });
  
  // Make sure score displays are updated
  score1Display.textContent = score1;
  score2Display.textContent = score2;

  // Spawn dots
  spawnDot(player1Zone, 1);
  spawnDot(player2Zone, 2);

  // Remove existing penalty listeners before adding new ones
  player1Zone.removeEventListener('touchstart', handlePenaltyTouch);
  player2Zone.removeEventListener('touchstart', handlePenaltyTouch);
  
  if (penaltyMode) {
    player1Zone.addEventListener('touchstart', handlePenaltyTouch);
    player2Zone.addEventListener('touchstart', handlePenaltyTouch);
  }

  countdownInterval = setInterval(() => {
    currentTime--;
    timerDisplay.textContent = currentTime;
    if (currentTime <= 0) {
      endGame();
    }
  }, 1000);
}

function handlePenaltyTouch(e) {
  const target = e.target;
  // Only apply penalty if:
  // 1. The touch is not on a dot
  // 2. The player has a positive score to subtract from
  if (!target.classList.contains('dot')) {
    if (e.currentTarget === player1Zone && score1 > 0) {
      score1--;
      // Keep the error sound only for penalties
      playSound(errorSound, true);
      score1Display.textContent = score1;
    } else if (e.currentTarget === player2Zone && score2 > 0) {
      score2--;
      // Keep the error sound only for penalties
      playSound(errorSound, true);
      score2Display.textContent = score2;
    }
  }
}

function endGame() {
  // Remove penalty listeners
  player1Zone.removeEventListener('touchstart', handlePenaltyTouch);
  player2Zone.removeEventListener('touchstart', handlePenaltyTouch);
  
  clearInterval(countdownInterval);
  gameScreen.classList.remove('active');
  resultScreen.classList.add('active');
  finalScore1.textContent = score1;
  finalScore2.textContent = score2;

  if (score1 > score2) {
    resultMessage.textContent = 'Player 1 Wins!';
  } else if (score2 > score1) {
    resultMessage.textContent = 'Player 2 Wins!';
  } else {
    resultMessage.textContent = "It's a Tie!";
  }

  // Use improved sound playing function
  playSound(endSound);
}

startButton.addEventListener('click', startGame);
rematchButton.addEventListener('click', startGame);
restartButton.addEventListener('click', () => {
  location.reload();
});

const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const resultScreen = document.getElementById('result-screen');

const startButton = document.getElementById('start-button');
const rematchButton = document.getElementById('rematch-button');
const restartButton = document.getElementById('restart-button');

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

const CONFIG = {
  gameDuration: 30,
  dotSize: 50,
  dotTimeout: 3000,
  countdownTime: 3,
  gameMode: 'classic' // Default game mode
};

// Add game state management after CONFIG
const GAME_STATE = {
  isRunning: false,
  isSettingUp: false,
  soundsLoaded: false
};

let gameDuration = CONFIG.gameDuration;
let countdownInterval;
let currentTime;
let score1 = 0;
let score2 = 0;
let activeDots = [];

function getRandomPosition(zone) {
  const zoneRect = zone.getBoundingClientRect();
  const size = CONFIG.dotSize;
  const radius = size / 2;

  const BUFFER = {
    edge: radius + 10,
    center: 40,
    score: 60
  };

  const isVertical = gameScreen.classList.contains('vertical');
  const scoreElement = zone.querySelector('.score');
  const scoreRect = scoreElement.getBoundingClientRect();

  const relativeScoreCenter = {
    x: scoreRect.left - zoneRect.left + (scoreRect.width / 2),
    y: scoreRect.top - zoneRect.top + (scoreRect.height / 2)
  };

  const boundaries = {
    minX: BUFFER.edge,
    maxX: zoneRect.width - BUFFER.edge,
    minY: BUFFER.edge,
    maxY: zoneRect.height - BUFFER.edge
  };

  if (isVertical) {
    if (zone.id === 'player1') {
      boundaries.maxY = zoneRect.height - BUFFER.center;
    } else {
      boundaries.minY = BUFFER.center;
    }
  } else {
    if (zone.id === 'player1') {
      boundaries.maxX = zoneRect.width - BUFFER.center;
    } else {
      boundaries.minX = BUFFER.center;
    }
  }

  if (boundaries.maxX - boundaries.minX < size || boundaries.maxY - boundaries.minY < size) {
    console.warn('Not enough space to place dots after applying buffers');
    return {
      x: boundaries.minX + (boundaries.maxX - boundaries.minX) / 2,
      y: boundaries.minY + (boundaries.maxY - boundaries.minY) / 2
    };
  }

  let x, y, distanceFromScore;
  let attempts = 0;
  const MAX_ATTEMPTS = 50;

  do {
    x = Math.floor(Math.random() * (boundaries.maxX - boundaries.minX) + boundaries.minX);
    y = Math.floor(Math.random() * (boundaries.maxY - boundaries.minY) + boundaries.minY);
    attempts++;

    distanceFromScore = Math.sqrt(
      Math.pow(x - relativeScoreCenter.x, 2) +
      Math.pow(y - relativeScoreCenter.y, 2)
    );

    if (distanceFromScore > BUFFER.score) {
      break;
    }

    if (attempts >= MAX_ATTEMPTS) {
      console.warn('Max attempts reached when placing dot. Using best available position.');
      break;
    }
  } while (true);

  return { x, y };
}

function preloadSounds() {
  const sounds = [tapSound, errorSound, endSound];
  sounds.forEach(sound => {
    sound.load();
    sound.preload = 'auto';
    sound.addEventListener('error', (e) => {
      console.error(`Error loading sound: ${sound.src}`, e);
    });
  });
  console.log('Game sounds preloaded');
}

function playSound(sound, force = false) {
  if (sound.paused || force) {
    sound.currentTime = 0;
    const playPromise = sound.play();

    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.log("Sound play error:", error);
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

  dot.style.left = `${x}px`;
  dot.style.top = `${y}px`;

  let dotTimeout;

  function handleTouch(e) {
    e.stopPropagation();
    e.preventDefault();

    if (dotTimeout) {
      clearTimeout(dotTimeout);
    }

    const scoreDisplay = playerNumber === 1 ? score1Display : score2Display;
    scoreDisplay.classList.add('score-changed');
    setTimeout(() => scoreDisplay.classList.remove('score-changed'), 300);

    if (playerNumber === 1) {
      score1++;
      score1Display.textContent = score1;
    } else {
      score2++;
      score2Display.textContent = score2;
    }

    playSound(tapSound, true);
    playerZone.removeChild(dot);
    spawnDot(playerZone, playerNumber);
  }

  dot.addEventListener('click', handleTouch);
  dot.addEventListener('touchstart', handleTouch, { passive: false });

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

function clearActiveDots() {
  for (const dotInfo of activeDots) {
    if (dotInfo.playerZone.contains(dotInfo.dot)) {
      dotInfo.playerZone.removeChild(dotInfo.dot);
    }
  }
  activeDots = [];
}

function setupEventListeners(type, action) {
  if (type === 'penalty') {
    const method = action === 'add' ? 'addEventListener' : 'removeEventListener';
    player1Zone[method]('touchstart', handlePenaltyTouch);
    player2Zone[method]('touchstart', handlePenaltyTouch);
  }
}

function saveUserPreferences() {
  const preferences = {
    gameDuration: CONFIG.gameDuration,
    customDuration: document.getElementById('custom-duration').value,
    gameMode: CONFIG.gameMode,
    orientation: document.querySelector('input[name="screen-orientation"]:checked').value
  };
  
  localStorage.setItem('touchDuelPreferences', JSON.stringify(preferences));
}

function loadUserPreferences() {
  const savedPrefs = localStorage.getItem('touchDuelPreferences');
  
  if (savedPrefs) {
    try {
      const preferences = JSON.parse(savedPrefs);
      
      // Set game duration radio buttons
      const durationRadios = document.getElementsByName('game-duration');
      let durationFound = false;
      
      for (const radio of durationRadios) {
        if (radio.value === String(preferences.gameDuration)) {
          radio.checked = true;
          durationFound = true;
          break;
        }
      }
      
      // If the saved duration doesn't match standard options, use custom
      if (!durationFound && preferences.gameDuration) {
        const customRadio = document.querySelector('input[name="game-duration"][value="custom"]');
        if (customRadio) {
          customRadio.checked = true;
          document.getElementById('custom-duration').value = preferences.customDuration || preferences.gameDuration;
        }
      }
      
      // Set game mode
      if (preferences.gameMode) {
        const gameModeRadio = document.querySelector(`input[name="game-mode"][value="${preferences.gameMode}"]`);
        if (gameModeRadio) {
          gameModeRadio.checked = true;
        }
      }
      
      // Set orientation
      if (preferences.orientation) {
        const orientationRadio = document.querySelector(`input[name="screen-orientation"][value="${preferences.orientation}"]`);
        if (orientationRadio) {
          orientationRadio.checked = true;
        }
      }
      
      // Update CONFIG
      CONFIG.gameDuration = preferences.gameDuration || CONFIG.gameDuration;
      CONFIG.gameMode = preferences.gameMode || CONFIG.gameMode;
      
    } catch (error) {
      console.error("Error loading preferences:", error);
      // If there's an error, we'll just use defaults
    }
  }
}

function startGame() {
  if (GAME_STATE.isSettingUp) return; // Prevent multiple starts
  GAME_STATE.isSettingUp = true;

  const durationRadios = document.getElementsByName('game-duration');
  let selectedDuration = CONFIG.gameDuration;

  for (const radio of durationRadios) {
    if (radio.checked) {
      if (radio.value === 'custom') {
        selectedDuration = parseInt(document.getElementById('custom-duration').value);
        selectedDuration = Math.min(Math.max(selectedDuration, 5), 300);
      } else {
        selectedDuration = parseInt(radio.value);
      }
      break;
    }
  }

  CONFIG.gameDuration = selectedDuration;

  const modeRadios = document.getElementsByName('game-mode');
  for (const radio of modeRadios) {
    if (radio.checked) {
      CONFIG.gameMode = radio.value;
      break;
    }
  }
  
  // Apply screen orientation
  const isVertical = document.querySelector('input[name="screen-orientation"]:checked').value === 'vertical';
  if (isVertical) {
    gameScreen.classList.add('vertical');
  } else {
    gameScreen.classList.remove('vertical');
  }
  
  // Save user preferences
  saveUserPreferences();
  
  // Preload sounds before game starts
  preloadSounds();
  
  // Start with countdown sequence
  startScreen.classList.remove('active');
  gameScreen.classList.add('active');

  let countdown = CONFIG.countdownTime;
  timerDisplay.textContent = countdown;
  timerDisplay.classList.add('countdown');

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
  GAME_STATE.isRunning = true;
  GAME_STATE.isSettingUp = false;

  score1 = 0;
  score2 = 0;
  currentTime = CONFIG.gameDuration;
  timerDisplay.textContent = currentTime;

  const playerElements = document.querySelectorAll('.player-zone');
  playerElements.forEach(zone => {
    Array.from(zone.children).forEach(child => {
      if (!child.classList.contains('score')) {
        zone.removeChild(child);
      }
    });
  });

  score1Display.textContent = score1;
  score2Display.textContent = score2;

  clearActiveDots();

  switch (CONFIG.gameMode) {
    case 'mirror':
      spawnMirrorDots();
      break;
    case 'penalty':
      setupEventListeners('penalty', 'add');
      spawnDot(player1Zone, 1);
      spawnDot(player2Zone, 2);
      break;
    case 'classic':
    default:
      spawnDot(player1Zone, 1);
      spawnDot(player2Zone, 2);
      break;
  }

  countdownInterval = setInterval(() => {
    currentTime--;
    timerDisplay.textContent = currentTime;
    if (currentTime <= 0) {
      endGame();
    }
  }, 1000);
}

function endGame() {
  GAME_STATE.isRunning = false;
  GAME_STATE.isSettingUp = false;

  setupEventListeners('penalty', 'remove');

  clearActiveDots();

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

  playSound(endSound);
}

function handlePenaltyTouch(e) {
  const target = e.target;
  // Only apply penalty if the touch is not on a dot
  if (!target.classList.contains('dot')) {
    // This is an incorrect tap anywhere in the play area
    if (e.currentTarget === player1Zone && score1 > 0) {
      score1--;
      playSound(errorSound, true);
      score1Display.textContent = score1;
    } else if (e.currentTarget === player2Zone && score2 > 0) {
      score2--;
      playSound(errorSound, true);
      score2Display.textContent = score2;
    }
  }
}

function spawnMirrorDots() {
  // Clear any existing dots first
  clearActiveDots();
  
  // Get a position from player 1's zone to use as reference
  const { x: x1, y: y1 } = getRandomPosition(player1Zone);
  
  // Create player 1's dot
  const dot1 = createDot(player1Zone, 1, x1, y1);
  
  // Now create player 2's dot at the equivalent position
  // We need to calculate the relative position in player 2's zone
  const zone1Rect = player1Zone.getBoundingClientRect();
  const zone2Rect = player2Zone.getBoundingClientRect();
  
  let x2, y2;
  
  const isVertical = gameScreen.classList.contains('vertical');
  if (isVertical) {
    // For vertical layout, mirror the Y position relative to the height
    // X position stays proportionally the same
    const relativeX = x1 / zone1Rect.width;
    x2 = relativeX * zone2Rect.width;
    y2 = zone2Rect.height - (y1 / zone1Rect.height * zone2Rect.height);
  } else {
    // For horizontal layout, mirror the X position relative to the width
    // Y position stays proportionally the same
    const relativeY = y1 / zone1Rect.height;
    x2 = zone2Rect.width - (x1 / zone1Rect.width * zone2Rect.width);
    y2 = relativeY * zone2Rect.height;
  }
  
  // Create player 2's dot at the mirrored position
  const dot2 = createDot(player2Zone, 2, x2, y2);
  
  // Store both dots in our tracker
  activeDots = [
    { dot: dot1, playerZone: player1Zone, playerNumber: 1 },
    { dot: dot2, playerZone: player2Zone, playerNumber: 2 }
  ];
}

function createDot(playerZone, playerNumber, x, y) {
  const dot = document.createElement('div');
  dot.classList.add('dot');
  
  // Position dot at the calculated coordinates
  dot.style.left = `${x}px`;
  dot.style.top = `${y}px`;
  
  // Add the touch handler for mirror mode
  function handleMirrorTouch(e) {
    e.stopPropagation();
    e.preventDefault();
    
    // Award point to the player who tapped first
    if (playerNumber === 1) {
      score1++;
      score1Display.textContent = score1;
    } else {
      score2++;
      score2Display.textContent = score2;
    }
    
    // Play the sound
    playSound(tapSound, true);
    
    // Clear the dots and spawn new ones
    clearActiveDots();
    spawnMirrorDots();
  }
  
  // Add event listeners
  dot.addEventListener('click', handleMirrorTouch);
  dot.addEventListener('touchstart', handleMirrorTouch, { passive: false });
  
  // Add dot to player zone
  playerZone.appendChild(dot);
  return dot;
}

startButton.addEventListener('click', startGame);
rematchButton.addEventListener('click', startGame);
restartButton.addEventListener('click', () => {
  location.reload();
});

document.addEventListener('DOMContentLoaded', loadUserPreferences);

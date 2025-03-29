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

const countdownOverlay = document.getElementById('countdown-overlay');
const countdownNumber = document.getElementById('countdown-number');
const tutorialOverlay = document.getElementById('tutorial-overlay');
const closeTutorialButton = document.getElementById('close-tutorial');
const tutorialButton = document.getElementById('tutorial-button');
const vibrationToggle = document.getElementById('vibration-toggle');
const soundToggle = document.getElementById('sound-toggle');
const highContrastToggle = document.getElementById('high-contrast-toggle');

const CONFIG = {
  gameDuration: 30,
  dotSize: 50,
  dotTimeout: 3000,
  countdownTime: 3,
  gameMode: 'classic',
  vibration: true,
  sound: true,
  highContrast: false
};

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
  const timerBand = document.getElementById('timer-band');
  const timerBandRect = timerBand.getBoundingClientRect();

  const BUFFER = {
    edge: Math.max(radius + 15, zoneRect.width * 0.08),
    center: Math.max(50, zoneRect.width * 0.12),
    score: Math.max(70, zoneRect.width * 0.18),
    timer: 15
  };

  const isVertical = gameScreen.classList.contains('vertical');
  const scoreElement = zone.querySelector('.score');
  const scoreRect = scoreElement.getBoundingClientRect();
  
  const relativeScoreCenter = {
    x: scoreRect.left - zoneRect.left + (scoreRect.width / 2),
    y: scoreRect.top - zoneRect.top + (scoreRect.height / 2)
  };

  const relativeTimerBottom = isVertical ? 
    (timerBandRect.bottom - zoneRect.top + BUFFER.timer) : 0;

  const boundaries = {
    minX: BUFFER.edge,
    maxX: zoneRect.width - BUFFER.edge,
    minY: Math.max(BUFFER.edge, relativeTimerBottom),
    maxY: zoneRect.height - BUFFER.edge
  };

  if (isVertical) {
    if (zone.id === 'player1') {
      boundaries.maxY = zoneRect.height - BUFFER.center;
    } else {
      boundaries.minY = Math.max(BUFFER.center, boundaries.minY);
    }
  } else {
    if (zone.id === 'player1') {
      boundaries.maxX = zoneRect.width - BUFFER.center;
    } else {
      boundaries.minX = BUFFER.center;
    }
  }

  if (boundaries.maxX - boundaries.minX < size || boundaries.maxY - boundaries.minY < size) {
    return {
      x: boundaries.minX + (boundaries.maxX - boundaries.minX) / 2,
      y: boundaries.minY + (boundaries.maxY - boundaries.minY) / 2
    };
  }

  let x, y, distanceFromScore;
  let attempts = 0;
  const MAX_ATTEMPTS = 50;

  do {
    x = Math.floor(Math.random() * (boundaries.maxX - boundaries.minX - size) + boundaries.minX + radius);
    y = Math.floor(Math.random() * (boundaries.maxY - boundaries.minY - size) + boundaries.minY + radius);
    attempts++;

    distanceFromScore = Math.sqrt(
      Math.pow(x - relativeScoreCenter.x, 2) +
      Math.pow(y - relativeScoreCenter.y, 2)
    );

    if (distanceFromScore > BUFFER.score) {
      break;
    }

    if (attempts >= MAX_ATTEMPTS) {
      break;
    }
  } while (true);

  return { x, y };
}

function preloadSounds() {
  [tapSound, errorSound, endSound].forEach(sound => {
    sound.load();
    sound.preload = 'auto';
  });
}

function playSound(sound, force = false) {
  if (!CONFIG.sound && !force) return;

  if (sound.paused) {
    sound.currentTime = 0;
    const playPromise = sound.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {});
    }
  }
}

function ensureDotStyling(dot, playerNumber) {
  dot.classList.remove('player1-dot', 'player2-dot');
  dot.classList.add(playerNumber === 1 ? 'player1-dot' : 'player2-dot');
}

function spawnDot(playerZone, playerNumber) {
  const dot = document.createElement('div');
  dot.classList.add('dot');
  
  ensureDotStyling(dot, playerNumber);
  
  const { x, y } = getRandomPosition(playerZone);

  dot.style.left = `${x}px`;
  dot.style.top = `${y}px`;

  let dotTimeout;

  function handleTouch(e) {
    if (!GAME_STATE.isRunning) return;
    
    e.stopPropagation();
    e.preventDefault();

    if (dotTimeout) {
      clearTimeout(dotTimeout);
    }

    playerZone.classList.add('active');
    setTimeout(() => playerZone.classList.remove('active'), 150);

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

    if (CONFIG.vibration) {
      // Use a more subtle haptic for successful taps (Spotify-like)
      safeVibrate(20, 'light');
    }

    playSound(tapSound);
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
    orientation: document.querySelector('input[name="screen-orientation"]:checked').value,
    vibration: CONFIG.vibration,
    sound: CONFIG.sound,
    highContrast: CONFIG.highContrast
  };
  
  localStorage.setItem('touchDuelPreferences', JSON.stringify(preferences));
}

function loadUserPreferences() {
  const savedPrefs = localStorage.getItem('touchDuelPreferences');
  
  if (savedPrefs) {
    try {
      const preferences = JSON.parse(savedPrefs);
      
      const durationRadios = document.getElementsByName('game-duration');
      let durationFound = false;
      
      for (const radio of durationRadios) {
        if (radio.value === String(preferences.gameDuration)) {
          radio.checked = true;
          durationFound = true;
          break;
        }
      }
      
      if (!durationFound && preferences.gameDuration) {
        const customRadio = document.querySelector('input[name="game-duration"][value="custom"]');
        if (customRadio) {
          customRadio.checked = true;
          document.getElementById('custom-duration').value = preferences.customDuration || preferences.gameDuration;
        }
      }
      
      if (preferences.gameMode) {
        const gameModeRadio = document.querySelector(`input[name="game-mode"][value="${preferences.gameMode}"]`);
        if (gameModeRadio) gameModeRadio.checked = true;
      }
      
      if (preferences.orientation) {
        const orientationRadio = document.querySelector(`input[name="screen-orientation"][value="${preferences.orientation}"]`);
        if (orientationRadio) orientationRadio.checked = true;
      }
      
      CONFIG.gameDuration = preferences.gameDuration || CONFIG.gameDuration;
      CONFIG.gameMode = preferences.gameMode || CONFIG.gameMode;

      if (preferences.vibration !== undefined) {
        CONFIG.vibration = preferences.vibration;
        vibrationToggle.checked = CONFIG.vibration;
      }
      
      if (preferences.sound !== undefined) {
        CONFIG.sound = preferences.sound;
        soundToggle.checked = CONFIG.sound;
      }
      
      if (preferences.highContrast !== undefined) {
        CONFIG.highContrast = preferences.highContrast;
        highContrastToggle.checked = CONFIG.highContrast;
        document.body.classList.toggle('high-contrast', CONFIG.highContrast);
      }
    } catch (error) {}
  }
}

function startGame() {
  if (GAME_STATE.isSettingUp) return;
  GAME_STATE.isSettingUp = true;

  document.body.style.overflow = 'hidden';

  const durationRadios = document.getElementsByName('game-duration');
  let selectedDuration = CONFIG.gameDuration;

  for (const radio of durationRadios) {
    if (radio.checked) {
      if (radio.value === 'custom') {
        selectedDuration = parseInt(document.getElementById('custom-duration').value);
        selectedDuration = Math.min(Math.max(selectedDuration, 1), 300);
      } else {
        selectedDuration = parseInt(radio.value);
      }
      break;
    }
  }

  CONFIG.gameDuration = selectedDuration;
  timerDisplay.textContent = selectedDuration;

  const modeRadios = document.getElementsByName('game-mode');
  for (const radio of modeRadios) {
    if (radio.checked) {
      CONFIG.gameMode = radio.value;
      break;
    }
  }
  
  const isVertical = document.querySelector('input[name="screen-orientation"]:checked').value === 'vertical';
  gameScreen.classList.toggle('vertical', isVertical);
  
  CONFIG.vibration = vibrationToggle.checked;
  CONFIG.sound = soundToggle.checked;
  CONFIG.highContrast = highContrastToggle.checked;

  saveUserPreferences();
  preloadSounds();
  
  score1 = 0;
  score2 = 0;
  score1Display.textContent = score1;
  score2Display.textContent = score2;
  
  const playerElements = document.querySelectorAll('.player-zone');
  playerElements.forEach(zone => {
    Array.from(zone.children).forEach(child => {
      if (!child.classList.contains('score')) {
        zone.removeChild(child);
      }
    });
  });
  
  startScreen.classList.remove('active');
  gameScreen.classList.add('active');

  enhancedCountdown();
}

// Update the safeVibrate function to be more subtle
function safeVibrate(pattern, intensity = 'medium') {
  if (!CONFIG.vibration) return;
  
  try {
    // Use more subtle vibration patterns (classic Android style)
    let vibrationPattern;
    
    // Convert pattern to an array if it's a single number
    if (typeof pattern === 'number') {
      // Make durations shorter for subtlety
      switch(intensity) {
        case 'light':
          vibrationPattern = pattern > 20 ? 20 : pattern;
          break;
        case 'heavy':
          vibrationPattern = pattern > 35 ? 35 : pattern;
          break;
        default: // medium
          vibrationPattern = pattern > 25 ? 25 : pattern;
      }
    } else if (Array.isArray(pattern)) {
      // Scale down array patterns for subtlety
      vibrationPattern = pattern.map(duration => 
        Math.min(duration, Math.max(10, Math.floor(duration * 0.7)))
      );
    } else {
      vibrationPattern = 20; // Default subtle vibration
    }
    
    // Try to use advanced haptic feedback if available (future-proofing)
    if (window.navigator.haptics) {
      // This is a forward-looking approach as browsers add haptic APIs
      switch(intensity) {
        case 'light':
          window.navigator.haptics.vibrate('light');
          break;
        case 'heavy':
          window.navigator.haptics.vibrate('medium'); // Downgrade heavy to medium for subtlety
          break;
        default:
          window.navigator.haptics.vibrate('light'); // Downgrade medium to light for subtlety
      }
      return;
    }
    
    // Fall back to standard vibration API with subtle patterns
    navigator.vibrate(vibrationPattern);
  } catch (e) {
    // Silent fallback if vibration API is not available
  }
}

function enhancedCountdown() {
  countdownOverlay.classList.remove('hidden');
  let countdown = CONFIG.countdownTime;
  countdownNumber.textContent = countdown;
  
  // Add initial haptic feedback for "3"
  safeVibrate(20, 'light');
  
  const countdownTimer = setInterval(() => {
    countdown--;
    if (countdown > 0) {
      countdownNumber.textContent = countdown;
      // More subtle haptic for countdown ticks
      safeVibrate(25, countdown === 1 ? 'medium' : 'light');
    } else {
      countdownNumber.textContent = 'GO!';
      // Still relatively strong but more subtle haptic for game start
      safeVibrate([20, 20, 35], 'medium');
      setTimeout(() => {
        countdownOverlay.classList.add('hidden');
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

  // Add subtle end-game haptic feedback
  if (CONFIG.vibration) {
    safeVibrate([15, 15, 30], 'medium');
  }

  setupEventListeners('penalty', 'remove');
  clearActiveDots();
  clearInterval(countdownInterval);
  gameScreen.classList.remove('active');
  resultScreen.classList.add('active');
  
  document.body.style.overflow = '';
  
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
  if (!GAME_STATE.isRunning) return;
  
  const target = e.target;
  if (!target.classList.contains('dot')) {
    if (e.currentTarget === player1Zone && score1 > 0) {
      score1--;
      playSound(errorSound);
      // More subtle error pattern for penalty (Spotify-like)
      safeVibrate([10, 10, 20], 'light');
      score1Display.textContent = score1;
    } else if (e.currentTarget === player2Zone && score2 > 0) {
      score2--;
      playSound(errorSound);
      // More subtle error pattern for penalty (Spotify-like)
      safeVibrate([10, 10, 20], 'light');
      score2Display.textContent = score2;
    }
  }
}

function spawnMirrorDots() {
  clearActiveDots();
  
  const { x: x1, y: y1 } = getRandomPosition(player1Zone);
  const dot1 = createDot(player1Zone, 1, x1, y1);
  
  const zone1Rect = player1Zone.getBoundingClientRect();
  const zone2Rect = player2Zone.getBoundingClientRect();
  
  let x2, y2;
  
  const isVertical = gameScreen.classList.contains('vertical');
  if (isVertical) {
    const relativeX = x1 / zone1Rect.width;
    x2 = relativeX * zone2Rect.width;
    y2 = zone2Rect.height - (y1 / zone1Rect.height * zone2Rect.height);
  } else {
    const relativeY = y1 / zone1Rect.height;
    x2 = zone2Rect.width - (x1 / zone1Rect.width * zone2Rect.width);
    y2 = relativeY * zone2Rect.height;
  }
  
  const dot2 = createDot(player2Zone, 2, x2, y2);
  
  activeDots = [
    { dot: dot1, playerZone: player1Zone, playerNumber: 1 },
    { dot: dot2, playerZone: player2Zone, playerNumber: 2 }
  ];
}

function createDot(playerZone, playerNumber, x, y) {
  const dot = document.createElement('div');
  dot.classList.add('dot');
  
  ensureDotStyling(dot, playerNumber);
  
  if (CONFIG.gameMode === 'mirror') {
    dot.classList.add('mirror-dot');
  }
  
  dot.style.left = `${x}px`;
  dot.style.top = `${y}px`;
  
  function handleMirrorTouch(e) {
    if (!GAME_STATE.isRunning) return;
    
    e.stopPropagation();
    e.preventDefault();
    
    playerZone.classList.add('active');
    setTimeout(() => playerZone.classList.remove('active'), 150);
    
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
    
    // Add subtle haptic feedback for mirror mode
    if (CONFIG.vibration) {
      safeVibrate(20, 'light');
    }
    
    playSound(tapSound);
    
    clearActiveDots();
    spawnMirrorDots();
  }
  
  dot.addEventListener('click', handleMirrorTouch);
  dot.addEventListener('touchstart', handleMirrorTouch, { passive: false });
  
  playerZone.appendChild(dot);
  return dot;
}

function updateTutorialContent() {
  const player1DotExample = tutorialOverlay.querySelector('.dot-example.player1-dot');
  const player2DotExample = tutorialOverlay.querySelector('.dot-example.player2-dot');
  
  if (CONFIG.highContrast) {
    player1DotExample.style.backgroundColor = '#3366ff';
    player1DotExample.style.border = '3px solid white';
    player2DotExample.style.backgroundColor = '#ff3366';
    player2DotExample.style.border = '3px solid white';
  } else {
    player1DotExample.style.backgroundColor = 'var(--player1-color)';
    player1DotExample.style.border = '2px solid rgba(99, 102, 241, 0.7)';
    player2DotExample.style.backgroundColor = 'var(--player2-color)';
    player2DotExample.style.border = '2px solid rgba(236, 72, 153, 0.7)';
  }
  
  tutorialOverlay.setAttribute('data-version', Date.now());
}

function resetGame() {
  gameScreen.classList.remove('active');
  resultScreen.classList.remove('active');
  startScreen.classList.add('active');
  document.body.style.overflow = '';
  updateTimerDisplay();
  updateTutorialContent();
}

function updateTimerDisplay() {
  const durationRadios = document.getElementsByName('game-duration');
  let selectedDuration = CONFIG.gameDuration;

  for (const radio of durationRadios) {
    if (radio.checked) {
      if (radio.value === 'custom') {
        selectedDuration = parseInt(document.getElementById('custom-duration').value);
        selectedDuration = Math.min(Math.max(selectedDuration, 1), 300);
      } else {
        selectedDuration = parseInt(radio.value);
      }
      break;
    }
  }
  
  timerDisplay.textContent = selectedDuration;
}

function showTutorial() {
  updateTutorialContent();
  tutorialOverlay.classList.remove('hidden');
}

function closeTutorial() {
  tutorialOverlay.classList.add('hidden');
}

function toggleHighContrast() {
  CONFIG.highContrast = highContrastToggle.checked;
  document.body.classList.toggle('high-contrast', CONFIG.highContrast);
  saveUserPreferences();
}

// Event listeners
document.querySelectorAll('input[name="game-duration"]').forEach(radio => {
  radio.addEventListener('change', updateTimerDisplay);
});

document.getElementById('custom-duration').addEventListener('input', function(e) {
  const value = this.value;
  if (value.includes('.')) {
    this.value = parseInt(value) || 1;
  }
  
  const customRadio = document.querySelector('input[name="game-duration"][value="custom"]');
  if (customRadio && customRadio.checked) {
    updateTimerDisplay();
  }
});

startButton.addEventListener('click', startGame);
rematchButton.addEventListener('click', startGame);
restartButton.addEventListener('click', resetGame);
tutorialButton.addEventListener('click', showTutorial);
closeTutorialButton.addEventListener('click', closeTutorial);

// Single event listener for each toggle
vibrationToggle.addEventListener('change', () => {
  CONFIG.vibration = vibrationToggle.checked;
  saveUserPreferences();
});

soundToggle.addEventListener('change', () => {
  CONFIG.sound = soundToggle.checked;
  saveUserPreferences();
});

highContrastToggle.addEventListener('change', toggleHighContrast);

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  loadUserPreferences();
  updateTutorialContent();
  updateTimerDisplay();
  document.body.style.overflow = '';
  document.getElementById('close-tutorial').addEventListener('click', closeTutorial);
});

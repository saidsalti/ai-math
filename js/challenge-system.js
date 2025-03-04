// Core Challenge System Logic

// System state
const challengeSystem = {
  currentScreen: 'welcome', // 'welcome', 'challenge', 'results'
  currentChallenge: null,   // Current active challenge
  challenges: {},           // Challenge modules
  playerStats: {
    totalScore: 0,
    starsEarned: 0,
    challengesCompleted: 0,
    currentStreak: 0,
    highScores: {}          // Store high scores for each challenge
  },
  challengeResults: {
    score: 0,
    time: 0,
    correct: 0,
    total: 0,
    stars: 0
  },
  sounds: {},               // Will store sound effects
  paused: false,            // Pause state
  canvasWidth: 600,         // Default canvas width
  canvasHeight: 350         // Default canvas height
};

// DOM elements
let welcomeScreen, challengeScreen, resultsScreen, pauseOverlay;
let challengeCards, backBtn, pauseBtn, resumeBtn, restartBtn, exitBtn;
let retryBtn, nextChallengeBtn, homeBtn;
let progressFill, progressText, timerDisplay, currentScore;
let resultScore, resultTime, resultCorrect, resultStars;
let totalScoreEl, starsEarnedEl, challengesCompletedEl, currentStreakEl;
let challengeTitle, challengeUI;

// Main p5.js canvas instance
let mainCanvas;
let challengeCanvasCreated = false;

// Initialization function - called when the page loads
function setup() {
  // Initialize DOM elements
  welcomeScreen = document.getElementById('welcome-screen');
  challengeScreen = document.getElementById('challenge-screen');
  resultsScreen = document.getElementById('results-screen');
  pauseOverlay = document.getElementById('pause-overlay');
  
  challengeCards = document.querySelectorAll('.challenge-card');
  backBtn = document.getElementById('back-btn');
  pauseBtn = document.getElementById('pause-btn');
  resumeBtn = document.getElementById('resume-btn');
  restartBtn = document.getElementById('restart-btn');
  exitBtn = document.getElementById('exit-btn');
  
  retryBtn = document.getElementById('retry-btn');
  nextChallengeBtn = document.getElementById('next-challenge-btn');
  homeBtn = document.getElementById('home-btn');
  
  progressFill = document.querySelector('.progress-fill');
  progressText = document.getElementById('progress-text');
  timerDisplay = document.getElementById('timer-display');
  currentScore = document.getElementById('current-score');
  
  resultScore = document.getElementById('result-score');
  resultTime = document.getElementById('result-time');
  resultCorrect = document.getElementById('result-correct');
  resultStars = document.querySelectorAll('.big-star');
  
  totalScoreEl = document.getElementById('total-score');
  starsEarnedEl = document.getElementById('stars-earned');
  challengesCompletedEl = document.getElementById('challenges-completed');
  currentStreakEl = document.getElementById('current-streak');
  
  challengeTitle = document.getElementById('challenge-title');
  challengeUI = document.getElementById('challenge-ui');
  
  // Register challenge modules
  challengeSystem.challenges = {
    'time-attack': TimeAttackChallenge,
    'target-number': TargetNumberChallenge,
    'falling-numbers': FallingNumbersChallenge, 
    'pattern-matching': PatternMatchingChallenge
  };
  
  // Load saved player stats from local storage
  loadPlayerStats();
  updateStatsDisplay();
  
  // Add event listeners
  setupEventListeners();
  
  // Create a small placeholder canvas for now (will be replaced when challenge starts)
  noCanvas(); // Remove default canvas
}

// Load player stats from local storage
function loadPlayerStats() {
  const savedStats = localStorage.getItem('multiplicationChallenges');
  if (savedStats) {
    try {
      const stats = JSON.parse(savedStats);
      challengeSystem.playerStats = stats;
    } catch(e) {
      console.error('Error loading saved stats:', e);
    }
  }
}

// Save player stats to local storage
function savePlayerStats() {
  localStorage.setItem('multiplicationChallenges', 
    JSON.stringify(challengeSystem.playerStats));
}

// Set up all event listeners
function setupEventListeners() {
  // Challenge card selection
  challengeCards.forEach(card => {
    card.addEventListener('click', () => {
      const challengeType = card.getAttribute('data-challenge');
      startChallenge(challengeType);
    });
  });
  
  // Navigation buttons
  backBtn.addEventListener('click', returnToWelcome);
  pauseBtn.addEventListener('click', pauseChallenge);
  resumeBtn.addEventListener('click', resumeChallenge);
  restartBtn.addEventListener('click', restartChallenge);
  exitBtn.addEventListener('click', exitChallenge);
  
  // Result screen buttons
  retryBtn.addEventListener('click', retryChallenge);
  nextChallengeBtn.addEventListener('click', goToNextChallenge);
  homeBtn.addEventListener('click', returnToWelcome);
}

// Start a new challenge
function startChallenge(challengeType) {
  // Set the current challenge
  if (!challengeSystem.challenges[challengeType]) {
    console.error('Unknown challenge type:', challengeType);
    return;
  }
  
  challengeSystem.currentChallenge = challengeType;
  
  // Switch to the challenge screen
  showScreen('challenge');
  
  // Set the challenge title
  const titles = {
    'time-attack': 'تحدي الوقت',
    'target-number': 'العدد المستهدف',
    'falling-numbers': 'الأرقام المتساقطة',
    'pattern-matching': 'أنماط الضرب'
  };
  challengeTitle.textContent = titles[challengeType];
  
  // Clear the challenge UI
  challengeUI.innerHTML = '';
  
  // Reset challenge results
  challengeSystem.challengeResults = {
    score: 0,
    time: 0,
    correct: 0,
    total: 0,
    stars: 0
  };
  currentScore.textContent = '0';
  
  // Initialize the challenge module
  const challengeModule = challengeSystem.challenges[challengeType];
  if (typeof challengeModule.initialize === 'function') {
    challengeModule.initialize();
  }
}

// Show a specific screen (welcome, challenge, or results)
function showScreen(screenName) {
  welcomeScreen.classList.add('hidden');
  challengeScreen.classList.add('hidden');
  resultsScreen.classList.add('hidden');
  pauseOverlay.classList.add('hidden');
  
  if (screenName === 'welcome') {
    welcomeScreen.classList.remove('hidden');
    challengeSystem.currentScreen = 'welcome';
  } else if (screenName === 'challenge') {
    challengeScreen.classList.remove('hidden');
    challengeSystem.currentScreen = 'challenge';
  } else if (screenName === 'results') {
    resultsScreen.classList.remove('hidden');
    challengeSystem.currentScreen = 'results';
  }
}

// Update challenge progress
function updateProgress(current, total) {
  const percentage = Math.min(100, Math.max(0, (current / total) * 100));
  progressFill.style.width = percentage + '%';
  progressText.textContent = current + '/' + total;
}

// End the current challenge and show results
function endChallenge(results) {
  // Set the challenge results
  challengeSystem.challengeResults = results;
  
  // Update player stats
  challengeSystem.playerStats.totalScore += results.score;
  challengeSystem.playerStats.starsEarned += results.stars;
  challengeSystem.playerStats.challengesCompleted++;
  
  // Save high score if applicable
  const challengeType = challengeSystem.currentChallenge;
  if (!challengeSystem.playerStats.highScores[challengeType] || 
      results.score > challengeSystem.playerStats.highScores[challengeType]) {
    challengeSystem.playerStats.highScores[challengeType] = results.score;
  }
  
  // Save the updated stats
  savePlayerStats();
  
  // Display results
  resultScore.textContent = results.score;
  resultTime.textContent = formatTime(results.time);
  resultCorrect.textContent = results.correct + '/' + results.total;
  
  // Animate stars
  setTimeout(() => {
    for (let i = 0; i < resultStars.length; i++) {
      if (i < results.stars) {
        setTimeout(() => {
          resultStars[i].classList.add('earned');
        }, i * 500);
      } else {
        resultStars[i].classList.remove('earned');
      }
    }
  }, 500);
  
  // Show the results screen
  showScreen('results');
  
  // Update welcome screen stats display
  updateStatsDisplay();
}

// Format seconds into MM:SS
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return (mins < 10 ? '0' : '') + mins + ':' + (secs < 10 ? '0' : '') + secs;
}

// Update the stats display on the welcome screen
function updateStatsDisplay() {
  totalScoreEl.textContent = challengeSystem.playerStats.totalScore;
  starsEarnedEl.textContent = challengeSystem.playerStats.starsEarned;
  challengesCompletedEl.textContent = challengeSystem.playerStats.challengesCompleted;
  currentStreakEl.textContent = challengeSystem.playerStats.currentStreak;
}

// Pause the current challenge
function pauseChallenge() {
  challengeSystem.paused = true;
  pauseOverlay.classList.remove('hidden');
  
  // Pause the challenge module if it has a pause method
  const challengeModule = challengeSystem.challenges[challengeSystem.currentChallenge];
  if (typeof challengeModule.pause === 'function') {
    challengeModule.pause();
  }
}

// Resume the challenge
function resumeChallenge() {
  challengeSystem.paused = false;
  pauseOverlay.classList.add('hidden');
  
  // Resume the challenge module if it has a resume method
  const challengeModule = challengeSystem.challenges[challengeSystem.currentChallenge];
  if (typeof challengeModule.resume === 'function') {
    challengeModule.resume();
  }
}

// Restart the current challenge
function restartChallenge() {
  pauseOverlay.classList.add('hidden');
  challengeSystem.paused = false;
  
  // Start the same challenge again
  startChallenge(challengeSystem.currentChallenge);
}

// Exit the challenge and return to welcome screen
function exitChallenge() {
  pauseOverlay.classList.add('hidden');
  challengeSystem.paused = false;
  returnToWelcome();
}

// Return to welcome screen
function returnToWelcome() {
  showScreen('welcome');
  
  // Cleanup any running challenge
  const challengeModule = challengeSystem.challenges[challengeSystem.currentChallenge];
  if (typeof challengeModule.cleanup === 'function') {
    challengeModule.cleanup();
  }
}

// Retry the current challenge
function retryChallenge() {
  showScreen('challenge');
  startChallenge(challengeSystem.currentChallenge);
}

// Go to next challenge
function goToNextChallenge() {
  const challengeTypes = Object.keys(challengeSystem.challenges);
  const currentIndex = challengeTypes.indexOf(challengeSystem.currentChallenge);
  const nextIndex = (currentIndex + 1) % challengeTypes.length;
  
  showScreen('challenge');
  startChallenge(challengeTypes[nextIndex]);
}

// Create a utility function for creating common UI elements
function createChallengeUI(template) {
  challengeUI.innerHTML = template;
  return {
    get: (id) => document.getElementById(id),
    getAll: (selector) => document.querySelectorAll(selector)
  };
}

// Make this globally accessible
window.challengeSystem = challengeSystem;
window.updateProgress = updateProgress;
window.endChallenge = endChallenge;
window.createChallengeUI = createChallengeUI;